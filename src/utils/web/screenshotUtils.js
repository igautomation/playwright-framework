// src/utils/web/screenshotUtils.js

/**
 * Screenshot utilities for Playwright tests
 * Requires Playwright's page object (from @playwright/test)
 */
function ScreenshotUtils(page) {
    if (!page) throw new Error('Page object is required');
    this.page = page;
  }
  
  /**
   * Captures a full-page screenshot
   * @param {string} [path] - File path to save the screenshot (e.g., 'screenshots/full-page.png')
   * @param {Object} [options] - Screenshot options
   * @param {boolean} [options.fullPage=true] - Capture the entire page
   * @param {string} [options.quality='png'] - Image format (png, jpeg)
   * @returns {Promise<Buffer>} Screenshot buffer if path is not provided
   * @throws {Error} If screenshot fails
   */
  ScreenshotUtils.prototype.captureFullPage = async function (
    path,
    { fullPage = true, quality = 'png' } = {}
  ) {
    try {
      const screenshotOptions = { fullPage, type: quality };
      if (path) {
        await this.page.screenshot({ ...screenshotOptions, path });
        return null;
      }
      return await this.page.screenshot(screenshotOptions);
    } catch (error) {
      throw new Error(`Failed to capture full-page screenshot: ${error.message}`);
    }
  };
  
  /**
   * Captures a screenshot of a specific element
   * @param {string} selector - CSS or data-testid selector (e.g., '[data-testid=login-button]')
   * @param {string} [path] - File path to save the screenshot (e.g., 'screenshots/element.png')
   * @param {Object} [options] - Screenshot options
   * @param {boolean} [options.clip=false] - Clip to element bounds
   * @param {string} [options.quality='png'] - Image format (png, jpeg)
   * @returns {Promise<Buffer>} Screenshot buffer if path is not provided
   * @throws {Error} If selector is invalid or screenshot fails
   */
  ScreenshotUtils.prototype.captureElement = async function (
    selector,
    path,
    { clip = false, quality = 'png' } = {}
  ) {
    if (!selector) throw new Error('Selector is required');
    try {
      const element = await this.page.locator(selector);
      if (!(await element.isVisible())) {
        throw new Error(`Element not visible: ${selector}`);
      }
      const screenshotOptions = { type: quality };
      if (clip) {
        const boundingBox = await element.boundingBox();
        if (!boundingBox) throw new Error(`No bounding box for element: ${selector}`);
        screenshotOptions.clip = boundingBox;
      }
      if (path) {
        await element.screenshot({ ...screenshotOptions, path });
        return null;
      }
      return await element.screenshot(screenshotOptions);
    } catch (error) {
      throw new Error(`Failed to capture element screenshot: ${error.message}`);
    }
  };
  
  /**
   * Captures a custom screenshot with specified viewport area
   * @param {string} [path] - File path to save the screenshot (e.g., 'screenshots/custom.png')
   * @param {Object} [options] - Screenshot options
   * @param {Object} [options.clip] - Clip area (x, y, width, height)
   * @param {string} [options.quality='png'] - Image format (png, jpeg)
   * @returns {Promise<Buffer>} Screenshot buffer if path is not provided
   * @throws {Error} If screenshot fails
   */
  ScreenshotUtils.prototype.captureCustom = async function (
    path,
    { clip, quality = 'png' } = {}
  ) {
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
    }
  };
  
  module.exports = ScreenshotUtils;