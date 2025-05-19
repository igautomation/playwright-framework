/**
 * Base Page Object
 * 
 * Provides common functionality for all page objects
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'https://demo.playwright.dev';
  }
  
  /**
   * Navigate to a specific path
   * @param {string} path - Path to navigate to
   */
  async goto(path = '') {
    await this.page.goto(`${this.baseUrl}${path}`);
  }
  
  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getTitle() {
    return await this.page.title();
  }
  
  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
  
  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} True if element is visible
   */
  async isVisible(selector) {
    const element = this.page.locator(selector);
    return await element.isVisible();
  }
  
  /**
   * Fill input field
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   */
  async fill(selector, value) {
    await this.page.fill(selector, value);
  }
  
  /**
   * Click element
   * @param {string} selector - Element selector
   */
  async click(selector) {
    await this.page.click(selector);
  }
}

module.exports = BasePage;