// src/utils/common/retryWithBackoff.js

/**
 * Retry Utility with Exponential Backoff for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Retry any asynchronous operation multiple times with delays
 * - Use exponential backoff strategy for each subsequent retry
 * - Log each retry attempt through the reporting utility
 */

import ReportUtils from '../reporting/reportUtils.js';

class RetryWithBackoff {
  constructor() {
    this.report = new ReportUtils();
  }

  /**
   * Retries a given asynchronous operation with exponential backoff delay.
   *
   * @param {Function} operation - The operation (async function) to retry.
   * @param {number} [maxRetries=3] - Maximum number of retry attempts.
   * @param {number} [baseDelay=1000] - Base delay in milliseconds.
   * @returns {Promise<any>} Resolves the operation result or throws after retries.
   */
  async retry(operation, maxRetries = 3, baseDelay = 1000) {
    if (typeof operation !== 'function') {
      throw new Error('Operation must be a function');
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

        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

export default RetryWithBackoff;