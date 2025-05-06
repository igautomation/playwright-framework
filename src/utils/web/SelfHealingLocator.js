const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

/**
 * Self-healing locator utility for Playwright
 *
 * This utility automatically recovers from broken selectors by trying
 * alternative selectors and storing successful ones for future use.
 */
class SelfHealingLocator {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    this.healingEnabled = true;
    this.fallbackStrategies = [
      this.tryByText,
      this.tryByRole,
      this.tryByTestId,
      this.tryByPlaceholder,
      this.tryByLabel,
      this.tryByClass,
      this.tryByXPath,
    ];

    // Create directory for healed locators if it doesn't exist
    const healedLocatorsDir = path.dirname(this.getHealedLocatorsPath());
    if (!fs.existsSync(healedLocatorsDir)) {
      fs.mkdirSync(healedLocatorsDir, { recursive: true });
    }
  }

  /**
   * Get path to healed locators file
   * @returns {string} Path to healed locators file
   */
  getHealedLocatorsPath() {
    return path.resolve(process.cwd(), 'data/healed-locators.json');
  }

  /**
   * Enable or disable self-healing
   * @param {boolean} enabled - Whether self-healing is enabled
   * @returns {SelfHealingLocator} This instance for chaining
   */
  setHealingEnabled(enabled) {
    this.healingEnabled = enabled;
    return this;
  }

  /**
   * Store healed locators for future use
   * @param {string} originalSelector - Original selector
   * @param {string} healedSelector - Healed selector
   */
  storeHealedLocator(originalSelector, healedSelector) {
    const healedLocatorsPath = this.getHealedLocatorsPath();
    let healedLocators = {};

    // Load existing healed locators
    if (fs.existsSync(healedLocatorsPath)) {
      healedLocators = JSON.parse(fs.readFileSync(healedLocatorsPath, 'utf8'));
    }

    // Update with new healed locator
    healedLocators[originalSelector] = healedSelector;

    // Save updated healed locators
    fs.writeFileSync(
      healedLocatorsPath,
      JSON.stringify(healedLocators, null, 2)
    );

    logger.info(
      `Stored healed locator: ${originalSelector} -> ${healedSelector}`
    );
  }

  /**
   * Load healed locators
   * @returns {Object} Healed locators
   */
  loadHealedLocators() {
    const healedLocatorsPath = this.getHealedLocatorsPath();

    if (fs.existsSync(healedLocatorsPath)) {
      return JSON.parse(fs.readFileSync(healedLocatorsPath, 'utf8'));
    }

    return {};
  }

  /**
   * Get a self-healing locator with automatic updates
   * @param {string} primarySelector - Primary selector
   * @param {Array<string>} fallbackSelectors - Fallback selectors
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator>} Playwright locator
   */
  async getLocator(primarySelector, fallbackSelectors = [], options = {}) {
    // Load healed locators
    const healedLocators = this.loadHealedLocators();

    // Check if we have a healed locator for this selector
    if (healedLocators[primarySelector]) {
      logger.debug(
        `Using healed locator for ${primarySelector}: ${healedLocators[primarySelector]}`
      );
      primarySelector = healedLocators[primarySelector];
    }

    try {
      // Try the primary selector first
      const locator = this.page.locator(primarySelector);
      const count = await locator.count();

      if (count > 0) {
        return locator;
      }

      // If self-healing is disabled, return the primary locator even if it doesn't exist
      if (!this.healingEnabled) {
        return locator;
      }

      // Try fallback selectors
      for (const fallbackSelector of fallbackSelectors) {
        const fallbackLocator = this.page.locator(fallbackSelector);
        const fallbackCount = await fallbackLocator.count();

        if (fallbackCount > 0) {
          // Store the healed locator for future use
          this.storeHealedLocator(primarySelector, fallbackSelector);
          return fallbackLocator;
        }
      }

      // If we get here, try applying fallback strategies
      if (this.fallbackStrategies.length > 0) {
        const healedLocator = await this.applyFallbackStrategies(
          primarySelector,
          options
        );

        if (healedLocator) {
          return healedLocator;
        }
      }

      // If we get here, all attempts failed
      logger.warn(`Could not find element with selector: ${primarySelector}`);
      return locator;
    } catch (error) {
      logger.error(
        `Error getting self-healing locator for: ${primarySelector}`,
        error
      );
      throw error;
    }
  }

  /**
   * Apply fallback strategies to find an element
   * @param {string} selector - Original selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator|null>} Healed locator or null
   */
  async applyFallbackStrategies(selector, options = {}) {
    for (const strategy of this.fallbackStrategies) {
      try {
        const healedLocator = await strategy.call(this, selector, options);
        if (healedLocator) {
          const count = await healedLocator.count();
          if (count > 0) {
            // Store the healed locator for future use
            const healedSelector = await this.getLocatorSelector(healedLocator);
            if (healedSelector) {
              this.storeHealedLocator(selector, healedSelector);
            }
            return healedLocator;
          }
        }
      } catch (error) {
        // Ignore errors from fallback strategies
      }
    }
    return null;
  }

  /**
   * Get selector string from locator
   * @param {import('@playwright/test').Locator} locator - Playwright locator
   * @returns {Promise<string|null>} Selector string or null
   */
  async getLocatorSelector(locator) {
    try {
      // This is a hack to get the selector from a locator
      const str = locator.toString();
      const match = str.match(/selector=(.*?)(?:,|$)/);
      if (match && match[1]) {
        return match[1].trim();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Try to find element by text content
   * @param {string} selector - Original selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator|null>} Locator or null
   */
  async tryByText(selector, options = {}) {
    // Extract text from selector if possible
    const match = selector.match(/text=([^'"\]]+)/);
    if (match) {
      const text = match[1];
      return this.page.getByText(text);
    }

    // Try to find element with similar text
    try {
      const elementText = await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element ? element.textContent.trim() : null;
      }, selector);

      if (elementText) {
        return this.page.getByText(elementText);
      }
    } catch (error) {
      // Ignore errors
    }

    return null;
  }

  /**
   * Try to find element by role
   * @param {string} selector - Original selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator|null>} Locator or null
   */
  async tryByRole(selector, options = {}) {
    // Try common roles
    const roles = [
      'button',
      'link',
      'textbox',
      'checkbox',
      'radio',
      'heading',
      'img',
      'combobox',
    ];

    // Try to determine the role from the selector
    let role = null;
    if (selector.includes('button')) {
      role = 'button';
    } else if (selector.includes('input')) {
      role = 'textbox';
    } else if (selector.includes('a')) {
      role = 'link';
    } else if (
      selector.includes('h1') ||
      selector.includes('h2') ||
      selector.includes('h3')
    ) {
      role = 'heading';
    }

    if (role) {
      // Try to find by role and name
      try {
        const elementText = await this.page.evaluate((sel) => {
          const element = document.querySelector(sel);
          return element ? element.textContent.trim() : null;
        }, selector);

        if (elementText) {
          return this.page.getByRole(role, { name: elementText });
        }
      } catch (error) {
        // Ignore errors
      }

      // Try just the role
      return this.page.getByRole(role);
    }

    // Try all roles
    for (const role of roles) {
      const locator = this.page.getByRole(role);
      const count = await locator.count();
      if (count === 1) {
        return locator;
      }
    }

    return null;
  }

  /**
   * Try to find element by test ID
   * @param {string} selector - Original selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator|null>} Locator or null
   */
  async tryByTestId(selector, options = {}) {
    // Try common test ID attributes
    const testIdAttrs = [
      'data-testid',
      'data-test-id',
      'data-test',
      'data-cy',
      'data-qa',
    ];

    // Extract element type from selector
    const elementType = selector.match(/^([a-z]+)/i)?.[1] || '';

    // Try to extract test ID from selector
    const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
    const testId = idMatch ? idMatch[1] : null;

    if (testId) {
      // Try each test ID attribute with the extracted ID
      for (const attr of testIdAttrs) {
        const locator = this.page.locator(`[${attr}="${testId}"]`);
        const count = await locator.count();
        if (count > 0) {
          return locator;
        }
      }
    }

    // Try to find any element with a test ID
    for (const attr of testIdAttrs) {
      const elements = await this.page.locator(`[${attr}]`).all();
      if (elements.length === 1) {
        return this.page.locator(`[${attr}]`);
      } else if (elements.length > 0 && elementType) {
        const locator = this.page.locator(`${elementType}[${attr}]`);
        const count = await locator.count();
        if (count > 0) {
          return locator;
        }
      }
    }

    return null;
  }

  /**
   * Try to find element by placeholder
   * @param {string} selector - Original selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator|null>} Locator or null
   */
  async tryByPlaceholder(selector, options = {}) {
    // Check if it's an input element
    if (selector.includes('input')) {
      // Try to extract placeholder from selector
      const placeholderMatch = selector.match(/placeholder=['"]([^'"]+)['"]/);
      const placeholder = placeholderMatch ? placeholderMatch[1] : null;

      if (placeholder) {
        return this.page.getByPlaceholder(placeholder);
      }

      // Try to find any input with placeholder
      const inputs = await this.page.locator('input[placeholder]').all();
      if (inputs.length === 1) {
        return this.page.locator('input[placeholder]');
      }
    }

    return null;
  }

  /**
   * Try to find element by label
   * @param {string} selector - Original selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator|null>} Locator or null
   */
  async tryByLabel(selector, options = {}) {
    // Check if it's an input element
    if (selector.includes('input')) {
      // Try to extract ID from selector
      const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
      const id = idMatch ? idMatch[1] : null;

      if (id) {
        // Try to find label with for attribute
        const label = this.page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();

        if (labelCount > 0) {
          const labelText = await label.textContent();
          return this.page.getByLabel(labelText.trim());
        }
      }

      // Try to find any label
      const labels = await this.page.locator('label').all();

      for (const label of labels) {
        const forAttr = await label.getAttribute('for');
        if (forAttr) {
          const input = this.page.locator(`#${forAttr}`);
          const count = await input.count();
          if (count === 1) {
            return input;
          }
        }
      }
    }

    return null;
  }

  /**
   * Try to find element by class
   * @param {string} selector - Original selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator|null>} Locator or null
   */
  async tryByClass(selector, options = {}) {
    // Try to extract class from selector
    const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/);
    const className = classMatch ? classMatch[1] : null;

    if (className) {
      return this.page.locator(`.${className}`);
    }

    // Extract element type from selector
    const elementType = selector.match(/^([a-z]+)/i)?.[1] || '';

    if (elementType) {
      // Try to find element by tag and class
      const elements = await this.page.locator(`${elementType}[class]`).all();
      if (elements.length === 1) {
        return this.page.locator(`${elementType}[class]`);
      }
    }

    return null;
  }

  /**
   * Try to find element by XPath
   * @param {string} selector - Original selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Locator|null>} Locator or null
   */
  async tryByXPath(selector, options = {}) {
    // Extract element type from selector
    const elementType = selector.match(/^([a-z]+)/i)?.[1] || '';

    if (elementType) {
      // Try to find by tag name
      const elements = await this.page.locator(`//${elementType}`).all();
      if (elements.length === 1) {
        return this.page.locator(`//${elementType}`);
      }

      // Try to find by tag name and text content
      try {
        const elementText = await this.page.evaluate((sel) => {
          const element = document.querySelector(sel);
          return element ? element.textContent.trim() : null;
        }, selector);

        if (elementText) {
          return this.page.locator(
            `//${elementType}[contains(text(), "${elementText}")]`
          );
        }
      } catch (error) {
        // Ignore errors
      }
    }

    return null;
  }
}

module.exports = SelfHealingLocator;
