/**
 * BasePage - Base class for all page objects
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill an input field
   * @param {string} selector 
   * @param {string} value 
   */
  async fill(selector, value) {
    await this.page.fill(selector, value);
  }

  /**
   * Click an element
   * @param {string} selector 
   */
  async click(selector) {
    await this.page.click(selector);
  }

  /**
   * Select an option from a dropdown
   * @param {string} selector 
   * @param {string} value 
   */
  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Set a checkbox state
   * @param {string} selector 
   * @param {boolean} checked 
   */
  async setCheckbox(selector, checked) {
    await this.page.setChecked(selector, checked);
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector 
   * @param {object} options 
   */
  async waitForElement(selector, options = {}) {
    await this.page.waitForSelector(selector, { state: 'visible', ...options });
  }

  /**
   * Get text from an element
   * @param {string} selector 
   * @returns {Promise<string>}
   */
  async getText(selector) {
    return await this.page.locator(selector).innerText();
  }

  /**
   * Check if an element exists
   * @param {string} selector 
   * @returns {Promise<boolean>}
   */
  async hasElement(selector) {
    return await this.page.locator(selector).count() > 0;
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { BasePage };