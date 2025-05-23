/**
 * Flaky Locator Detector
 * 
 * Detects and tracks flaky locators to improve test reliability
 */
const fs = require('fs');
const path = require('path');
const config = require('../../config');

/**
 * Flaky Locator Detector class for detecting and tracking flaky locators
 */
class FlakyLocatorDetector {
  /**
   * Constructor
   * @param {Object} options - Options
   * @param {import('@playwright/test').Page} [page] - Playwright Page object
   */
  constructor(options = {}, page = null) {
    this.page = page;
    this.options = {
      flakyThreshold: options.flakyThreshold || 3, // Number of failures to consider a locator flaky
      trackingWindow: options.trackingWindow || 10, // Number of test runs to track
      autoHeal: options.autoHeal || false, // Whether to automatically heal flaky locators
      storageFile: options.storageFile || 'data/flaky-locators.json', // File to store flaky locators
      ...options
    };

    this.locatorStats = new Map();
    this.flakyLocators = new Set();
    this.alternativeLocators = new Map();
    
    // Load flaky locators if storage file exists
    this._loadFromStorage();
  }

  /**
   * Track a locator usage
   * @param {string} selector - Selector
   * @param {boolean} success - Whether the locator was successful
   * @param {Object} metadata - Additional metadata
   * @returns {void}
   */
  trackLocator(selector, success, metadata = {}) {
    try {
      // Get or initialize stats for this locator
      if (!this.locatorStats.has(selector)) {
        this.locatorStats.set(selector, {
          selector,
          usages: [],
          successCount: 0,
          failureCount: 0,
        });
      }

      const stats = this.locatorStats.get(selector);

      // Add usage
      const usage = {
        timestamp: new Date().toISOString(),
        success,
        ...metadata,
      };

      stats.usages.push(usage);

      // Limit the number of usages tracked
      if (stats.usages.length > this.options.trackingWindow) {
        stats.usages.shift();
      }

      // Update counts
      if (success) {
        stats.successCount++;
      } else {
        stats.failureCount++;
      }

      // Check if the locator is flaky
      this.checkFlakyLocator(selector);
      
      // Save to storage if needed
      if (!success && this.flakyLocators.has(selector)) {
        this._saveToStorage();
      }
    } catch (error) {
      console.error(`Error tracking locator: ${selector}`, error);
    }
  }

  /**
   * Tracks a locator action and monitors flakiness
   * @param {string} locator - Locator string (CSS, XPath, etc.)
   * @param {Function} action - Function that performs actions with the locator
   * @param {Object} options - Options
   * @returns {Promise<any>} Result of the action
   * @throws {Error} If action fails after retries
   */
  async trackLocatorAction(locator, action, options = {}) {
    if (!locator || typeof action !== 'function') {
      throw new Error('Locator and action are required');
    }
    
    if (!this.page) {
      throw new Error('Page object is required for trackLocatorAction');
    }
    
    const maxRetries = options.maxRetries || 2;
    let lastError;
    
    // Try with original locator
    try {
      const element = this.page.locator(locator);
      const result = await action(element);
      this.trackLocator(locator, true);
      return result;
    } catch (error) {
      lastError = error;
      this.trackLocator(locator, false, { error: error.message });
      
      // If auto-heal is enabled and we have alternative locators, try them
      if (this.options.autoHeal && this.alternativeLocators.has(locator)) {
        const alternatives = this.alternativeLocators.get(locator);
        
        for (const altLocator of alternatives) {
          try {
            const element = this.page.locator(altLocator);
            const result = await action(element);
            this.trackLocator(altLocator, true);
            
            // Update the alternative locator as successful
            this._updateAlternativeLocator(locator, altLocator, true);
            
            return result;
          } catch (altError) {
            this.trackLocator(altLocator, false, { error: altError.message });
            // Continue to next alternative
          }
        }
      }
      
      // If we have retries left, try again with the original locator
      if (maxRetries > 0) {
        for (let i = 0; i < maxRetries; i++) {
          try {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const element = this.page.locator(locator);
            const result = await action(element);
            this.trackLocator(locator, true, { retryCount: i + 1 });
            return result;
          } catch (retryError) {
            lastError = retryError;
            this.trackLocator(locator, false, { 
              error: retryError.message,
              retryCount: i + 1
            });
          }
        }
      }
    }
    
    // If we get here, all attempts failed
    throw new Error(`Locator action failed after ${maxRetries} retries: ${lastError.message}`);
  }

  /**
   * Check if a locator is flaky
   * @param {string} selector - Selector
   * @returns {boolean} Whether the locator is flaky
   */
  checkFlakyLocator(selector) {
    try {
      const stats = this.locatorStats.get(selector);

      if (!stats) {
        return false;
      }

      // Calculate flakiness
      const totalUsages = stats.usages.length;
      const failureRate = stats.failureCount / totalUsages;

      // Check if the locator has enough usages and failures to be considered flaky
      const isFlaky =
        totalUsages >= this.options.trackingWindow &&
        stats.failureCount >= this.options.flakyThreshold &&
        failureRate > 0.2; // 20% failure rate

      if (isFlaky && !this.flakyLocators.has(selector)) {
        console.warn(
          `Detected flaky locator: ${selector}, failure rate: ${(failureRate * 100).toFixed(2)}%`
        );
        this.flakyLocators.add(selector);
        
        // Generate alternative locators if page is available
        if (this.page && this.options.autoHeal) {
          this._generateAlternativeLocators(selector);
        }
      } else if (!isFlaky && this.flakyLocators.has(selector)) {
        console.info(`Locator is no longer flaky: ${selector}`);
        this.flakyLocators.delete(selector);
      }

      return isFlaky;
    } catch (error) {
      console.error(`Error checking flaky locator: ${selector}`, error);
      return false;
    }
  }

  /**
   * Get flaky locators
   * @returns {Array<string>} Flaky locators
   */
  getFlakyLocators() {
    return Array.from(this.flakyLocators);
  }

  /**
   * Get locator stats
   * @param {string} selector - Selector
   * @returns {Object|null} Locator stats
   */
  getLocatorStats(selector) {
    return this.locatorStats.get(selector) || null;
  }

  /**
   * Get all locator stats
   * @returns {Array<Object>} All locator stats
   */
  getAllLocatorStats() {
    return Array.from(this.locatorStats.values());
  }

  /**
   * Reports all flaky locators detected during the session
   * @returns {Array<{locator: string, failureRate: number}>} List of flaky locators sorted by failure rate
   */
  reportFlakyLocators() {
    const flaky = [];

    for (const [selector, stats] of this.locatorStats.entries()) {
      if (stats.failureCount > 0) {
        flaky.push({
          locator: selector,
          failureRate: (stats.failureCount / stats.usages.length) * 100,
          stats,
          alternatives: this.alternativeLocators.get(selector) || []
        });
      }
    }

    return flaky.sort((a, b) => b.failureRate - a.failureRate);
  }

  /**
   * Save flaky locators to file
   * @param {string} filePath - File path
   * @returns {Promise<void>}
   */
  async saveToFile(filePath) {
    try {
      const outputPath = filePath || this.options.storageFile;
      console.info(`Saving flaky locators to: ${outputPath}`);

      // Ensure the directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Get flaky locator data
      const flakyLocatorData = Array.from(this.flakyLocators).map(
        (selector) => {
          const stats = this.locatorStats.get(selector);
          return {
            selector,
            stats,
            alternatives: Array.from(this.alternativeLocators.get(selector) || [])
          };
        }
      );

      // Write the file
      fs.writeFileSync(outputPath, JSON.stringify(flakyLocatorData, null, 2));

      console.info(`Flaky locators saved to: ${outputPath}`);
    } catch (error) {
      console.error(`Error saving flaky locators to: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Load flaky locators from file
   * @param {string} filePath - File path
   * @returns {Promise<void>}
   */
  async loadFromFile(filePath) {
    try {
      const inputPath = filePath || this.options.storageFile;
      console.info(`Loading flaky locators from: ${inputPath}`);

      // Check if the file exists
      if (!fs.existsSync(inputPath)) {
        console.warn(`Flaky locators file not found: ${inputPath}`);
        return;
      }

      // Read the file
      const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

      // Load flaky locators
      data.forEach((item) => {
        this.flakyLocators.add(item.selector);

        if (item.stats) {
          this.locatorStats.set(item.selector, item.stats);
        }
        
        if (item.alternatives && Array.isArray(item.alternatives)) {
          this.alternativeLocators.set(item.selector, new Set(item.alternatives));
        }
      });

      console.info(
        `Loaded ${this.flakyLocators.size} flaky locators from: ${inputPath}`
      );
    } catch (error) {
      console.error(`Error loading flaky locators from: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Reset tracking
   * @returns {void}
   */
  reset() {
    this.locatorStats.clear();
    this.flakyLocators.clear();
    this.alternativeLocators.clear();
  }
  
  /**
   * Add alternative locator
   * @param {string} originalLocator - Original locator
   * @param {string} alternativeLocator - Alternative locator
   */
  addAlternativeLocator(originalLocator, alternativeLocator) {
    if (!this.alternativeLocators.has(originalLocator)) {
      this.alternativeLocators.set(originalLocator, new Set());
    }
    
    this.alternativeLocators.get(originalLocator).add(alternativeLocator);
    this._saveToStorage();
  }
  
  /**
   * Get alternative locators
   * @param {string} locator - Original locator
   * @returns {Array<string>} Alternative locators
   */
  getAlternativeLocators(locator) {
    return Array.from(this.alternativeLocators.get(locator) || []);
  }
  
  /**
   * Generate alternative locators for a flaky locator
   * @param {string} selector - Selector
   * @private
   */
  async _generateAlternativeLocators(selector) {
    if (!this.page) return;
    
    try {
      // Try to find the element
      const element = await this.page.$(selector);
      if (!element) return;
      
      const alternatives = new Set();
      
      // Generate alternatives based on element attributes
      const attributes = await element.evaluate(el => {
        const attrs = {};
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value;
        }
        return attrs;
      });
      
      // ID-based selector
      if (attributes.id) {
        alternatives.add(`#${attributes.id}`);
      }
      
      // Class-based selector
      if (attributes.class) {
        const classes = attributes.class.split(' ').filter(Boolean);
        if (classes.length > 0) {
          alternatives.add(`.${classes[0]}`);
        }
      }
      
      // Data attribute selectors
      for (const [name, value] of Object.entries(attributes)) {
        if (name.startsWith('data-')) {
          alternatives.add(`[${name}="${value}"]`);
        }
      }
      
      // Role-based selector
      if (attributes.role) {
        alternatives.add(`[role="${attributes.role}"]`);
      }
      
      // Name attribute
      if (attributes.name) {
        alternatives.add(`[name="${attributes.name}"]`);
      }
      
      // Text-based selector
      const text = await element.textContent();
      if (text && text.trim()) {
        alternatives.add(`text=${text.trim()}`);
      }
      
      // XPath alternatives
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      if (tagName) {
        // XPath by ID
        if (attributes.id) {
          alternatives.add(`//${tagName}[@id="${attributes.id}"]`);
        }
        
        // XPath by text
        if (text && text.trim()) {
          alternatives.add(`//${tagName}[contains(text(),"${text.trim()}")]`);
        }
      }
      
      // Store alternatives
      if (alternatives.size > 0) {
        this.alternativeLocators.set(selector, alternatives);
        console.info(`Generated ${alternatives.size} alternative locators for ${selector}`);
      }
    } catch (error) {
      console.error(`Error generating alternative locators for ${selector}:`, error);
    }
  }
  
  /**
   * Update alternative locator success/failure
   * @param {string} originalLocator - Original locator
   * @param {string} alternativeLocator - Alternative locator
   * @param {boolean} success - Whether the alternative was successful
   * @private
   */
  _updateAlternativeLocator(originalLocator, alternativeLocator, success) {
    // If successful, move this alternative to the front of the list
    if (success && this.alternativeLocators.has(originalLocator)) {
      const alternatives = this.alternativeLocators.get(originalLocator);
      
      if (alternatives.has(alternativeLocator)) {
        // Remove and re-add to make it first in iteration order
        alternatives.delete(alternativeLocator);
        
        // Create new set with this alternative first
        const newAlternatives = new Set([alternativeLocator, ...alternatives]);
        this.alternativeLocators.set(originalLocator, newAlternatives);
        
        this._saveToStorage();
      }
    }
  }
  
  /**
   * Load from storage file
   * @private
   */
  _loadFromStorage() {
    try {
      if (fs.existsSync(this.options.storageFile)) {
        this.loadFromFile(this.options.storageFile);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }
  
  /**
   * Save to storage file
   * @private
   */
  _saveToStorage() {
    try {
      this.saveToFile(this.options.storageFile);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }
}

module.exports = FlakyLocatorDetector;