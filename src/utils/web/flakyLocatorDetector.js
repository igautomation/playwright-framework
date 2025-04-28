// src/utils/web/flakyLocatorDetector.js
const ReportUtils = require('../reporting/reportUtils');

/**
 * Utility to detect and report flaky locators
 */
function FlakyLocatorDetector(page) {
  if (!page) throw new Error('Page object is required');
  this.page = page;
  this.report = new ReportUtils();
  this.locatorAttempts = new Map();
}

/**
 * Tracks locator attempts and detects flakiness
 * @param {string} locator - Locator string
 * @param {Function} action - Action to perform with the locator
 * @returns {Promise} Resolves to the action result
 * @throws {Error} If action fails after retries
 */
FlakyLocatorDetector.prototype.trackLocator = async function (locator, action) {
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
    this.report.attachLog(`Flaky locator detected: ${locator} (Failures: ${attempts.failures}/${attempts.count})`, 'Flaky Locator');
    throw new Error(`Locator action failed: ${error.message}`);
  }
};

/**
 * Reports all flaky locators
 * @returns {Array} List of flaky locators with failure rates
 */
FlakyLocatorDetector.prototype.reportFlakyLocators = function () {
  const flaky = [];
  for (const [locator, { count, failures }] of this.locatorAttempts) {
    if (failures > 0) {
      flaky.push({ locator, failureRate: (failures / count) * 100 });
    }
  }
  return flaky.sort((a, b) => b.failureRate - a.failureRate);
};

module.exports = FlakyLocatorDetector;