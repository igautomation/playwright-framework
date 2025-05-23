/**
 * Screenshot Utilities
 * 
 * Provides helper functions for taking and comparing screenshots
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const config = require('../../config');

/**
 * Screenshot Utilities class
 */
class ScreenshotUtils {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options
   * @param {string} options.baseDir - Base directory for screenshots
   * @param {number} options.threshold - Default threshold for comparisons
   * @param {boolean} options.createMissingBaselines - Create missing baselines automatically
   */
  constructor(page, options = {}) {
    this.page = page;
    this.baseDir = options.baseDir || config.reporting?.screenshotDir || 'reports/screenshots';
    this.threshold = options.threshold || 0.1;
    this.createMissingBaselines = options.createMissingBaselines || false;
    
    // Create base directory if it doesn't exist
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    
    // Create baseline directory if it doesn't exist
    this.baselineDir = path.join(this.baseDir, 'baselines');
    if (!fs.existsSync(this.baselineDir)) {
      fs.mkdirSync(this.baselineDir, { recursive: true });
    }
    
    // Create diff directory if it doesn't exist
    this.diffDir = path.join(this.baseDir, 'diffs');
    if (!fs.existsSync(this.diffDir)) {
      fs.mkdirSync(this.diffDir, { recursive: true });
    }
  }
  
  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Screenshot path
   */
  async takeScreenshot(name, options = {}) {
    const screenshotPath = path.join(this.baseDir, `${name}.png`);
    
    // Ensure directory exists
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage || false,
      ...options
    });
    
    return screenshotPath;
  }
  
  /**
   * Take a screenshot of an element
   * @param {string} selector - Element selector
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Screenshot path
   */
  async takeElementScreenshot(selector, name, options = {}) {
    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    const screenshotPath = path.join(this.baseDir, `${name}.png`);
    
    // Ensure directory exists
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await element.screenshot({
      path: screenshotPath,
      ...options
    });
    
    return screenshotPath;
  }
  
  /**
   * Compare screenshot with baseline
   * @param {string} name - Screenshot name
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparison result
   */
  async compareWithBaseline(name, options = {}) {
    const actualPath = path.join(this.baseDir, `${name}.png`);
    const baselinePath = path.join(this.baselineDir, `${name}.png`);
    const diffPath = path.join(this.diffDir, `${name}-diff.png`);
    
    // Check if actual screenshot exists
    if (!fs.existsSync(actualPath)) {
      throw new Error(`Screenshot not found: ${actualPath}`);
    }
    
    // Check if baseline exists
    if (!fs.existsSync(baselinePath)) {
      if (this.createMissingBaselines || options.createMissingBaselines) {
        // Create baseline directory if it doesn't exist
        const baselineDir = path.dirname(baselinePath);
        if (!fs.existsSync(baselineDir)) {
          fs.mkdirSync(baselineDir, { recursive: true });
        }
        
        // Copy actual to baseline
        fs.copyFileSync(actualPath, baselinePath);
        
        return {
          name,
          match: true,
          baselineCreated: true,
          actualPath,
          baselinePath
        };
      } else {
        throw new Error(`Baseline not found: ${baselinePath}`);
      }
    }
    
    // Compare screenshots
    const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
    const img2 = PNG.sync.read(fs.readFileSync(actualPath));
    
    // Check dimensions
    if (img1.width !== img2.width || img1.height !== img2.height) {
      // Create diff directory if it doesn't exist
      const diffDir = path.dirname(diffPath);
      if (!fs.existsSync(diffDir)) {
        fs.mkdirSync(diffDir, { recursive: true });
      }
      
      return {
        name,
        match: false,
        dimensionMismatch: true,
        baselineDimensions: {
          width: img1.width,
          height: img1.height
        },
        actualDimensions: {
          width: img2.width,
          height: img2.height
        },
        actualPath,
        baselinePath,
        diffPath: null
      };
    }
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    const threshold = options.threshold || this.threshold;
    const diffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { 
        threshold,
        includeAA: options.includeAA || false,
        ...options
      }
    );
    
    // Calculate diff percentage
    const diffPercentage = (diffPixels / (width * height)) * 100;
    const matchThreshold = options.matchThreshold || 0.01; // 0.01% difference is acceptable
    const match = diffPercentage <= matchThreshold;
    
    // Save diff image if there are differences
    if (!match) {
      // Create diff directory if it doesn't exist
      const diffDir = path.dirname(diffPath);
      if (!fs.existsSync(diffDir)) {
        fs.mkdirSync(diffDir, { recursive: true });
      }
      
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }
    
    return {
      name,
      match,
      diffPixels,
      diffPercentage,
      width,
      height,
      actualPath,
      baselinePath,
      diffPath: match ? null : diffPath
    };
  }
  
  /**
   * Compare two screenshots
   * @param {string} screenshot1Path - Path to first screenshot
   * @param {string} screenshot2Path - Path to second screenshot
   * @param {string} diffPath - Path to save diff image
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparison result
   */
  async compareScreenshots(screenshot1Path, screenshot2Path, diffPath, options = {}) {
    // Check if screenshots exist
    if (!fs.existsSync(screenshot1Path)) {
      throw new Error(`Screenshot not found: ${screenshot1Path}`);
    }
    
    if (!fs.existsSync(screenshot2Path)) {
      throw new Error(`Screenshot not found: ${screenshot2Path}`);
    }
    
    // Compare screenshots
    const img1 = PNG.sync.read(fs.readFileSync(screenshot1Path));
    const img2 = PNG.sync.read(fs.readFileSync(screenshot2Path));
    
    // Check dimensions
    if (img1.width !== img2.width || img1.height !== img2.height) {
      return {
        match: false,
        dimensionMismatch: true,
        dimensions1: {
          width: img1.width,
          height: img1.height
        },
        dimensions2: {
          width: img2.width,
          height: img2.height
        },
        screenshot1Path,
        screenshot2Path,
        diffPath: null
      };
    }
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    const threshold = options.threshold || this.threshold;
    const diffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { 
        threshold,
        includeAA: options.includeAA || false,
        ...options
      }
    );
    
    // Calculate diff percentage
    const diffPercentage = (diffPixels / (width * height)) * 100;
    const matchThreshold = options.matchThreshold || 0.01; // 0.01% difference is acceptable
    const match = diffPercentage <= matchThreshold;
    
    // Ensure directory exists for diff
    const diffDir = path.dirname(diffPath);
    if (!fs.existsSync(diffDir)) {
      fs.mkdirSync(diffDir, { recursive: true });
    }
    
    // Save diff image
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    
    return {
      match,
      diffPixels,
      diffPercentage,
      width,
      height,
      screenshot1Path,
      screenshot2Path,
      diffPath
    };
  }
  
  /**
   * Check if screenshot exists
   * @param {string} name - Screenshot name
   * @returns {boolean} True if screenshot exists
   */
  screenshotExists(name) {
    const screenshotPath = path.join(this.baseDir, `${name}.png`);
    return fs.existsSync(screenshotPath);
  }
  
  /**
   * Check if baseline exists
   * @param {string} name - Screenshot name
   * @returns {boolean} True if baseline exists
   */
  baselineExists(name) {
    const baselinePath = path.join(this.baselineDir, `${name}.png`);
    return fs.existsSync(baselinePath);
  }
  
  /**
   * Get screenshot path
   * @param {string} name - Screenshot name
   * @returns {string} Screenshot path
   */
  getScreenshotPath(name) {
    return path.join(this.baseDir, `${name}.png`);
  }
  
  /**
   * Get baseline path
   * @param {string} name - Screenshot name
   * @returns {string} Baseline path
   */
  getBaselinePath(name) {
    return path.join(this.baselineDir, `${name}.png`);
  }
  
  /**
   * Get diff path
   * @param {string} name - Screenshot name
   * @returns {string} Diff path
   */
  getDiffPath(name) {
    return path.join(this.diffDir, `${name}-diff.png`);
  }
  
  /**
   * Update baseline with current screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} Baseline path
   */
  async updateBaseline(name) {
    const screenshotPath = path.join(this.baseDir, `${name}.png`);
    const baselinePath = path.join(this.baselineDir, `${name}.png`);
    
    if (!fs.existsSync(screenshotPath)) {
      throw new Error(`Screenshot not found: ${screenshotPath}`);
    }
    
    // Ensure baseline directory exists
    const baselineDir = path.dirname(baselinePath);
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }
    
    // Copy screenshot to baseline
    fs.copyFileSync(screenshotPath, baselinePath);
    
    return baselinePath;
  }
}

module.exports = ScreenshotUtils;