/**
 * Web Interactions
 * 
 * Provides helper functions for web interactions
 */

/**
 * Web Interactions class for common web actions
 */
class WebInteractions {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }
  
  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   */
  async goto(url) {
    await this.page.goto(url);
  }
  
  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }
  
  /**
   * Click an element
   * @param {string} selector - Element selector
   */
  async click(selector) {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }
  
  /**
   * Fill an input field
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   */
  async fill(selector, value) {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
  }
  
  /**
   * Get text content of an element
   * @param {string} selector - Element selector
   * @returns {Promise<string>} Element text content
   */
  async getText(selector) {
    await this.waitForElement(selector);
    return await this.page.textContent(selector);
  }
  
  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} True if element is visible
   */
  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 1000 });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Select option from dropdown
   * @param {string} selector - Select element selector
   * @param {string} value - Option value to select
   */
  async selectOption(selector, value) {
    await this.waitForElement(selector);
    await this.page.selectOption(selector, value);
  }
  
  /**
   * Hover over an element
   * @param {string} selector - Element selector
   */
  async hover(selector) {
    await this.waitForElement(selector);
    await this.page.hover(selector);
  }
  
  /**
   * Press a key
   * @param {string} selector - Element selector
   * @param {string} key - Key to press
   */
  async pressKey(selector, key) {
    await this.waitForElement(selector);
    await this.page.press(selector, key);
  }
  
  /**
   * Take a screenshot
   * @param {string} path - Screenshot path
   */
  async takeScreenshot(path) {
    await this.page.screenshot({ path });
  }
}

module.exports = WebInteractions;