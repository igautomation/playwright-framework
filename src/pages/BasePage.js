/**
 * Base Page Object
 * Provides common functionality for all page objects
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
   * Click on an element
   * @param {string} selector
   */
  async click(selector) {
    await this.page.locator(selector).click();
  }

  /**
   * Fill a form field
   * @param {string} selector
   * @param {string} value
   */
  async fill(selector, value) {
    await this.page.locator(selector).fill(value);
  }

  /**
   * Select an option from a dropdown
   * @param {string} selector
   * @param {string} value
   */
  async selectOption(selector, value) {
    await this.page.locator(selector).selectOption(value);
  }

  /**
   * Check if an element is visible
   * @param {string} selector
   * @returns {Promise<boolean>}
   */
  async isVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  /**
   * Get text content of an element
   * @param {string} selector
   * @returns {Promise<string>}
   */
  async getText(selector) {
    return await this.page.locator(selector).textContent();
  }
}

module.exports = { BasePage };