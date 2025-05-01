// src/utils/api/restUtils.js
import logger from '../common/logger.js';

/**
 * Utility class for REST API operations with retry logic.
 */
export default class RestUtils {
  constructor(request) {
    this.request = request;
  }

  /**
   * Sends an HTTP request with retry logic.
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
   * @param {string} endpoint - API endpoint.
   * @param {object} options - Request options (headers, params, data).
   * @returns {Promise<object>} Response object.
   */
  async requestWithRetry(method, endpoint, options = {}) {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        logger.debug(`Attempt ${attempt + 1} for ${method} ${endpoint}`);
        const response = await this.request[method.toLowerCase()](endpoint, options);
        return response;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          logger.error(
            `Failed after ${maxRetries} attempts for ${method} ${endpoint}: ${error.message}`
          );
          throw error;
        }
        logger.warn(`Retry ${attempt} for ${method} ${endpoint}: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Sends batch HTTP requests.
   * @param {Array<object>} requests - Array of request objects.
   * @returns {Promise<Array<object>>} Array of responses.
   */
  async batchRequests(requests) {
    try {
      const responses = await Promise.all(
        requests.map((req) => this.requestWithRetry(req.method, req.endpoint, req.options))
      );
      logger.info(`Batch request completed with ${responses.length} responses`);
      return responses;
    } catch (error) {
      logger.error(`Batch request failed: ${error.message}`);
      throw new Error(`Batch request failed: ${error.message}`);
    }
  }
}
