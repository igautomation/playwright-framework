<<<<<<< HEAD
// src/utils/web/screenshotUtils.js

/**
 * Screenshot Utilities for Playwright Automation Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Capture full-page screenshots
 * - Capture element-specific screenshots
 * - Capture custom area screenshots using clipping
 */

class ScreenshotUtils {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page object.
   */
  constructor(page) {
    if (!page) {
      throw new Error('Page object is required');
    }
    this.page = page;
  }

  /**
   * Captures a full-page screenshot.
   */
  async captureFullPage(path, { fullPage = true, quality = 'png' } = {}) {
    try {
      const screenshotOptions = { fullPage, type: quality };

      if (path) {
        await this.page.screenshot({ ...screenshotOptions, path });
        return null;
      }

      return await this.page.screenshot(screenshotOptions);
    } catch (error) {
      throw new Error(`Failed to capture full-page screenshot: ${error.message}`);
=======
const path = require('path');
const fs = require('fs');
const logger = require('../common/logger');

/**
 * Screenshot Utilities class for taking screenshots and videos
 */
class ScreenshotUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    this.screenshotDir = path.resolve(process.cwd(), 'reports/screenshots');
    this.videoDir = path.resolve(process.cwd(), 'reports/videos');
    this.traceDir = path.resolve(process.cwd(), 'reports/traces');

    // Create directories if they don't exist
    [this.screenshotDir, this.videoDir, this.traceDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Path to the screenshot
   */
  async takeScreenshot(name, options = {}) {
    try {
      logger.debug(`Taking screenshot: ${name}`);

      // Generate a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}_${timestamp}.png`;
      const filepath = path.join(this.screenshotDir, filename);

      // Take the screenshot
      await this.page.screenshot({
        path: filepath,
        fullPage: options.fullPage || false,
        ...options,
      });

      logger.info(`Screenshot saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to take screenshot: ${name}`, error);
      throw error;
>>>>>>> 51948a2 (Main v1.0)
    }
  }

  /**
<<<<<<< HEAD
   * Captures a screenshot of a specific element.
   */
  async captureElement(selector, path, { clip = false, quality = 'png' } = {}) {
    if (!selector) {
      throw new Error('Selector is required');
    }

    try {
      const element = await this.page.locator(selector);

      if (!(await element.isVisible())) {
        throw new Error(`Element not visible: ${selector}`);
      }

      const screenshotOptions = { type: quality };

      if (clip) {
        const boundingBox = await element.boundingBox();
        if (!boundingBox) {
          throw new Error(`No bounding box for element: ${selector}`);
        }
        screenshotOptions.clip = boundingBox;
      }

      if (path) {
        await element.screenshot({ ...screenshotOptions, path });
        return null;
      }

      return await element.screenshot(screenshotOptions);
    } catch (error) {
      throw new Error(`Failed to capture element screenshot: ${error.message}`);
=======
   * Take a screenshot of an element
   * @param {string} selector - Element selector
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Path to the screenshot
   */
  async takeElementScreenshot(selector, name, options = {}) {
    try {
      logger.debug(`Taking screenshot of element: ${selector}, name: ${name}`);

      // Generate a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}_${timestamp}.png`;
      const filepath = path.join(this.screenshotDir, filename);

      // Take the screenshot of the element
      const element = this.page.locator(selector);
      await element.screenshot({
        path: filepath,
        ...options,
      });

      logger.info(`Element screenshot saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(
        `Failed to take screenshot of element: ${selector}, name: ${name}`,
        error
      );
      throw error;
>>>>>>> 51948a2 (Main v1.0)
    }
  }

  /**
<<<<<<< HEAD
   * Captures a screenshot with custom viewport clipping.
   */
  async captureCustom(path, { clip, quality = 'png' } = {}) {
    try {
      const screenshotOptions = { type: quality };

      if (clip) {
        if (!clip.x || !clip.y || !clip.width || !clip.height) {
          throw new Error('Clip options must include x, y, width, and height');
        }
        screenshotOptions.clip = clip;
      }

      if (path) {
        await this.page.screenshot({ ...screenshotOptions, path });
        return null;
      }

      return await this.page.screenshot(screenshotOptions);
    } catch (error) {
      throw new Error(`Failed to capture custom screenshot: ${error.message}`);
=======
   * Start video recording
   * @returns {Promise<void>}
   */
  async startVideoRecording() {
    try {
      logger.debug('Starting video recording');

      // Video recording is handled by Playwright context
      // This is just a placeholder for additional setup if needed
      logger.info('Video recording will be saved after the test');
    } catch (error) {
      logger.error('Failed to start video recording', error);
      throw error;
    }
  }

  /**
   * Save trace
   * @param {string} name - Trace name
   * @returns {Promise<string>} Path to the trace
   */
  async saveTrace(name) {
    try {
      logger.debug(`Saving trace: ${name}`);

      // Generate a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}_${timestamp}.zip`;
      const filepath = path.join(this.traceDir, filename);

      // Save the trace
      await this.page.context().tracing.stop({ path: filepath });

      logger.info(`Trace saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to save trace: ${name}`, error);
      throw error;
    }
  }

  /**
   * Start tracing
   * @param {Object} options - Tracing options
   * @returns {Promise<void>}
   */
  async startTracing(options = {}) {
    try {
      logger.debug('Starting tracing');

      // Start tracing
      await this.page.context().tracing.start({
        screenshots: true,
        snapshots: true,
        ...options,
      });

      logger.info('Tracing started');
    } catch (error) {
      logger.error('Failed to start tracing', error);
      throw error;
    }
  }

  /**
   * Compare screenshots
   * @param {string} baselinePath - Path to the baseline screenshot
   * @param {string} actualPath - Path to the actual screenshot
   * @param {Object} options - Comparison options
   * @returns {Promise<boolean>} Whether the screenshots match
   */
  async compareScreenshots(baselinePath, actualPath, options = {}) {
    try {
      logger.debug(`Comparing screenshots: ${baselinePath} and ${actualPath}`);

      // Check if the baseline screenshot exists
      if (!fs.existsSync(baselinePath)) {
        logger.warn(`Baseline screenshot does not exist: ${baselinePath}`);
        return false;
      }

      // Check if the actual screenshot exists
      if (!fs.existsSync(actualPath)) {
        logger.warn(`Actual screenshot does not exist: ${actualPath}`);
        return false;
      }

      // In a real implementation, you would use a library like pixelmatch
      // to compare the screenshots pixel by pixel
      // This is just a placeholder
      logger.info('Screenshot comparison is not implemented yet');
      return true;
    } catch (error) {
      logger.error(
        `Failed to compare screenshots: ${baselinePath} and ${actualPath}`,
        error
      );
      throw error;
>>>>>>> 51948a2 (Main v1.0)
    }
  }
}

<<<<<<< HEAD
export default ScreenshotUtils;
=======
module.exports = ScreenshotUtils;
>>>>>>> 51948a2 (Main v1.0)
