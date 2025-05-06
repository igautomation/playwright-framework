/**
 * Visual comparison utilities for Playwright tests
 */
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch');
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
        fullPage: options.fullPage !== false,
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
          diffPercentage: 0,
          baselinePath,
          actualPath
        };
      }
      
      // Compare screenshots
      const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
      const actual = PNG.sync.read(fs.readFileSync(actualPath));
      
      // Check if dimensions match
      if (baseline.width !== actual.width || baseline.height !== actual.height) {
        logger.warn(`Screenshot dimensions don't match for ${name}. Baseline: ${baseline.width}x${baseline.height}, Actual: ${actual.width}x${actual.height}`);
        
        // Create a diff image with the larger dimensions
        const width = Math.max(baseline.width, actual.width);
        const height = Math.max(baseline.height, actual.height);
        
        const diffImage = new PNG({ width, height });
        
        // Fill with a distinctive color to show the difference
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            diffImage.data[idx] = 255;     // R
            diffImage.data[idx + 1] = 0;   // G
            diffImage.data[idx + 2] = 255; // B
            diffImage.data[idx + 3] = 64;  // A
          }
        }
        
        // Save diff image
        fs.writeFileSync(diffPath, PNG.sync.write(diffImage));
        
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
      // Wait for element to be visible
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: options.timeout || 10000
      });
      
      // Generate screenshot paths
      const baselinePath = path.join(this.baselineDir, `${name}.png`);
      const actualPath = path.join(this.diffDir, `${name}-actual.png`);
      const diffPath = path.join(this.diffDir, `${name}-diff.png`);
      
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
          diffPercentage: 0,
          baselinePath,
          actualPath
        };
      }
      
      // Compare screenshots
      const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
      const actual = PNG.sync.read(fs.readFileSync(actualPath));
      
      // Check if dimensions match
      if (baseline.width !== actual.width || baseline.height !== actual.height) {
        logger.warn(`Element dimensions don't match for ${name}. Baseline: ${baseline.width}x${baseline.height}, Actual: ${actual.width}x${actual.height}`);
        
        // Create a diff image with the larger dimensions
        const width = Math.max(baseline.width, actual.width);
        const height = Math.max(baseline.height, actual.height);
        
        const diffImage = new PNG({ width, height });
        
        // Fill with a distinctive color to show the difference
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            diffImage.data[idx] = 255;     // R
            diffImage.data[idx + 1] = 0;   // G
            diffImage.data[idx + 2] = 255; // B
            diffImage.data[idx + 3] = 64;  // A
          }
        }
        
        // Save diff image
        fs.writeFileSync(diffPath, PNG.sync.write(diffImage));
        
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
   * Update baseline with current screenshot
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<Object>} Result
   */
  async updateBaseline(name, options = {}) {
    try {
      // Generate screenshot paths
      const baselinePath = path.join(this.baselineDir, `${name}.png`);
      const actualPath = path.join(this.diffDir, `${name}-actual.png`);
      
      // Take screenshot
      await this.page.screenshot({
        path: actualPath,
        fullPage: options.fullPage !== false,
        ...options
      });
      
      // Update baseline
      fs.copyFileSync(actualPath, baselinePath);
      logger.info(`Updated baseline screenshot: ${baselinePath}`);
      
      return {
        name,
        baselineUpdated: true,
        baselinePath,
        actualPath
      };
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'updating baseline',
        name,
        options
      });
    }
  }
  
  /**
   * Update element baseline with current screenshot
   * @param {string} selector - Element selector
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<Object>} Result
   */
  async updateElementBaseline(selector, name, options = {}) {
    try {
      // Wait for element to be visible
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: options.timeout || 10000
      });
      
      // Generate screenshot paths
      const baselinePath = path.join(this.baselineDir, `${name}.png`);
      const actualPath = path.join(this.diffDir, `${name}-actual.png`);
      
      // Take element screenshot
      const element = await this.page.$(selector);
      await element.screenshot({
        path: actualPath,
        ...options
      });
      
      // Update baseline
      fs.copyFileSync(actualPath, baselinePath);
      logger.info(`Updated baseline element screenshot: ${baselinePath}`);
      
      return {
        name,
        selector,
        baselineUpdated: true,
        baselinePath,
        actualPath
      };
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'updating element baseline',
        selector,
        name,
        options
      });
    }
  }
  
  /**
   * Generate a visual test report
   * @param {Array} results - Array of comparison results
   * @param {string} outputPath - Path to save the report
   * @returns {Promise<string>} Path to the report
   */
  async generateReport(results, outputPath) {
    try {
      // Generate report path if not provided
      const reportPath = outputPath || path.join(process.cwd(), 'reports', 'visual', `visual-report-${Date.now()}.html`);
      
      // Ensure directory exists
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Generate HTML report
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Visual Test Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
            }
            .summary {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .passed {
              color: #27ae60;
              font-weight: bold;
            }
            .failed {
              color: #e74c3c;
              font-weight: bold;
            }
            .test-case {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .test-case h3 {
              margin-top: 0;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .test-case.pass {
              border-left: 5px solid #27ae60;
            }
            .test-case.fail {
              border-left: 5px solid #e74c3c;
            }
            .test-case.new {
              border-left: 5px solid #3498db;
            }
            .images {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              margin-top: 15px;
            }
            .image-container {
              max-width: 30%;
            }
            .image-container img {
              max-width: 100%;
              border: 1px solid #ddd;
            }
            .image-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .details {
              margin-top: 15px;
              font-family: monospace;
              background-color: #f8f9fa;
              padding: 10px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <h1>Visual Test Report</h1>
          <div class="summary">
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>
              Total Tests: ${results.length} | 
              <span class="${results.filter(r => r.match).length === results.length ? 'passed' : 'failed'}">
                Passed: ${results.filter(r => r.match).length} | 
                Failed: ${results.filter(r => !r.match).length} | 
                New Baselines: ${results.filter(r => r.baselineCreated).length}
              </span>
            </p>
          </div>
          
          ${results.map(result => `
            <div class="test-case ${result.baselineCreated ? 'new' : result.match ? 'pass' : 'fail'}">
              <h3>${result.name} ${result.selector ? `(${result.selector})` : ''}</h3>
              
              ${result.baselineCreated ? 
                `<p>✅ New baseline created</p>` : 
                result.match ? 
                `<p>✅ Visual test passed</p>` : 
                `<p>❌ Visual test failed - Difference: ${result.diffPercentage.toFixed(2)}%</p>`
              }
              
              <div class="images">
                <div class="image-container">
                  <div class="image-label">Baseline</div>
                  <img src="file://${result.baselinePath}" alt="Baseline">
                </div>
                
                <div class="image-container">
                  <div class="image-label">Actual</div>
                  <img src="file://${result.actualPath}" alt="Actual">
                </div>
                
                ${!result.match && !result.baselineCreated && result.diffPath ? `
                  <div class="image-container">
                    <div class="image-label">Diff</div>
                    <img src="file://${result.diffPath}" alt="Diff">
                  </div>
                ` : ''}
              </div>
              
              <div class="details">
                ${result.dimensionMismatch ? `
                  <p>Dimension mismatch:</p>
                  <p>Baseline: ${result.baselineDimensions.width}x${result.baselineDimensions.height}</p>
                  <p>Actual: ${result.actualDimensions.width}x${result.actualDimensions.height}</p>
                ` : !result.baselineCreated ? `
                  <p>Dimensions: ${result.width}x${result.height}</p>
                  <p>Diff Pixels: ${result.diffPixels}</p>
                  <p>Diff Percentage: ${result.diffPercentage.toFixed(2)}%</p>
                  <p>Threshold: ${this.matchThreshold * 100}%</p>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      // Write report to file
      fs.writeFileSync(reportPath, html);
      
      return reportPath;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'generating visual report',
        results,
        outputPath
      });
    }
  }
}

module.exports = VisualComparisonUtils;