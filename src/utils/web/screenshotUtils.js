// src/utils/web/screenshotUtils.js

/**
 * Screenshot Utilities for Playwright Automation Framework.
 *
 * Responsibilities:
 * - Capture full-page screenshots
 * - Capture element-specific screenshots
 * - Capture custom area screenshots using clipping
 */

const { expect } = require("@playwright/test"); // Optional if you want to add assertion inside methods

/**
 * Constructor for ScreenshotUtils.
 *
 * @param {import('@playwright/test').Page} page - Playwright Page object.
 * @throws {Error} If page is not provided.
 */
function ScreenshotUtils(page) {
  if (!page) {
    throw new Error("Page object is required");
  }
  this.page = page;
}

/**
 * Captures a full-page screenshot.
 *
 * @param {string} [path] - Optional path to save the screenshot.
 * @param {Object} [options] - Screenshot options.
 * @param {boolean} [options.fullPage=true] - Whether to capture the full page.
 * @param {string} [options.quality='png'] - Image format ('png' or 'jpeg').
 * @returns {Promise<Buffer|null>} - Screenshot buffer if no path is provided, else null.
 * @throws {Error} If screenshot capture fails.
 */
ScreenshotUtils.prototype.captureFullPage = async function (
  path,
  { fullPage = true, quality = "png" } = {}
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
 * Captures a screenshot of a specific element.
 *
 * @param {string} selector - CSS or data-testid selector.
 * @param {string} [path] - Optional path to save the screenshot.
 * @param {Object} [options] - Screenshot options.
 * @param {boolean} [options.clip=false] - Whether to clip to element bounds.
 * @param {string} [options.quality='png'] - Image format ('png' or 'jpeg').
 * @returns {Promise<Buffer|null>} - Screenshot buffer if no path is provided, else null.
 * @throws {Error} If element is not visible or screenshot capture fails.
 */
ScreenshotUtils.prototype.captureElement = async function (
  selector,
  path,
  { clip = false, quality = "png" } = {}
) {
  if (!selector) {
    throw new Error("Selector is required");
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
  }
};

/**
 * Captures a screenshot with custom viewport clipping.
 *
 * @param {string} [path] - Optional path to save the screenshot.
 * @param {Object} [options] - Screenshot options.
 * @param {Object} [options.clip] - Clip area with {x, y, width, height}.
 * @param {string} [options.quality='png'] - Image format ('png' or 'jpeg').
 * @returns {Promise<Buffer|null>} - Screenshot buffer if no path is provided, else null.
 * @throws {Error} If clip dimensions are invalid or screenshot capture fails.
 */
ScreenshotUtils.prototype.captureCustom = async function (
  path,
  { clip, quality = "png" } = {}
) {
  try {
    const screenshotOptions = { type: quality };

    if (clip) {
      if (!clip.x || !clip.y || !clip.width || !clip.height) {
        throw new Error("Clip options must include x, y, width, and height");
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
