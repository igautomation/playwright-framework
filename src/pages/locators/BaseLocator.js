// src/pages/locators/BaseLocator.js

import { expect } from '@playwright/test';

/**
 * Base class for managing self-healing and pattern-based locators
 */
class BaseLocator {
  constructor(page) {
    this.page = page;
    this.locators = {};
  }

  /**
   * Add a locator with fallback strategies
   * @param {string} name - Locator name
   * @param {Object} strategies - Primary and fallback locators
   * @param {string} strategies.primary - Primary locator (e.g., data-testid)
   * @param {string[]} strategies.fallbacks - Fallback locators (e.g., ARIA, text)
   */
  addLocator(name, { primary, fallbacks = [] }) {
    this.locators[name] = { primary, fallbacks };
  }

  /**
   * Get a locator with self-healing
   * @param {string} name - Locator name
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  async getLocator(name) {
    const { primary, fallbacks } = this.locators[name] || {};
    if (!primary) {
      throw new Error(`Locator not defined: ${name}`);
    }

    // Try primary locator
    let locator = this.page.locator(primary);
    if (await this.isLocatorValid(locator)) {
      return locator;
    }

    // Try fallbacks
    for (const fallback of fallbacks) {
      locator = this.page.locator(fallback);
      if (await this.isLocatorValid(locator)) {
        console.warn(`Used fallback locator for ${name}: ${fallback}`);
        return locator;
      }
    }

    throw new Error(`No valid locator found for ${name}`);
  }

  /**
   * Validate if a locator is present and visible
   * @param {import('@playwright/test').Locator} locator - Playwright locator
   * @returns {Promise<boolean>} Whether the locator is valid
   */
  async isLocatorValid(locator) {
    try {
      await expect(locator).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

export default BaseLocator;
