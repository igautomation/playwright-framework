<<<<<<< HEAD
// src/utils/web/flakyLocatorDetector.js

/**
 * Flaky Locator Detector Utility for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Detect unstable (flaky) locators during Playwright test execution
 * - Track locator action attempts and failures
 * - Report flaky locators based on failure rates
 */

import ReportUtils from '../reporting/reportUtils.js';

class FlakyLocatorDetector {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page object.
   */
  constructor(page) {
    if (!page) {
      throw new Error('Page object is required');
    }
    this.page = page;
    this.report = new ReportUtils();
    this.locatorAttempts = new Map();
  }

  /**
   * Tracks a locator action and monitors flakiness.
   *
   * @param {string} locator - Locator string (CSS, XPath, etc.).
   * @param {Function} action - Function that performs actions with the locator.
   * @returns {Promise<any>} Result of the action.
   * @throws {Error} If action fails after retries.
   */
  async trackLocator(locator, action) {
    if (!locator || typeof action !== 'function') {
      throw new Error('Locator and action are required');
    }

    const key = locator;
    let attempts = this.locatorAttempts.get(key) || { count: 0, failures: 0 };
    attempts.count++;

    try {
      const element = this.page.locator(locator);
      const result = await action(element);
      return result;
    } catch (error) {
      attempts.failures++;
      this.locatorAttempts.set(key, attempts);

      this.report.attachLog(
        `Flaky locator detected: ${locator} (Failures: ${attempts.failures}/${attempts.count})`,
        'Flaky Locator'
      );

      throw new Error(`Locator action failed: ${error.message}`);
    }
  }

  /**
   * Reports all flaky locators detected during the session.
   *
   * @returns {Array<{locator: string, failureRate: number}>} List of flaky locators sorted by failure rate.
   */
  reportFlakyLocators() {
    const flaky = [];

    for (const [locator, { count, failures }] of this.locatorAttempts) {
      if (failures > 0) {
        flaky.push({
          locator,
          failureRate: (failures / count) * 100
        });
      }
    }

    return flaky.sort((a, b) => b.failureRate - a.failureRate);
  }
}

export default FlakyLocatorDetector;
=======
const logger = require('../common/logger');

/**
 * Flaky Locator Detector class for detecting and tracking flaky locators
 */
class FlakyLocatorDetector {
  /**
   * Constructor
   * @param {Object} options - Options
   */
  constructor(options = {}) {
    this.options = {
      flakyThreshold: 3, // Number of failures to consider a locator flaky
      trackingWindow: 10, // Number of test runs to track
      ...options,
    };

    this.locatorStats = new Map();
    this.flakyLocators = new Set();
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
      logger.debug(`Tracking locator: ${selector}, success: ${success}`);

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
    } catch (error) {
      logger.error(`Error tracking locator: ${selector}`, error);
    }
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
        logger.warn(
          `Detected flaky locator: ${selector}, failure rate: ${(failureRate * 100).toFixed(2)}%`
        );
        this.flakyLocators.add(selector);
      } else if (!isFlaky && this.flakyLocators.has(selector)) {
        logger.info(`Locator is no longer flaky: ${selector}`);
        this.flakyLocators.delete(selector);
      }

      return isFlaky;
    } catch (error) {
      logger.error(`Error checking flaky locator: ${selector}`, error);
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
   * Save flaky locators to file
   * @param {string} filePath - File path
   * @returns {Promise<void>}
   */
  async saveFlakyLocators(filePath) {
    try {
      logger.info(`Saving flaky locators to: ${filePath}`);

      const fs = require('fs');
      const path = require('path');

      // Ensure the directory exists
      const dir = path.dirname(filePath);
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
          };
        }
      );

      // Write the file
      fs.writeFileSync(filePath, JSON.stringify(flakyLocatorData, null, 2));

      logger.info(`Flaky locators saved to: ${filePath}`);
    } catch (error) {
      logger.error(`Error saving flaky locators to: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Load flaky locators from file
   * @param {string} filePath - File path
   * @returns {Promise<void>}
   */
  async loadFlakyLocators(filePath) {
    try {
      logger.info(`Loading flaky locators from: ${filePath}`);

      const fs = require('fs');

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        logger.warn(`Flaky locators file not found: ${filePath}`);
        return;
      }

      // Read the file
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Load flaky locators
      data.forEach((item) => {
        this.flakyLocators.add(item.selector);

        if (item.stats) {
          this.locatorStats.set(item.selector, item.stats);
        }
      });

      logger.info(
        `Loaded ${this.flakyLocators.size} flaky locators from: ${filePath}`
      );
    } catch (error) {
      logger.error(`Error loading flaky locators from: ${filePath}`, error);
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
  }
}

module.exports = FlakyLocatorDetector;
>>>>>>> 51948a2 (Main v1.0)
