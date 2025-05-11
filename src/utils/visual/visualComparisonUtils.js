/**
 * Visual comparison utilities for Playwright tests
 */
const fs = require('fs');
const path = require('path');
// Ensure pixelmatch is properly imported
// Ensure pixelmatch is properly imported
let pixelmatch;
try {
  pixelmatch = require('pixelmatch');
} catch (e) {
  console.error('Failed to load pixelmatch:', e.message);
  // Provide a fallback implementation if the module is not available
  pixelmatch = (img1, img2, output, width, height, options) => {
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
const { PNG } = require('pngjs');
const logger = require('../common/logger');
const PlaywrightErrorHandler = require('../common/errorHandler');

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
    this.baselineDir = options.baselineDir || path.join(process.cwd(), 'visual-baselines');
    this.diffDir = options.diffDir || path.join(process.cwd(), 'visual-diffs');
    this.threshold = options.threshold || 0.1;
    this.matchThreshold = options.matchThreshold || 0.1;
    
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
        logger.info(`Created baseline screenshot: ${baselinePath}`);
        
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
        logger.warn(`Screenshot dimensions mismatch for ${name}: baseline (${baseline.width}x${baseline.height}) vs actual (${actual.width}x${actual.height})`);
        
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
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'comparing screenshot',
        name,
        options
      });
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
      await element.screenshot({
        path: actualPath,
        ...options
      });
      
      // If baseline doesn't exist, create it
      if (!fs.existsSync(baselinePath)) {
        fs.copyFileSync(actualPath, baselinePath);
        logger.info(`Created baseline element screenshot: ${baselinePath}`);
        
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
        logger.warn(`Element screenshot dimensions mismatch for ${name}: baseline (${baseline.width}x${baseline.height}) vs actual (${actual.width}x${actual.height})`);
        
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
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'comparing element',
        selector,
        name,
        options
      });
    }
  }
  
  /**
   * Generate a visual comparison report
   * @param {Array} results - Array of comparison results
   * @param {string} outputPath - Path to save the report
   * @returns {Promise<void>}
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
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .summary { margin-bottom: 20px; }
            .result { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .pass { border-left: 5px solid green; }
            .fail { border-left: 5px solid red; }
            .images { display: flex; flex-wrap: wrap; gap: 10px; }
            .image-container { margin-bottom: 10px; }
            img { max-width: 100%; border: 1px solid #ddd; }
            .stats { margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Visual Regression Test Report</h1>
          <div class="summary">
            <p>Total tests: ${results.length}</p>
            <p>Passed: ${results.filter(r => r.match).length}</p>
            <p>Failed: ${results.filter(r => !r.match).length}</p>
          </div>
          ${results.map(result => `
            <div class="result ${result.match ? 'pass' : 'fail'}">
              <h2>${result.name} ${result.match ? '✅' : '❌'}</h2>
              ${result.selector ? `<p>Selector: ${result.selector}</p>` : ''}
              ${result.baselineCreated ? '<p>Baseline created</p>' : ''}
              ${result.dimensionMismatch ? `
                <p>Dimension mismatch:</p>
                <p>Baseline: ${result.baselineDimensions.width}x${result.baselineDimensions.height}</p>
                <p>Actual: ${result.actualDimensions.width}x${result.actualDimensions.height}</p>
              ` : ''}
              ${!result.match && !result.baselineCreated ? `
                <div class="stats">
                  <p>Diff pixels: ${result.diffPixels}</p>
                  <p>Diff percentage: ${result.diffPercentage.toFixed(2)}%</p>
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
      logger.info(`Visual regression report generated: ${outputPath}`);
    } catch (error) {
      logger.error('Error generating visual regression report:', error);
    }
  }
}

module.exports = VisualComparisonUtils;
