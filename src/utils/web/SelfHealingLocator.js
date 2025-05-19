/**
 * Self-Healing Locator
 * 
 * Provides a self-healing locator that tries multiple strategies to find elements
 */

/**
 * Self-Healing Locator class
 */
class SelfHealingLocator {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }
  
  /**
   * Find an element using multiple strategies
   * @param {Object} locators - Object with different locator strategies
   * @param {string} [locators.id] - Element ID
   * @param {string} [locators.css] - CSS selector
   * @param {string} [locators.xpath] - XPath selector
   * @param {string} [locators.text] - Text content
   * @param {string} [locators.testId] - Test ID
   * @returns {Promise<import('@playwright/test').Locator>} Playwright locator
   */
  async findElement(locators) {
    const strategies = [
      // Try by test ID first (most stable)
      async () => locators.testId && await this.findByTestId(locators.testId),
      // Then by ID
      async () => locators.id && await this.findById(locators.id),
      // Then by CSS
      async () => locators.css && await this.findByCss(locators.css),
      // Then by text
      async () => locators.text && await this.findByText(locators.text),
      // Finally by XPath
      async () => locators.xpath && await this.findByXPath(locators.xpath)
    ];
    
    // Try each strategy in order
    for (const strategy of strategies) {
      try {
        const element = await strategy();
        if (element && await element.count() > 0) {
          return element;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }
    
    // If no strategy worked, throw an error
    throw new Error(`Could not find element with locators: ${JSON.stringify(locators)}`);
  }
  
  /**
   * Find element by ID
   * @param {string} id - Element ID
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async findById(id) {
    return this.page.locator(`#${id}`);
  }
  
  /**
   * Find element by CSS selector
   * @param {string} css - CSS selector
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async findByCss(css) {
    return this.page.locator(css);
  }
  
  /**
   * Find element by XPath
   * @param {string} xpath - XPath selector
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async findByXPath(xpath) {
    return this.page.locator(`xpath=${xpath}`);
  }
  
  /**
   * Find element by text content
   * @param {string} text - Text content
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async findByText(text) {
    return this.page.getByText(text);
  }
  
  /**
   * Find element by test ID
   * @param {string} testId - Test ID
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async findByTestId(testId) {
    return this.page.getByTestId(testId);
  }
  
  /**
   * Click an element using self-healing locator
   * @param {Object} locators - Object with different locator strategies
   */
  async click(locators) {
    const element = await this.findElement(locators);
    await element.click();
  }
  
  /**
   * Fill an input field using self-healing locator
   * @param {Object} locators - Object with different locator strategies
   * @param {string} value - Value to fill
   */
  async fill(locators, value) {
    const element = await this.findElement(locators);
    await element.fill(value);
  }
  
  /**
   * Get text content using self-healing locator
   * @param {Object} locators - Object with different locator strategies
   * @returns {Promise<string>} Element text content
   */
  async getText(locators) {
    const element = await this.findElement(locators);
    return await element.textContent();
  }
}

module.exports = SelfHealingLocator;