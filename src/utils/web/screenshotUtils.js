/**
 * Screenshot Utilities
 * 
 * Provides helper functions for taking and comparing screenshots
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

/**
 * Screenshot Utilities class
 */
class ScreenshotUtils {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} baseDir - Base directory for screenshots
   */
  constructor(page, baseDir = 'screenshots') {
    this.page = page;
    this.baseDir = baseDir;
    
    // Create base directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
  }
  
  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async takeScreenshot(name, options = {}) {
    const screenshotPath = path.join(this.baseDir, `${name}.png`);
    const screenshotBuffer = await this.page.screenshot({
      path: screenshotPath,
      ...options
    });
    
    return screenshotBuffer;
  }
  
  /**
   * Take a screenshot of an element
   * @param {string} selector - Element selector
   * @param {string} name - Screenshot name
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async takeElementScreenshot(selector, name) {
    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    const screenshotPath = path.join(this.baseDir, `${name}.png`);
    const screenshotBuffer = await element.screenshot({
      path: screenshotPath
    });
    
    return screenshotBuffer;
  }
  
  /**
   * Compare two screenshots
   * @param {string} screenshot1Path - Path to first screenshot
   * @param {string} screenshot2Path - Path to second screenshot
   * @param {string} diffPath - Path to save diff image
   * @param {Object} options - Comparison options
   * @returns {Promise<number>} Number of different pixels
   */
  async compareScreenshots(screenshot1Path, screenshot2Path, diffPath, options = {}) {
    const img1 = PNG.sync.read(fs.readFileSync(screenshot1Path));
    const img2 = PNG.sync.read(fs.readFileSync(screenshot2Path));
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    const defaultOptions = {
      threshold: 0.1,
      includeAA: false
    };
    
    const diffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { ...defaultOptions, ...options }
    );
    
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    
    return diffPixels;
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
   * Get screenshot path
   * @param {string} name - Screenshot name
   * @returns {string} Screenshot path
   */
  getScreenshotPath(name) {
    return path.join(this.baseDir, `${name}.png`);
  }
}

module.exports = ScreenshotUtils;