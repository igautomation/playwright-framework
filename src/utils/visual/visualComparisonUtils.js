/**
 * Visual comparison utilities for Playwright tests
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const config = require('../../config');

// Try to load pixelmatch, provide fallback if not available
let pixelmatch;
try {
  pixelmatch = require('pixelmatch');
} catch (e) {
  console.warn('Failed to load pixelmatch:', e.message);
  // Provide a fallback implementation if the module is not available
  pixelmatch = function(img1, img2, output, width, height, options) {
    // Simple implementation that just counts different pixels
    let diffCount = 0;
    for (let i = 0; i < img1.length; i += 4) {
      if (Math.abs(img1[i] - img2[i]) > (options.threshold * 255) ||
          Math.abs(img1[i+1] - img2[i+1]) > (options.threshold * 255) ||
          Math.abs(img1[i+2] - img2[i+2]) > (options.threshold * 255)) {
        diffCount++;
        // Mark the pixel as different in the output
        if (output) {
          output[i] = 255;   // R
          output[i+1] = 0;   // G
          output[i+2] = 0;   // B
          output[i+3] = 255; // A
        }
      } else if (output) {
        // Copy the original pixel
        output[i] = img1[i];
        output[i+1] = img1[i+1];
        output[i+2] = img1[i+2];
        output[i+3] = img1[i+3];
      }
    }
    return diffCount;
  };
}

// Check if we should update baselines automatically
const shouldUpdateBaselines = () => {
  return process.env.VISUAL_UPDATE_BASELINES === 'true' || 
         process.env.PLAYWRIGHT_VISUAL_UPDATE_BASELINES === 'true' || 
         config.visual?.updateBaselines === true;
};

/**
 * Utilities for visual comparison testing
 */
class VisualComparisonUtils {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   * @param {Object} options - Configuration options
   */
  constructor(page, options = {}) {
    this.page = page;
    this.baselineDir = options.baselineDir || config.visual?.baselineDir || 'visual-baselines';
    this.diffDir = options.diffDir || config.visual?.diffDir || 'visual-diffs';
    this.threshold = options.threshold || config.visual?.threshold || 0.1;
    this.matchThreshold = options.matchThreshold || config.visual?.matchThreshold || 0.1;
    this.updateBaselines = options.updateBaselines || shouldUpdateBaselines();
    this.ignoreRegions = options.ignoreRegions || [];
    
    // Create directories if they don't exist
    if (!fs.existsSync(this.baselineDir)) {
      fs.mkdirSync(this.baselineDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.diffDir)) {
      fs.mkdirSync(this.diffDir, { recursive: true });
    }
  }
  
  /**
   * Take a screenshot and compare with baseline
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<Object>} Comparison results
   */
  async compareScreenshot(name, options = {}) {
    try {
      // Generate screenshot paths
      const baselinePath = path.join(this.baselineDir, `${name}.png`);
      const actualPath = path.join(this.diffDir, `${name}-actual.png`);
      const diffPath = path.join(this.diffDir, `${name}-diff.png`);
      
      // Take screenshot
      await this.page.screenshot({
        path: actualPath,
        fullPage: options.fullPage || false,
        ...options
      });
      
      // If baseline doesn't exist, create it
      if (!fs.existsSync(baselinePath)) {
        fs.copyFileSync(actualPath, baselinePath);
        console.log(`Created baseline screenshot: ${baselinePath}`);
        
        return {
          name,
          baselineCreated: true,
          match: true,
          baselinePath,
          actualPath
        };
      }
      
      // Load images
      const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
      const actual = PNG.sync.read(fs.readFileSync(actualPath));
      
      // Check dimensions
      if (baseline.width !== actual.width || baseline.height !== actual.height) {
        console.warn(`Screenshot dimensions mismatch for ${name}: baseline (${baseline.width}x${baseline.height}) vs actual (${actual.width}x${actual.height})`);
        
        // If auto-update is enabled, update the baseline with the new dimensions
        if (this.updateBaselines) {
          console.log(`Updating baseline due to dimension mismatch for ${name}`);
          fs.copyFileSync(actualPath, baselinePath);
          
          return {
            name,
            baselineUpdated: true,
            match: true,
            dimensionMismatch: true,
            baselineDimensions: {
              width: baseline.width,
              height: baseline.height
            },
            actualDimensions: {
              width: actual.width,
              height: actual.height
            },
            baselinePath,
            actualPath
          };
        }
        
        return {
          name,
          match: false,
          dimensionMismatch: true,
          baselineDimensions: {
            width: baseline.width,
            height: baseline.height
          },
          actualDimensions: {
            width: actual.width,
            height: actual.height
          },
          baselinePath,
          actualPath,
          diffPath
        };
      }
      
      // Apply ignore regions if specified
      const ignoreRegions = options.ignoreRegions || this.ignoreRegions;
      if (ignoreRegions && ignoreRegions.length > 0) {
        this._applyIgnoreRegions(baseline.data, actual.data, baseline.width, baseline.height, ignoreRegions);
      }
      
      // Create diff image
      const { width, height } = baseline;
      const diffImage = new PNG({ width, height });
      
      // Compare images
      const threshold = options.threshold || this.threshold;
      const diffPixels = pixelmatch(
        baseline.data, 
        actual.data, 
        diffImage.data, 
        width, 
        height, 
        { threshold }
      );
      
      // Calculate diff percentage
      const diffPercentage = (diffPixels / (width * height)) * 100;
      const matchThreshold = options.matchThreshold || this.matchThreshold;
      const match = diffPercentage <= matchThreshold;
      
      // If there are differences and auto-update is enabled, update the baseline
      if (!match && this.updateBaselines) {
        console.log(`Updating baseline for ${name} due to visual differences (${diffPercentage.toFixed(2)}%)`);
        fs.copyFileSync(actualPath, baselinePath);
        
        return {
          name,
          baselineUpdated: true,
          match: true,
          diffPixels,
          diffPercentage,
          width,
          height,
          baselinePath,
          actualPath
        };
      }
      
      // Save diff image if there are differences
      if (!match) {
        fs.writeFileSync(diffPath, PNG.sync.write(diffImage));
      }
      
      return {
        name,
        match,
        diffPixels,
        diffPercentage,
        width,
        height,
        baselinePath,
        actualPath,
        diffPath: match ? null : diffPath
      };
    } catch (error) {
      console.error(`Error comparing screenshot ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Compare element with baseline
   * @param {string} selector - Element selector
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<Object>} Comparison results
   */
  async compareElement(selector, name, options = {}) {
    try {
      // Generate screenshot paths
      const baselinePath = path.join(this.baselineDir, `${name}.png`);
      const actualPath = path.join(this.diffDir, `${name}-actual.png`);
      const diffPath = path.join(this.diffDir, `${name}-diff.png`);
      
      // Wait for element to be visible with increased timeout
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: options.timeout || 30000
      });
      
      // Take element screenshot
      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      await element.screenshot({
        path: actualPath,
        ...options
      });
      
      // If baseline doesn't exist, create it
      if (!fs.existsSync(baselinePath)) {
        fs.copyFileSync(actualPath, baselinePath);
        console.log(`Created baseline element screenshot: ${baselinePath}`);
        
        return {
          name,
          selector,
          baselineCreated: true,
          match: true,
          baselinePath,
          actualPath
        };
      }
      
      // Load images
      const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
      const actual = PNG.sync.read(fs.readFileSync(actualPath));
      
      // Check dimensions
      if (baseline.width !== actual.width || baseline.height !== actual.height) {
        console.warn(`Element screenshot dimensions mismatch for ${name}: baseline (${baseline.width}x${baseline.height}) vs actual (${actual.width}x${actual.height})`);
        
        // If auto-update is enabled, update the baseline with the new dimensions
        if (this.updateBaselines) {
          console.log(`Updating baseline due to dimension mismatch for element ${name}`);
          fs.copyFileSync(actualPath, baselinePath);
          
          return {
            name,
            selector,
            baselineUpdated: true,
            match: true,
            dimensionMismatch: true,
            baselineDimensions: {
              width: baseline.width,
              height: baseline.height
            },
            actualDimensions: {
              width: actual.width,
              height: actual.height
            },
            baselinePath,
            actualPath
          };
        }
        
        return {
          name,
          selector,
          match: false,
          dimensionMismatch: true,
          baselineDimensions: {
            width: baseline.width,
            height: baseline.height
          },
          actualDimensions: {
            width: actual.width,
            height: actual.height
          },
          baselinePath,
          actualPath,
          diffPath
        };
      }
      
      // Apply ignore regions if specified
      const ignoreRegions = options.ignoreRegions || this.ignoreRegions;
      if (ignoreRegions && ignoreRegions.length > 0) {
        this._applyIgnoreRegions(baseline.data, actual.data, baseline.width, baseline.height, ignoreRegions);
      }
      
      // Create diff image
      const { width, height } = baseline;
      const diffImage = new PNG({ width, height });
      
      // Compare images
      const threshold = options.threshold || this.threshold;
      const diffPixels = pixelmatch(
        baseline.data, 
        actual.data, 
        diffImage.data, 
        width, 
        height, 
        { threshold }
      );
      
      // Calculate diff percentage
      const diffPercentage = (diffPixels / (width * height)) * 100;
      const matchThreshold = options.matchThreshold || this.matchThreshold;
      const match = diffPercentage <= matchThreshold;
      
      // If there are differences and auto-update is enabled, update the baseline
      if (!match && this.updateBaselines) {
        console.log(`Updating baseline for element ${name} due to visual differences (${diffPercentage.toFixed(2)}%)`);
        fs.copyFileSync(actualPath, baselinePath);
        
        return {
          name,
          selector,
          baselineUpdated: true,
          match: true,
          diffPixels,
          diffPercentage,
          width,
          height,
          baselinePath,
          actualPath
        };
      }
      
      // Save diff image if there are differences
      if (!match) {
        fs.writeFileSync(diffPath, PNG.sync.write(diffImage));
      }
      
      return {
        name,
        selector,
        match,
        diffPixels,
        diffPercentage,
        width,
        height,
        baselinePath,
        actualPath,
        diffPath: match ? null : diffPath
      };
    } catch (error) {
      console.error(`Error comparing element ${selector} (${name}):`, error);
      throw error;
    }
  }
  
  /**
   * Compare two images
   * @param {string} image1Path - Path to first image
   * @param {string} image2Path - Path to second image
   * @param {string} diffPath - Path to save diff image
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparison results
   */
  async compareImages(image1Path, image2Path, diffPath, options = {}) {
    try {
      // Check if images exist
      if (!fs.existsSync(image1Path)) {
        throw new Error(`Image not found: ${image1Path}`);
      }
      
      if (!fs.existsSync(image2Path)) {
        throw new Error(`Image not found: ${image2Path}`);
      }
      
      // Load images
      const image1 = PNG.sync.read(fs.readFileSync(image1Path));
      const image2 = PNG.sync.read(fs.readFileSync(image2Path));
      
      // Check dimensions
      if (image1.width !== image2.width || image1.height !== image2.height) {
        console.warn(`Image dimensions mismatch: image1 (${image1.width}x${image1.height}) vs image2 (${image2.width}x${image2.height})`);
        
        return {
          match: false,
          dimensionMismatch: true,
          dimensions1: {
            width: image1.width,
            height: image1.height
          },
          dimensions2: {
            width: image2.width,
            height: image2.height
          },
          image1Path,
          image2Path
        };
      }
      
      // Apply ignore regions if specified
      const ignoreRegions = options.ignoreRegions || this.ignoreRegions;
      if (ignoreRegions && ignoreRegions.length > 0) {
        this._applyIgnoreRegions(image1.data, image2.data, image1.width, image1.height, ignoreRegions);
      }
      
      // Create diff image
      const { width, height } = image1;
      const diffImage = new PNG({ width, height });
      
      // Compare images
      const threshold = options.threshold || this.threshold;
      const diffPixels = pixelmatch(
        image1.data, 
        image2.data, 
        diffImage.data, 
        width, 
        height, 
        { threshold }
      );
      
      // Calculate diff percentage
      const diffPercentage = (diffPixels / (width * height)) * 100;
      const matchThreshold = options.matchThreshold || this.matchThreshold;
      const match = diffPercentage <= matchThreshold;
      
      // Save diff image if there are differences and a path is provided
      if (!match && diffPath) {
        // Create directory if it doesn't exist
        const dir = path.dirname(diffPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(diffPath, PNG.sync.write(diffImage));
      }
      
      return {
        match,
        diffPixels,
        diffPercentage,
        width,
        height,
        image1Path,
        image2Path,
        diffPath: match ? null : diffPath
      };
    } catch (error) {
      console.error(`Error comparing images:`, error);
      throw error;
    }
  }
  
  /**
   * Generate a visual comparison report
   * @param {Array} results - Array of comparison results
   * @param {string} outputPath - Path to save the report
   * @returns {Promise<string>} Path to the report
   */
  async generateReport(results, outputPath) {
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Generate HTML report
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Visual Regression Test Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
            h1, h2, h3 { color: #2c3e50; }
            h1 { border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .stats { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; }
            .stat { background-color: #f8f9fa; padding: 15px; border-radius: 5px; flex: 1; min-width: 150px; text-align: center; }
            .stat h3 { margin-top: 0; margin-bottom: 5px; }
            .stat .value { font-size: 24px; font-weight: bold; }
            .stat.passed .value { color: #27ae60; }
            .stat.failed .value { color: #e74c3c; }
            .result { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .pass { border-left: 5px solid #27ae60; }
            .fail { border-left: 5px solid #e74c3c; }
            .images { display: flex; flex-wrap: wrap; gap: 20px; }
            .image-container { margin-bottom: 20px; flex: 1; min-width: 300px; }
            img { max-width: 100%; border: 1px solid #ddd; }
            .stats-detail { margin-top: 10px; background-color: #f8f9fa; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Visual Regression Test Report</h1>
          <div class="summary">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            
            <div class="stats">
              <div class="stat">
                <h3>Total Tests</h3>
                <div class="value">${results.length}</div>
              </div>
              <div class="stat passed">
                <h3>Passed</h3>
                <div class="value">${results.filter(r => r.match).length}</div>
              </div>
              <div class="stat failed">
                <h3>Failed</h3>
                <div class="value">${results.filter(r => !r.match).length}</div>
              </div>
            </div>
          </div>
          
          ${results.map(result => `
            <div class="result ${result.match ? 'pass' : 'fail'}">
              <h2>${result.name} ${result.match ? '✅' : '❌'}</h2>
              ${result.selector ? `<p><strong>Selector:</strong> ${result.selector}</p>` : ''}
              ${result.baselineCreated ? '<p><strong>Status:</strong> Baseline created</p>' : ''}
              ${result.baselineUpdated ? '<p><strong>Status:</strong> Baseline updated</p>' : ''}
              
              ${result.dimensionMismatch ? `
                <div class="stats-detail">
                  <p><strong>Dimension mismatch:</strong></p>
                  <p>Baseline: ${result.baselineDimensions.width}x${result.baselineDimensions.height}</p>
                  <p>Actual: ${result.actualDimensions.width}x${result.actualDimensions.height}</p>
                </div>
              ` : ''}
              
              ${!result.match && !result.baselineCreated && !result.baselineUpdated ? `
                <div class="stats-detail">
                  <p><strong>Diff pixels:</strong> ${result.diffPixels}</p>
                  <p><strong>Diff percentage:</strong> ${result.diffPercentage.toFixed(2)}%</p>
                  <p><strong>Dimensions:</strong> ${result.width}x${result.height}</p>
                </div>
              ` : ''}
              
              <div class="images">
                <div class="image-container">
                  <h3>Baseline</h3>
                  <img src="file://${result.baselinePath}" alt="Baseline" />
                </div>
                <div class="image-container">
                  <h3>Actual</h3>
                  <img src="file://${result.actualPath}" alt="Actual" />
                </div>
                ${result.diffPath ? `
                  <div class="image-container">
                    <h3>Diff</h3>
                    <img src="file://${result.diffPath}" alt="Diff" />
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      fs.writeFileSync(outputPath, html);
      console.log(`Visual regression report generated: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Error generating visual regression report:', error);
      throw error;
    }
  }
  
  /**
   * Apply ignore regions to images
   * @param {Buffer} img1Data - First image data
   * @param {Buffer} img2Data - Second image data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {Array<Object>} ignoreRegions - Regions to ignore
   * @private
   */
  _applyIgnoreRegions(img1Data, img2Data, width, height, ignoreRegions) {
    for (const region of ignoreRegions) {
      const { x, y, width: regionWidth, height: regionHeight } = region;
      
      // Validate region coordinates
      const startX = Math.max(0, Math.min(x, width - 1));
      const startY = Math.max(0, Math.min(y, height - 1));
      const endX = Math.max(0, Math.min(x + regionWidth, width));
      const endY = Math.max(0, Math.min(y + regionHeight, height));
      
      // Fill the region with black in both images
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          
          // Set to black
          img1Data[idx] = 0;     // R
          img1Data[idx + 1] = 0; // G
          img1Data[idx + 2] = 0; // B
          
          img2Data[idx] = 0;     // R
          img2Data[idx + 1] = 0; // G
          img2Data[idx + 2] = 0; // B
        }
      }
    }
  }
  
  /**
   * Update baseline with current screenshot
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Path to the updated baseline
   */
  async updateBaseline(name, options = {}) {
    try {
      // Generate screenshot paths
      const baselinePath = path.join(this.baselineDir, `${name}.png`);
      const tempPath = path.join(this.diffDir, `${name}-temp.png`);
      
      // Take screenshot
      await this.page.screenshot({
        path: tempPath,
        fullPage: options.fullPage || false,
        ...options
      });
      
      // Create directory if it doesn't exist
      const dir = path.dirname(baselinePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Copy to baseline
      fs.copyFileSync(tempPath, baselinePath);
      
      // Clean up temp file
      fs.unlinkSync(tempPath);
      
      console.log(`Updated baseline: ${baselinePath}`);
      return baselinePath;
    } catch (error) {
      console.error(`Error updating baseline ${name}:`, error);
      throw error;
    }
  }
}

module.exports = VisualComparisonUtils;