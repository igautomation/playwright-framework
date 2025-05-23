/**
 * Self-Healing Locator
 * 
 * Provides a self-healing locator that tries multiple strategies to find elements
 */
const fs = require('fs');
const path = require('path');
const config = require('../../config');

/**
 * Self-Healing Locator class
 */
class SelfHealingLocator {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options for self-healing locator
   */
  constructor(page, options = {}) {
    this.page = page;
    this.options = {
      saveHealedLocators: options.saveHealedLocators || false,
      healedLocatorsPath: options.healedLocatorsPath || 'data/healed-locators.json',
      testIdAttribute: options.testIdAttribute || 'data-testid',
      ...options
    };
    
    // Load healed locators if available
    this.healedLocators = this._loadHealedLocators();
  }
  
  /**
   * Find an element using multiple strategies
   * @param {Object} locators - Object with different locator strategies
   * @param {string} [locators.id] - Element ID
   * @param {string} [locators.css] - CSS selector
   * @param {string} [locators.xpath] - XPath selector
   * @param {string} [locators.text] - Text content
   * @param {string} [locators.testId] - Test ID
   * @param {string} [locators.role] - ARIA role
   * @param {string} [locators.label] - ARIA label
   * @param {string} [locators.name] - Element name attribute
   * @returns {Promise<import('@playwright/test').Locator>} Playwright locator
   */
  async findElement(locators) {
    // Generate a unique key for this locator set
    const locatorKey = this._generateLocatorKey(locators);
    
    // Check if we have a healed locator for this key
    if (this.healedLocators[locatorKey]) {
      try {
        const healedLocator = this.healedLocators[locatorKey];
        const element = await this._findByStrategy(healedLocator.strategy, healedLocator.value);
        
        if (element && await element.count() > 0) {
          return element;
        }
      } catch (error) {
        // Healed locator failed, continue with normal strategies
      }
    }
    
    // Define strategies in order of reliability
    const strategies = [
      // Try by test ID first (most stable)
      { name: 'testId', fn: async () => locators.testId && await this.findByTestId(locators.testId) },
      // Then by ID
      { name: 'id', fn: async () => locators.id && await this.findById(locators.id) },
      // Then by role
      { name: 'role', fn: async () => locators.role && await this.findByRole(locators.role, locators.roleOptions) },
      // Then by label
      { name: 'label', fn: async () => locators.label && await this.findByLabel(locators.label) },
      // Then by CSS
      { name: 'css', fn: async () => locators.css && await this.findByCss(locators.css) },
      // Then by text
      { name: 'text', fn: async () => locators.text && await this.findByText(locators.text) },
      // Then by name attribute
      { name: 'name', fn: async () => locators.name && await this.findByName(locators.name) },
      // Finally by XPath
      { name: 'xpath', fn: async () => locators.xpath && await this.findByXPath(locators.xpath) }
    ];
    
    // Try each strategy in order
    for (const strategy of strategies) {
      try {
        const element = await strategy.fn();
        if (element && await element.count() > 0) {
          // Save the successful strategy if it's different from the original
          if (this.options.saveHealedLocators && !locators[strategy.name]) {
            const value = this._getLocatorValue(element, strategy.name);
            if (value) {
              this.healedLocators[locatorKey] = {
                strategy: strategy.name,
                value,
                originalLocators: { ...locators },
                timestamp: new Date().toISOString()
              };
              this._saveHealedLocators();
            }
          }
          
          return element;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }
    
    // If no strategy worked, try fuzzy matching
    try {
      const element = await this._findByFuzzyMatch(locators);
      if (element && await element.count() > 0) {
        return element;
      }
    } catch (error) {
      // Fuzzy matching failed
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
    return this.page.locator(`[${this.options.testIdAttribute}="${testId}"]`);
  }
  
  /**
   * Find element by role
   * @param {string} role - ARIA role
   * @param {Object} options - Role options
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async findByRole(role, options = {}) {
    return this.page.getByRole(role, options);
  }
  
  /**
   * Find element by label
   * @param {string} label - Label text
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async findByLabel(label) {
    return this.page.getByLabel(label);
  }
  
  /**
   * Find element by name attribute
   * @param {string} name - Name attribute value
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async findByName(name) {
    return this.page.locator(`[name="${name}"]`);
  }
  
  /**
   * Click an element using self-healing locator
   * @param {Object} locators - Object with different locator strategies
   * @param {Object} options - Click options
   */
  async click(locators, options = {}) {
    const element = await this.findElement(locators);
    await element.click(options);
  }
  
  /**
   * Fill an input field using self-healing locator
   * @param {Object} locators - Object with different locator strategies
   * @param {string} value - Value to fill
   * @param {Object} options - Fill options
   */
  async fill(locators, value, options = {}) {
    const element = await this.findElement(locators);
    await element.fill(value, options);
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
  
  /**
   * Check if element is visible using self-healing locator
   * @param {Object} locators - Object with different locator strategies
   * @returns {Promise<boolean>} True if element is visible
   */
  async isVisible(locators) {
    try {
      const element = await this.findElement(locators);
      return await element.isVisible();
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Select option using self-healing locator
   * @param {Object} locators - Object with different locator strategies
   * @param {string|Array<string>} values - Option value(s) to select
   * @param {Object} options - Select options
   */
  async selectOption(locators, values, options = {}) {
    const element = await this.findElement(locators);
    await element.selectOption(values, options);
  }
  
  /**
   * Find element by strategy
   * @param {string} strategy - Strategy name
   * @param {string} value - Strategy value
   * @returns {Promise<import('@playwright/test').Locator>} Playwright locator
   * @private
   */
  async _findByStrategy(strategy, value) {
    switch (strategy) {
      case 'id':
        return this.findById(value);
      case 'css':
        return this.findByCss(value);
      case 'xpath':
        return this.findByXPath(value);
      case 'text':
        return this.findByText(value);
      case 'testId':
        return this.findByTestId(value);
      case 'role':
        return this.findByRole(value);
      case 'label':
        return this.findByLabel(value);
      case 'name':
        return this.findByName(value);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }
  
  /**
   * Find element by fuzzy matching
   * @param {Object} locators - Object with different locator strategies
   * @returns {Promise<import('@playwright/test').Locator>} Playwright locator
   * @private
   */
  async _findByFuzzyMatch(locators) {
    // Try partial text match
    if (locators.text) {
      try {
        const element = await this.page.locator(`text=${locators.text}`, { exact: false });
        if (await element.count() > 0) {
          return element;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }
    
    // Try partial ID match
    if (locators.id) {
      try {
        const element = await this.page.locator(`[id*="${locators.id}"]`);
        if (await element.count() > 0) {
          return element;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }
    
    // Try partial class match
    if (locators.css && locators.css.includes('.')) {
      try {
        const className = locators.css.split('.')[1].split(' ')[0].split(':')[0];
        const element = await this.page.locator(`[class*="${className}"]`);
        if (await element.count() > 0) {
          return element;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }
    
    throw new Error('Fuzzy matching failed');
  }
  
  /**
   * Generate a unique key for a locator set
   * @param {Object} locators - Object with different locator strategies
   * @returns {string} Unique key
   * @private
   */
  _generateLocatorKey(locators) {
    return JSON.stringify(locators);
  }
  
  /**
   * Get locator value from element
   * @param {import('@playwright/test').Locator} element - Playwright locator
   * @param {string} strategy - Strategy name
   * @returns {Promise<string>} Locator value
   * @private
   */
  async _getLocatorValue(element, strategy) {
    try {
      switch (strategy) {
        case 'id':
          return await element.evaluate(el => el.id);
        case 'css':
          return await element.evaluate(el => {
            // Generate a CSS selector
            if (el.id) return `#${el.id}`;
            if (el.className) return `.${el.className.split(' ')[0]}`;
            return null;
          });
        case 'testId':
          return await element.evaluate(el => el.getAttribute(this.options.testIdAttribute));
        case 'text':
          return await element.textContent();
        case 'name':
          return await element.evaluate(el => el.getAttribute('name'));
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Load healed locators from file
   * @returns {Object} Healed locators
   * @private
   */
  _loadHealedLocators() {
    try {
      const healedLocatorsPath = path.resolve(this.options.healedLocatorsPath);
      
      if (fs.existsSync(healedLocatorsPath)) {
        const data = fs.readFileSync(healedLocatorsPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load healed locators:', error);
    }
    
    return {};
  }
  
  /**
   * Save healed locators to file
   * @private
   */
  _saveHealedLocators() {
    try {
      const healedLocatorsPath = path.resolve(this.options.healedLocatorsPath);
      const dir = path.dirname(healedLocatorsPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(
        healedLocatorsPath,
        JSON.stringify(this.healedLocators, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save healed locators:', error);
    }
  }
  
  /**
   * Clear healed locators
   */
  clearHealedLocators() {
    this.healedLocators = {};
    this._saveHealedLocators();
  }
}

module.exports = SelfHealingLocator;