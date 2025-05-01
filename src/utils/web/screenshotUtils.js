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
      throw new Error("Page object is required");
    }
    this.page = page;
  }

  /**
   * Captures a full-page screenshot.
   */
  async captureFullPage(path, { fullPage = true, quality = "png" } = {}) {
    try {
      const screenshotOptions = { fullPage, type: quality };

      if (path) {
        await this.page.screenshot({ ...screenshotOptions, path });
        return null;
      }

      return await this.page.screenshot(screenshotOptions);
    } catch (error) {
      throw new Error(
        `Failed to capture full-page screenshot: ${error.message}`
      );
    }
  }

  /**
   * Captures a screenshot of a specific element.
   */
  async captureElement(selector, path, { clip = false, quality = "png" } = {}) {
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
  }

  /**
   * Captures a screenshot with custom viewport clipping.
   */
  async captureCustom(path, { clip, quality = "png" } = {}) {
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
  }
}

export default ScreenshotUtils;
