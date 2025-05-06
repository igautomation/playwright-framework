<<<<<<< HEAD
// src/utils/web/webInteractions.js

/**
 * Web Interaction Utilities for Playwright Automation Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Simplify common UI interactions (text, dropdowns, hover, uploads, frames, tabs)
 * - Handle advanced interactions (shadow DOM, dynamic locators, retries, drag and drop)
 */

import { expect } from '@playwright/test';

class WebInteractions {
  constructor(page) {
    if (!page) {
      throw new Error('Page object is required');
    }
    this.page = page;
  }

  // ---------------------------------------
  // Basic Interactions
  // ---------------------------------------

  async getText(selector) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    const text = await element.textContent();
    if (text === null) {
      throw new Error(`No text content found for selector: ${selector}`);
    }
    return text;
  }

  async verifyText(selector, expectedText) {
    if (!selector || !expectedText) {
      throw new Error('Selector and expected text are required');
    }
    const actualText = await this.getText(selector);
    return actualText.trim() === expectedText.trim();
  }

  async handleDropdown(selector, value) {
    if (!selector || !value) throw new Error('Selector and value are required');
    await this.page.selectOption(selector, value);
  }

  async verifyDropdownValues(selector, expectedValues) {
    if (!selector || !Array.isArray(expectedValues)) {
      throw new Error('Selector and expected values are required');
    }
    const options = await this.page.locator(`${selector} option`).allTextContents();
    return JSON.stringify(options.sort()) === JSON.stringify(expectedValues.sort());
  }

  async mouseHover(selector) {
    if (!selector) throw new Error('Selector is required');
    await this.page.hover(selector);
  }

  async uploadFile(selector, filePath) {
    if (!selector || !filePath) throw new Error('Selector and file path are required');
    const { existsSync } = await import('fs');
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileInput = this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  async keyboardAction(key) {
    if (!key) throw new Error('Key is required');
    await this.page.keyboard.press(key);
  }

  async handleAutocomplete(inputSelector, value, optionSelector) {
    if (!inputSelector || !value || !optionSelector) {
      throw new Error('Input selector, value, and option selector are required');
    }
    await this.page.fill(inputSelector, value);
    await this.page.click(optionSelector);
  }

  async handleAlert(accept) {
    await new Promise((resolve) => {
      this.page.once('dialog', (dialog) => {
        if (accept) {
          dialog.accept();
        } else {
          dialog.dismiss();
        }
        resolve();
      });
    });
  }

  async handleFrame(frameSelector) {
    if (!frameSelector) throw new Error('Frame selector is required');
    const frame = this.page.frameLocator(frameSelector);
    if (!frame) {
      throw new Error(`Frame not found for selector: ${frameSelector}`);
    }
    return frame;
  }

  async switchTab(index) {
    if (typeof index !== 'number' || index < 0) {
      throw new Error('Valid tab index is required');
    }
    const pages = await this.page.context().pages();
    if (index >= pages.length) {
      throw new Error(`Tab index ${index} out of range`);
    }
    await pages[index].bringToFront();
    return pages[index];
  }

  async maximizeBrowser() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  // ---------------------------------------
  // Shadow DOM Interactions
  // ---------------------------------------

  async clickInsideShadow(hostSelector, innerSelector) {
    if (!hostSelector || !innerSelector) {
      throw new Error('Host selector and inner selector are required');
    }
    const host = this.page.locator(hostSelector);
    const shadowRoot = await host.evaluateHandle((el) => el.shadowRoot);
    const element = await shadowRoot.$(innerSelector);
    if (!element) {
      throw new Error(`Element inside shadow DOM not found: ${innerSelector}`);
    }
    await element.click();
  }

  async getTextInsideShadow(hostSelector, innerSelector) {
    if (!hostSelector || !innerSelector) {
      throw new Error('Host selector and inner selector are required');
    }
    const host = this.page.locator(hostSelector);
    const shadowRoot = await host.evaluateHandle((el) => el.shadowRoot);
    const element = await shadowRoot.$(innerSelector);
    if (!element) {
      throw new Error(`Element inside shadow DOM not found: ${innerSelector}`);
    }
    return await element.evaluate((el) => el.textContent);
  }

  // ---------------------------------------
  // Dynamic Locator Builders
  // ---------------------------------------

  buildLocatorByPartialText(text) {
    if (!text) throw new Error('Text is required');
    return this.page.getByText(text, { exact: false });
  }

  buildLocatorByAttribute(attribute, value) {
    if (!attribute || !value) {
      throw new Error('Attribute and value are required');
    }
    return this.page.locator(`[${attribute}="${value}"]`);
  }

  // ---------------------------------------
  // Smart Actions
  // ---------------------------------------

  async safeClick(selector) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    await element.click();
  }

  async clearAndType(selector, text) {
    if (!selector || !text) throw new Error('Selector and text are required');
    const input = this.page.locator(selector);
    await input.fill('');
    await input.type(text);
  }

  async dragAndDrop(sourceSelector, targetSelector) {
    if (!sourceSelector || !targetSelector) {
      throw new Error('Source and target selectors are required');
    }
    const source = this.page.locator(sourceSelector);
    const target = this.page.locator(targetSelector);
    await source.dragTo(target);
  }

  async scrollIntoView(selector) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  async waitForClickable(selector, timeout = 5000) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    await expect(element).toBeEnabled({ timeout });
  }

  async retryClick(selector, retries = 3, delayMs = 1000) {
    if (!selector) throw new Error('Selector is required');
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const element = this.page.locator(selector);
        await element.click();
        return;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Retry click failed after ${retries} attempts: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  async doubleClick(selector) {
    if (!selector) throw new Error('Selector is required');
    await this.page.dblclick(selector);
  }

  async rightClick(selector) {
    if (!selector) throw new Error('Selector is required');
    await this.page.click(selector, { button: 'right' });
  }

  async waitForUrl(urlPart, timeout = 10000) {
    if (!urlPart) throw new Error('URL part is required');
    await this.page.waitForURL(`**${urlPart}**`, { timeout });
  }

  async dragByOffset(selector, xOffset, yOffset) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Bounding box not found for ${selector}`);
    }
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width / 2 + xOffset, box.y + box.height / 2 + yOffset);
    await this.page.mouse.up();
  }
}

export default WebInteractions;
=======
const { expect } = require('@playwright/test');
const logger = require('../common/logger');

/**
 * Web Interactions utility class for common web interactions
 */
class WebInteractions {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Get text from an element
   * @param {string} selector - Element selector
   * @param {Object} options - Options for the operation
   * @returns {Promise<string>} Element text
   */
  async getText(selector, options = {}) {
    try {
      logger.debug(`Getting text from element: ${selector}`);
      const element = this.page.locator(selector);
      return await element.textContent(options);
    } catch (error) {
      logger.error(`Failed to get text from element: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Verify text in an element
   * @param {string} selector - Element selector
   * @param {string} expectedText - Expected text
   * @param {Object} options - Options for the operation
   * @returns {Promise<void>}
   */
  async verifyText(selector, expectedText, options = {}) {
    try {
      logger.debug(
        `Verifying text in element: ${selector}, expected: ${expectedText}`
      );
      const element = this.page.locator(selector);
      await expect(element).toHaveText(expectedText, options);
    } catch (error) {
      logger.error(`Failed to verify text in element: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Maximize browser window
   * @returns {Promise<void>}
   */
  async maximizeBrowser() {
    try {
      logger.debug('Maximizing browser window');
      await this.page.setViewportSize({ width: 1920, height: 1080 });
    } catch (error) {
      logger.error('Failed to maximize browser window', error);
      throw error;
    }
  }

  /**
   * Handle dropdown selection by text
   * @param {string} selector - Dropdown selector
   * @param {string} text - Text to select
   * @returns {Promise<void>}
   */
  async handleDropdown(selector, text) {
    try {
      logger.debug(`Selecting option "${text}" from dropdown: ${selector}`);
      const dropdown = this.page.locator(selector);
      await dropdown.selectOption({ label: text });
    } catch (error) {
      logger.error(
        `Failed to select option "${text}" from dropdown: ${selector}`,
        error
      );
      throw error;
    }
  }

  /**
   * Handle dropdown selection by value
   * @param {string} selector - Dropdown selector
   * @param {string} value - Value to select
   * @returns {Promise<void>}
   */
  async handleDropdownByValue(selector, value) {
    try {
      logger.debug(`Selecting value "${value}" from dropdown: ${selector}`);
      const dropdown = this.page.locator(selector);
      await dropdown.selectOption({ value });
    } catch (error) {
      logger.error(
        `Failed to select value "${value}" from dropdown: ${selector}`,
        error
      );
      throw error;
    }
  }

  /**
   * Verify dropdown values
   * @param {string} selector - Dropdown selector
   * @param {Array<string>} expectedValues - Expected dropdown values
   * @returns {Promise<void>}
   */
  async verifyDropdownValues(selector, expectedValues) {
    try {
      logger.debug(`Verifying dropdown values for: ${selector}`);
      const dropdown = this.page.locator(selector);
      const options = await dropdown.locator('option').allTextContents();

      // Filter out empty options
      const actualValues = options.filter((option) => option.trim() !== '');

      // Verify each expected value is in the actual values
      for (const expectedValue of expectedValues) {
        if (!actualValues.includes(expectedValue)) {
          throw new Error(
            `Expected value "${expectedValue}" not found in dropdown options: ${actualValues.join(', ')}`
          );
        }
      }
    } catch (error) {
      logger.error(`Failed to verify dropdown values for: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Perform mouse hover on an element
   * @param {string} selector - Element selector
   * @returns {Promise<void>}
   */
  async mouseHover(selector) {
    try {
      logger.debug(`Hovering over element: ${selector}`);
      await this.page.locator(selector).hover();
    } catch (error) {
      logger.error(`Failed to hover over element: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Upload a file
   * @param {string} selector - File input selector
   * @param {string} filePath - Path to the file
   * @returns {Promise<void>}
   */
  async uploadFile(selector, filePath) {
    try {
      logger.debug(`Uploading file: ${filePath} to input: ${selector}`);
      const fileInput = this.page.locator(selector);
      await fileInput.setInputFiles(filePath);
    } catch (error) {
      logger.error(
        `Failed to upload file: ${filePath} to input: ${selector}`,
        error
      );
      throw error;
    }
  }

  /**
   * Perform keyboard action
   * @param {string} key - Key to press
   * @returns {Promise<void>}
   */
  async keyboardAction(key) {
    try {
      logger.debug(`Pressing key: ${key}`);
      await this.page.keyboard.press(key);
    } catch (error) {
      logger.error(`Failed to press key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Handle autocomplete input
   * @param {string} inputSelector - Input selector
   * @param {string} text - Text to enter
   * @param {string} suggestionSelector - Suggestion selector
   * @param {string} suggestionText - Suggestion text to select
   * @returns {Promise<void>}
   */
  async handleAutocomplete(
    inputSelector,
    text,
    suggestionSelector,
    suggestionText
  ) {
    try {
      logger.debug(`Handling autocomplete for input: ${inputSelector}`);

      // Type text in the input
      await this.page.locator(inputSelector).fill(text);

      // Wait for suggestions to appear
      await this.page.waitForSelector(suggestionSelector);

      // Click on the suggestion with the specified text
      await this.page
        .locator(`${suggestionSelector}:has-text("${suggestionText}")`)
        .click();
    } catch (error) {
      logger.error(
        `Failed to handle autocomplete for input: ${inputSelector}`,
        error
      );
      throw error;
    }
  }

  /**
   * Handle browser alert
   * @param {boolean} accept - Whether to accept or dismiss the alert
   * @returns {Promise<string>} Alert text
   */
  async handleAlert(accept = true) {
    try {
      logger.debug(`Handling alert, accept: ${accept}`);

      // Set up alert handler
      let alertText = '';
      this.page.on('dialog', async (dialog) => {
        alertText = dialog.message();
        if (accept) {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
      });

      return alertText;
    } catch (error) {
      logger.error('Failed to handle alert', error);
      throw error;
    }
  }

  /**
   * Handle iframe
   * @param {string} frameSelector - Frame selector
   * @param {Function} callback - Callback function to execute in the frame context
   * @returns {Promise<void>}
   */
  async handleFrame(frameSelector, callback) {
    try {
      logger.debug(`Handling frame: ${frameSelector}`);

      // Get the frame
      const frame = this.page.frameLocator(frameSelector);

      // Execute the callback with the frame
      await callback(frame);
    } catch (error) {
      logger.error(`Failed to handle frame: ${frameSelector}`, error);
      throw error;
    }
  }

  /**
   * Switch to a tab by index
   * @param {number} index - Tab index
   * @returns {Promise<void>}
   */
  async switchTab(index) {
    try {
      logger.debug(`Switching to tab with index: ${index}`);

      // Get all pages in the browser context
      const pages = this.page.context().pages();

      // Check if the index is valid
      if (index >= 0 && index < pages.length) {
        // Switch to the specified page
        await pages[index].bringToFront();
        this.page = pages[index];
      } else {
        throw new Error(
          `Invalid tab index: ${index}, available tabs: ${pages.length}`
        );
      }
    } catch (error) {
      logger.error(`Failed to switch to tab with index: ${index}`, error);
      throw error;
    }
  }

  /**
   * Wait for network idle
   * @param {Object} options - Options for the operation
   * @returns {Promise<void>}
   */
  async waitForNetworkIdle(options = {}) {
    try {
      logger.debug('Waiting for network idle');
      await this.page.waitForLoadState('networkidle', options);
    } catch (error) {
      logger.error('Failed to wait for network idle', error);
      throw error;
    }
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {Object} options - Options for the operation
   * @returns {Promise<void>}
   */
  async waitForElementVisible(selector, options = {}) {
    try {
      logger.debug(`Waiting for element to be visible: ${selector}`);
      await this.page
        .locator(selector)
        .waitFor({ state: 'visible', ...options });
    } catch (error) {
      logger.error(
        `Failed to wait for element to be visible: ${selector}`,
        error
      );
      throw error;
    }
  }

  /**
   * Check if element exists
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} Whether the element exists
   */
  async elementExists(selector) {
    try {
      logger.debug(`Checking if element exists: ${selector}`);
      const count = await this.page.locator(selector).count();
      return count > 0;
    } catch (error) {
      logger.error(`Failed to check if element exists: ${selector}`, error);
      return false;
    }
  }

  /**
   * Get element count
   * @param {string} selector - Element selector
   * @returns {Promise<number>} Element count
   */
  async getElementCount(selector) {
    try {
      logger.debug(`Getting element count for: ${selector}`);
      return await this.page.locator(selector).count();
    } catch (error) {
      logger.error(`Failed to get element count for: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Get attribute value
   * @param {string} selector - Element selector
   * @param {string} attribute - Attribute name
   * @returns {Promise<string>} Attribute value
   */
  async getAttribute(selector, attribute) {
    try {
      logger.debug(
        `Getting attribute "${attribute}" from element: ${selector}`
      );
      const element = this.page.locator(selector);
      return await element.getAttribute(attribute);
    } catch (error) {
      logger.error(
        `Failed to get attribute "${attribute}" from element: ${selector}`,
        error
      );
      throw error;
    }
  }

  /**
   * Verify attribute value
   * @param {string} selector - Element selector
   * @param {string} attribute - Attribute name
   * @param {string} expectedValue - Expected attribute value
   * @returns {Promise<void>}
   */
  async verifyAttribute(selector, attribute, expectedValue) {
    try {
      logger.debug(
        `Verifying attribute "${attribute}" in element: ${selector}, expected: ${expectedValue}`
      );
      const element = this.page.locator(selector);
      await expect(element).toHaveAttribute(attribute, expectedValue);
    } catch (error) {
      logger.error(
        `Failed to verify attribute "${attribute}" in element: ${selector}`,
        error
      );
      throw error;
    }
  }
}

module.exports = WebInteractions;
>>>>>>> 51948a2 (Main v1.0)
