/**
 * Web interactions utility for Playwright
 */
const logger = require('../common/logger');

class WebInteractions {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to URL
   * @param {string} url - URL to navigate to
   * @param {Object} options - Navigation options
   * @returns {Promise<Response|null>} Navigation response
   */
  async navigate(url, options = {}) {
    logger.info(`Navigating to ${url}`);
    return await this.page.goto(url, {
      waitUntil: options.waitUntil || 'networkidle',
      timeout: options.timeout || 30000
    });
  }

  /**
   * Click element
   * @param {string} selector - Element selector
   * @param {Object} options - Click options
   * @returns {Promise<void>}
   */
  async click(selector, options = {}) {
    logger.info(`Clicking element: ${selector}`);
    await this.page.click(selector, options);
  }

  /**
   * Double click element
   * @param {string} selector - Element selector
   * @param {Object} options - Click options
   * @returns {Promise<void>}
   */
  async doubleClick(selector, options = {}) {
    logger.info(`Double-clicking element: ${selector}`);
    await this.page.dblclick(selector, options);
  }

  /**
   * Right click element
   * @param {string} selector - Element selector
   * @param {Object} options - Click options
   * @returns {Promise<void>}
   */
  async rightClick(selector, options = {}) {
    logger.info(`Right-clicking element: ${selector}`);
    await this.page.click(selector, { button: 'right', ...options });
  }

  /**
   * Fill input field
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   * @param {Object} options - Fill options
   * @returns {Promise<void>}
   */
  async fill(selector, value, options = {}) {
    logger.info(`Filling input ${selector} with value: ${value}`);
    await this.page.fill(selector, value, options);
  }

  /**
   * Type text
   * @param {string} selector - Input selector
   * @param {string} text - Text to type
   * @param {Object} options - Type options
   * @returns {Promise<void>}
   */
  async type(selector, text, options = {}) {
    logger.info(`Typing text in ${selector}: ${text}`);
    await this.page.type(selector, text, options);
  }

  /**
   * Select option
   * @param {string} selector - Select element selector
   * @param {string|Array<string>} values - Option value(s) to select
   * @returns {Promise<Array<string>>} Selected values
   */
  async select(selector, values) {
    logger.info(`Selecting option in ${selector}: ${values}`);
    return await this.page.selectOption(selector, values);
  }

  /**
   * Check checkbox
   * @param {string} selector - Checkbox selector
   * @returns {Promise<void>}
   */
  async check(selector) {
    logger.info(`Checking checkbox: ${selector}`);
    await this.page.check(selector);
  }

  /**
   * Uncheck checkbox
   * @param {string} selector - Checkbox selector
   * @returns {Promise<void>}
   */
  async uncheck(selector) {
    logger.info(`Unchecking checkbox: ${selector}`);
    await this.page.uncheck(selector);
  }

  /**
   * Get text content
   * @param {string} selector - Element selector
   * @returns {Promise<string>} Text content
   */
  async getText(selector) {
    logger.info(`Getting text from: ${selector}`);
    return await this.page.textContent(selector);
  }

  /**
   * Get input value
   * @param {string} selector - Input selector
   * @returns {Promise<string>} Input value
   */
  async getValue(selector) {
    logger.info(`Getting value from: ${selector}`);
    return await this.page.inputValue(selector);
  }

  /**
   * Wait for element
   * @param {string} selector - Element selector
   * @param {Object} options - Wait options
   * @returns {Promise<ElementHandle>} Element handle
   */
  async waitForElement(selector, options = {}) {
    logger.info(`Waiting for element: ${selector}`);
    return await this.page.waitForSelector(selector, {
      state: options.state || 'visible',
      timeout: options.timeout || 10000
    });
  }

  /**
   * Wait for navigation
   * @param {Object} options - Navigation options
   * @returns {Promise<Response|null>} Navigation response
   */
  async waitForNavigation(options = {}) {
    logger.info('Waiting for navigation');
    return await this.page.waitForNavigation({
      waitUntil: options.waitUntil || 'networkidle',
      timeout: options.timeout || 30000
    });
  }

  /**
   * Wait for load state
   * @param {string} state - Load state to wait for
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForLoadState(state = 'networkidle', options = {}) {
    logger.info(`Waiting for load state: ${state}`);
    await this.page.waitForLoadState(state, options);
  }

  /**
   * Wait for timeout
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async wait(timeout) {
    logger.info(`Waiting for ${timeout}ms`);
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Take screenshot
   * @param {Object} options - Screenshot options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async takeScreenshot(options = {}) {
    logger.info('Taking screenshot');
    return await this.page.screenshot(options);
  }

  /**
   * Press key
   * @param {string} selector - Element selector
   * @param {string} key - Key to press
   * @param {Object} options - Press options
   * @returns {Promise<void>}
   */
  async pressKey(selector, key, options = {}) {
    logger.info(`Pressing key ${key} on ${selector}`);
    await this.page.press(selector, key, options);
  }

  /**
   * Hover over element
   * @param {string} selector - Element selector
   * @param {Object} options - Hover options
   * @returns {Promise<void>}
   */
  async hover(selector, options = {}) {
    logger.info(`Hovering over: ${selector}`);
    await this.page.hover(selector, options);
  }

  /**
   * Drag and drop
   * @param {string} sourceSelector - Source element selector
   * @param {string} targetSelector - Target element selector
   * @returns {Promise<void>}
   */
  async dragAndDrop(sourceSelector, targetSelector) {
    logger.info(`Dragging from ${sourceSelector} to ${targetSelector}`);
    await this.page.dragAndDrop(sourceSelector, targetSelector);
  }

  /**
   * Upload file
   * @param {string} selector - File input selector
   * @param {string|Array<string>} filePaths - Path(s) to file(s)
   * @returns {Promise<void>}
   */
  async uploadFile(selector, filePaths) {
    logger.info(`Uploading file to ${selector}: ${filePaths}`);
    await this.page.setInputFiles(selector, filePaths);
  }

  /**
   * Execute JavaScript
   * @param {Function|string} pageFunction - Function to execute
   * @param {Array<*>} args - Arguments to pass to the function
   * @returns {Promise<*>} Result of the function
   */
  async evaluate(pageFunction, ...args) {
    logger.info('Executing JavaScript');
    return await this.page.evaluate(pageFunction, ...args);
  }
}

module.exports = WebInteractions;