/**
 * Base Page Object
 * Provides common functionality for all page objects
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   */
  async navigate(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - Element selector
   * @param {Object} options - Wait options
   * @returns {Promise<import('@playwright/test').Locator>} - Element locator
   */
  async waitForElement(selector, options = { timeout: 10000 }) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: options.timeout });
    return element;
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
   * Fill a form field
   * @param {string} selector - Field selector
   * @param {string} value - Value to fill
   */
  async fill(selector, value) {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
  }

  /**
   * Get text from an element
   * @param {string} selector - Element selector
   * @returns {Promise<string>} - Element text
   */
  async getText(selector) {
    await this.waitForElement(selector);
    return this.page.locator(selector).textContent();
  }

  /**
   * Check if an element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} - True if element is visible
   */
  async isVisible(selector) {
    try {
      await this.waitForElement(selector, { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }
}

module.exports = BasePage;