// src/utils/web/webInteractions.js

/**
 * Web interaction utilities for Playwright tests
 */
class WebInteractions {
  /**
   * Creates a new WebInteractions instance
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    if (!page) throw new Error('Page object is required');
    this.page = page;
  }

  /**
   * Get text from an element
   * @param {string} selector - CSS or data-testid selector (e.g., '[data-testid=title]')
   * @returns {Promise<string>} Element text content
   * @throws {Error} If selector is invalid or element not found
   */
  async getText(selector) {
    if (!selector) throw new Error('Selector is required');
    const element = await this.page.locator(selector);
    const text = await element.textContent();
    if (text === null) throw new Error(`No text content found for selector: ${selector}`);
    return text;
  }

  /**
   * Verify text in an element
   * @param {string} selector - CSS or data-testid selector
   * @param {string} expectedText - Expected text content
   * @returns {Promise<boolean>} True if text matches
   * @throws {Error} If selector is invalid
   */
  async verifyText(selector, expectedText) {
    if (!selector || !expectedText) throw new Error('Selector and expected text are required');
    const actualText = await this.getText(selector);
    return actualText.trim() === expectedText.trim();
  }

  /**
   * Select an option from a dropdown
   * @param {string} selector - CSS or data-testid selector for the select element
   * @param {string} value - Value to select
   * @throws {Error} If selector or value is invalid
   */
  async handleDropdown(selector, value) {
    if (!selector || !value) throw new Error('Selector and value are required');
    await this.page.selectOption(selector, value);
  }

  /**
   * Verify dropdown option values
   * @param {string} selector - CSS or data-testid selector for the select element
   * @param {Array<string>} expectedValues - Expected option values
   * @returns {Promise<boolean>} True if values match
   * @throws {Error} If selector is invalid
   */
  async verifyDropdownValues(selector, expectedValues) {
    if (!selector || !Array.isArray(expectedValues)) throw new Error('Selector and expected values array are required');
    const options = await this.page.locator(`${selector} option`).allTextContents();
    return JSON.stringify(options.sort()) === JSON.stringify(expectedValues.sort());
  }

  /**
   * Perform a mouse hover action
   * @param {string} selector - CSS or data-testid selector
   * @throws {Error} If selector is invalid
   */
  async mouseHover(selector) {
    if (!selector) throw new Error('Selector is required');
    await this.page.hover(selector);
  }

  /**
   * Upload a file to an input element
   * @param {string} selector - CSS or data-testid selector for the file input
   * @param {string} filePath - Path to the file
   * @throws {Error} If selector or file path is invalid
   */
  async uploadFile(selector, filePath) {
    if (!selector || !filePath) throw new Error('Selector and file path are required');
    if (!require('fs').existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
    const fileInput = await this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Perform a keyboard action
   * @param {string} key - Key to press (e.g., 'Enter', 'Tab')
   * @throws {Error} If key is invalid
   */
  async keyboardAction(key) {
    if (!key) throw new Error('Key is required');
    await this.page.keyboard.press(key);
  }

  /**
   * Handle autocomplete input and selection
   * @param {string} inputSelector - CSS or data-testid selector for the input field
   * @param {string} value - Value to type
   * @param {string} optionSelector - CSS or data-testid selector for the option
   * @throws {Error} If selectors or value are invalid
   */
  async handleAutocomplete(inputSelector, value, optionSelector) {
    if (!inputSelector || !value || !optionSelector) throw new Error('Input selector, value, and option selector are required');
    await this.page.fill(inputSelector, value);
    await this.page.click(optionSelector);
  }

  /**
   * Handle browser alert
   * @param {boolean} accept - Whether to accept (true) or dismiss (false) the alert
   * @returns {Promise<void>}
   */
  async handleAlert(accept) {
    const dialogPromise = new Promise(resolve => {
      this.page.once('dialog', dialog => {
        if (accept) {
          dialog.accept();
        } else {
          dialog.dismiss();
        }
        resolve();
      });
    });
    await dialogPromise;
  }

  /**
   * Switch to an iframe
   * @param {string} frameSelector - CSS or data-testid selector for the iframe
   * @returns {Object} Playwright frame locator
   * @throws {Error} If frame selector is invalid
   */
  async handleFrame(frameSelector) {
    if (!frameSelector) throw new Error('Frame selector is required');
    const frame = await this.page.frameLocator(frameSelector);
    if (!frame) throw new Error(`Frame not found for selector: ${frameSelector}`);
    return frame;
  }

  /**
   * Switch to a new tab by index
   * @param {number} index - Tab index (0-based)
   * @returns {Object} Playwright page object for the tab
   * @throws {Error} If index is invalid
   */
  async switchTab(index) {
    if (typeof index !== 'number' || index < 0) throw new Error('Valid tab index is required');
    const pages = await this.page.context().pages();
    if (index >= pages.length) throw new Error(`Tab index ${index} out of range`);
    await pages[index].bringToFront();
    return pages[index];
  }

  /**
   * Maximize the browser window or set a large viewport
   * @returns {Promise<void>}
   */
  async maximizeBrowser() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
}

module.exports = WebInteractions;