/**
 * Screenshot utilities for Playwright
 */
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

class ScreenshotUtils {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   * @param {Object} options - Configuration options
   */
  constructor(page, options = {}) {
    this.page = page;
    this.screenshotDir = options.screenshotDir || path.join(process.cwd(), 'screenshots');
    
    // Create screenshot directory if it doesn't exist
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Screenshot path
   */
  async takeScreenshot(name, options = {}) {
    const screenshotPath = options.path || path.join(
      this.screenshotDir,
      `${name}-${Date.now()}.png`
    );
    
    logger.info(`Taking screenshot: ${screenshotPath}`);
    
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage !== false,
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
    // Wait for element to be visible
    await this.page.waitForSelector(selector, { 
      state: 'visible',
      timeout: options.timeout || 10000
    });
    
    const element = await this.page.$(selector);
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    const screenshotPath = options.path || path.join(
      this.screenshotDir,
      `${name}-${Date.now()}.png`
    );
    
    logger.info(`Taking element screenshot: ${screenshotPath}`);
    
    await element.screenshot({
      path: screenshotPath,
      ...options
    });
    
    return screenshotPath;
  }

  /**
   * Take screenshots of multiple elements
   * @param {Array<string>} selectors - Element selectors
   * @param {string} namePrefix - Screenshot name prefix
   * @param {Object} options - Screenshot options
   * @returns {Promise<Array<string>>} Screenshot paths
   */
  async takeMultipleElementScreenshots(selectors, namePrefix, options = {}) {
    const screenshotPaths = [];
    
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const name = `${namePrefix}-${i + 1}`;
      
      try {
        const screenshotPath = await this.takeElementScreenshot(selector, name, options);
        screenshotPaths.push(screenshotPath);
      } catch (error) {
        logger.error(`Failed to take screenshot of element ${selector}:`, error);
      }
    }
    
    return screenshotPaths;
  }

  /**
   * Take a screenshot on failure
   * @param {string} testName - Test name
   * @param {Error} error - Error object
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Screenshot path
   */
  async takeScreenshotOnFailure(testName, error, options = {}) {
    const screenshotPath = options.path || path.join(
      this.screenshotDir,
      'failures',
      `${testName}-failure-${Date.now()}.png`
    );
    
    // Create directory if it doesn't exist
    const screenshotDir = path.dirname(screenshotPath);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    logger.error(`Test failed: ${testName}`, error);
    logger.info(`Taking failure screenshot: ${screenshotPath}`);
    
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage !== false,
      ...options
    });
    
    return screenshotPath;
  }

  /**
   * Take a screenshot of the viewport
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Screenshot path
   */
  async takeViewportScreenshot(name, options = {}) {
    const screenshotPath = options.path || path.join(
      this.screenshotDir,
      `${name}-viewport-${Date.now()}.png`
    );
    
    logger.info(`Taking viewport screenshot: ${screenshotPath}`);
    
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: false,
      ...options
    });
    
    return screenshotPath;
  }

  /**
   * Take screenshots at different viewport sizes
   * @param {string} name - Screenshot name
   * @param {Array<Object>} viewports - Viewport sizes
   * @param {Object} options - Screenshot options
   * @returns {Promise<Array<Object>>} Screenshot results
   */
  async takeResponsiveScreenshots(name, viewports, options = {}) {
    const results = [];
    const originalViewport = await this.page.viewportSize();
    
    for (const viewport of viewports) {
      // Set viewport size
      await this.page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      
      // Wait for layout to stabilize
      await this.page.waitForTimeout(500);
      
      // Take screenshot
      const screenshotPath = options.path || path.join(
        this.screenshotDir,
        'responsive',
        `${name}-${viewport.width}x${viewport.height}-${Date.now()}.png`
      );
      
      // Create directory if it doesn't exist
      const screenshotDir = path.dirname(screenshotPath);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      logger.info(`Taking responsive screenshot at ${viewport.width}x${viewport.height}: ${screenshotPath}`);
      
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: options.fullPage !== false,
        ...options
      });
      
      results.push({
        viewport,
        screenshotPath
      });
    }
    
    // Restore original viewport
    await this.page.setViewportSize(originalViewport);
    
    return results;
  }
}

module.exports = ScreenshotUtils;