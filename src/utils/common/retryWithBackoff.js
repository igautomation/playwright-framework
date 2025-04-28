// src/utils/common/retryWithBackoff.js

/**
 * Retry Utility with Exponential Backoff for Playwright Framework.
 *
 * Responsibilities:
 * - Retry any asynchronous operation multiple times with delays
 * - Use exponential backoff strategy for each subsequent retry
 * - Log each retry attempt through the reporting utility
 */

const ReportUtils = require("../reporting/reportUtils");

/**
 * Constructor for RetryWithBackoff utility.
 */
function RetryWithBackoff() {
  this.report = new ReportUtils();
}

/**
 * Retries a given asynchronous operation with exponential backoff delay.
 *
 * @param {Function} operation - The operation (async function) to retry.
 * @param {number} [maxRetries=3] - Maximum number of retry attempts.
 * @param {number} [baseDelay=1000] - Base delay in milliseconds for backoff calculation.
 * @returns {Promise<any>} Resolves to the operation result or throws an error after maximum retries.
 * @throws {Error} If the operation fails after all retries.
 */
RetryWithBackoff.prototype.retry = async function (
  operation,
  maxRetries = 3,
  baseDelay = 1000
) {
  if (typeof operation !== "function") {
    throw new Error("Operation must be a function");
  }

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;

      this.report.attachLog(
        `Retry attempt ${attempt}/${maxRetries} failed: ${error.message}`,
        `Retry ${attempt}`
      );

      if (attempt === maxRetries) {
        throw new Error(
          `Operation failed after ${maxRetries} retries: ${error.message}`
        );
      }

      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff delay
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = RetryWithBackoff;
