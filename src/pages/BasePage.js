/**
 * Base page object for all page objects
 */
const logger = require('../utils/common/logger');

class BasePage {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    this.url = '';
  }

  /**
   * Navigate to page URL
   * @param {string} url - URL to navigate to (optional, uses this.url by default)
   * @returns {Promise<void>}
   */
  async navigate(url = '') {
    const pageUrl = url || this.url;
    if (!pageUrl) {
      throw new Error('URL is not defined. Please provide a URL or set this.url');
    }
    
    logger.info(`Navigating to ${pageUrl}`);
    await this.page.goto(pageUrl);
  }

  /**
   * Wait for page to load
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForPageLoad(options = {}) {
    await this.page.waitForLoadState(options.state || 'networkidle', {
      timeout: options.timeout || 30000
    });
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Check if element exists
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} True if element exists
   */
  async hasElement(selector) {
    const element = await this.page.$(selector);
    return !!element;
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForElement(selector, options = {}) {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: options.timeout || 10000
    });
  }

  /**
   * Click element
   * @param {string} selector - Element selector
   * @returns {Promise<void>}
   */
  async click(selector) {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }

  /**
   * Fill input field
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   * @returns {Promise<void>}
   */
  async fill(selector, value) {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
  }

  /**
   * Get text content
   * @param {string} selector - Element selector
   * @returns {Promise<string>} Text content
   */
  async getText(selector) {
    await this.waitForElement(selector);
    return await this.page.textContent(selector);
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async takeScreenshot(name) {
    const screenshotPath = `./screenshots/${name}-${Date.now()}.png`;
    return await this.page.screenshot({ path: screenshotPath });
  }
}

module.exports = BasePage;