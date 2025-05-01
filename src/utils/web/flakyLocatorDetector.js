// src/utils/web/flakyLocatorDetector.js

/**
 * Flaky Locator Detector Utility for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Detect unstable (flaky) locators during Playwright test execution
 * - Track locator action attempts and failures
 * - Report flaky locators based on failure rates
 */

import ReportUtils from "../reporting/reportUtils.js";

class FlakyLocatorDetector {
  /**
   * @param {import('@playwright/test').Page} page - Playwright Page object.
   */
  constructor(page) {
    if (!page) {
      throw new Error("Page object is required");
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
    if (!locator || typeof action !== "function") {
      throw new Error("Locator and action are required");
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
        "Flaky Locator"
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
          failureRate: (failures / count) * 100,
        });
      }
    }

    return flaky.sort((a, b) => b.failureRate - a.failureRate);
  }
}

export default FlakyLocatorDetector;
