/**
 * RetryWithBackoff provides async retry logic with configurable backoff and hooks.
 * Use this to wrap any flaky or failure-prone operation (API, DB, etc.)
 */
const logger = require('./logger');

class RetryWithBackoff {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Retry configuration with fallback defaults
    this.maxRetries = Number(process.env.MAX_RETRIES) || 3;
    this.initialDelay = Number(process.env.RETRY_DELAY_MS) || 1000;
    this.backoffFactor = Number(process.env.RETRY_BACKOFF_FACTOR) || 2;
    this.jitter = options.jitter !== undefined ? options.jitter : true;

    // Optional callback hooks
    this.onSuccess = options.onSuccess || null;
    this.onFail = options.onFail || null;
    this.onFinalFailure = options.onFinalFailure || null;
  }

  /**
   * Wraps and retries a failing async operation.
   * @param {Function} operation - the async function to retry
   * @returns {Promise<any>} - the operation result
   */
  async execute(operation) {
    let attempt = 0;
    let delay = this.initialDelay;

    while (attempt < this.maxRetries) {
      try {
        const result = await operation();

        // Optional success hook
        if (this.onSuccess) {
          await this.onSuccess(result, attempt);
        }

        return result;
      } catch (error) {
        attempt++;

        // Optional failure hook
        if (this.onFail) {
          await this.onFail(error, attempt);
        }

        logger.warn(`Retry ${attempt} failed: ${error.message}`);

        if (attempt >= this.maxRetries) {
          logger.error(`All ${this.maxRetries} attempts failed.`);

          // Optional final failure hook
          if (this.onFinalFailure) {
            await this.onFinalFailure(error);
          }

          throw error;
        }

        const jitterValue = this.jitter ? Math.floor(Math.random() * 200) : 0;
        await this._wait(delay + jitterValue);
        delay *= this.backoffFactor;
      }
    }
  }

  /**
   * Waits for a specified time.
   * @param {number} ms - delay in milliseconds
   * @private
   */
  _wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = RetryWithBackoff;