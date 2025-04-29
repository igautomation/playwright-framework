// src/utils/api/restUtils.js

/**
 * REST Utilities for Playwright API Testing (ESM Compliant).
 *
 * Responsibilities:
 * - Perform HTTP REST requests with retry logic
 * - Handle batch API requests in parallel
 * - Automatically attach API Key authentication headers
 */

import AuthUtils from './auth.js';

class RestUtils {
  /**
   * Constructor for RestUtils.
   *
   * @param {import('@playwright/test').APIRequestContext} request - Playwright APIRequestContext object.
   * @throws {Error} If request is not provided.
   */
  constructor(request) {
    if (!request) {
      throw new Error('Request object is required');
    }
    this.request = request;
    this.auth = new AuthUtils();
  }

  /**
   * Performs a REST API request with retry logic and exponential backoff.
   *
   * @param {string} method - HTTP method ('GET', 'POST', 'PUT', 'DELETE').
   * @param {string} url - Request URL.
   * @param {Object} [options={}] - Additional request options.
   * @param {number} [retries=3] - Maximum number of retries.
   * @returns {Promise<Response>} - Playwright API Response object.
   */
  async requestWithRetry(method, url, options = {}, retries = 3) {
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
      throw new Error('Invalid HTTP method');
    }
    if (!url) {
      throw new Error('URL is required');
    }

    let attempt = 0;

    while (attempt < retries) {
      try {
        const headers = { ...this.auth.getApiKeyHeaders(), ...options.headers };
        const requestOptions = { ...options, headers };

        switch (method.toUpperCase()) {
          case 'GET':
            return await this.request.get(url, requestOptions);
          case 'POST':
            return await this.request.post(url, requestOptions);
          case 'PUT':
            return await this.request.put(url, requestOptions);
          case 'DELETE':
            return await this.request.delete(url, requestOptions);
          default:
            throw new Error('Unsupported HTTP method');
        }
      } catch (error) {
        attempt++;
        if (attempt === retries) {
          throw new Error(`Request failed after ${retries} retries: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  /**
   * Performs multiple REST API requests in parallel (batch execution).
   *
   * @param {Array<{method: string, url: string, options?: Object}>} requests - Array of request objects.
   * @returns {Promise<Array<Response>>} - Array of API Response objects.
   */
  async batchRequests(requests) {
    if (!Array.isArray(requests)) {
      throw new Error('Requests array is required');
    }

    try {
      const promises = requests.map((req) =>
        this.requestWithRetry(req.method, req.url, req.options)
      );
      return await Promise.all(promises);
    } catch (error) {
      throw new Error(`Batch request failed: ${error.message}`);
    }
  }
}

export default RestUtils;