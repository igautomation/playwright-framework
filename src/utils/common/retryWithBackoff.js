// src/utils/common/retryWithBackoff.js
const ReportUtils = require('../reporting/reportUtils');

/**
 * Utility for retrying operations with exponential backoff
 */
function RetryWithBackoff() {
  this.report = new ReportUtils();
}

/**
 * Retries an operation with exponential backoff
 * @param {Function} operation - Operation to retry
 * @param {number} [maxRetries=3] - Maximum number of retries
 * @param {number} [baseDelay=1000] - Base delay in milliseconds
 * @returns {Promise} Resolves to the operation result
 * @throws {Error} If operation fails after retries
 */
RetryWithBackoff.prototype.retry = async function (operation, maxRetries = 3, baseDelay = 1000) {
  if (typeof operation !== 'function') throw new Error('Operation must be a function');
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      this.report.attachLog(`Retry attempt ${attempt}/${maxRetries} failed: ${error.message}`, `Retry ${attempt}`);
      if (attempt === maxRetries) {
        throw new Error(`Operation failed after ${maxRetries} retries: ${error.message}`);
      }
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = RetryWithBackoff;