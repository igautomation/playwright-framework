// src/utils/api/restUtils.js

import logger from '../common/logger.js';

class RestUtils {
  constructor(request, baseURL, defaultHeaders = {}) {
    if (!request || !baseURL) {
      throw new Error('Request object and baseURL are required for RestUtils');
    }

    this.request = request;
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
  }

  // Central method to send HTTP requests
  async sendRequest(method, endpoint, options = {}) {
    const url = this.baseURL + endpoint;
    const headers = { ...this.defaultHeaders, ...options.headers };
    const payload = options.data || null;

    try {
      logger.info(`Sending ${method} to ${url}`);
      logger.debug(`Headers: ${JSON.stringify(headers)}`);
      if (payload) {
        logger.debug(`Payload: ${JSON.stringify(payload)}`);
      }

      const context = await this.request.newContext({
        baseURL: this.baseURL,
        extraHTTPHeaders: headers,
      });

      let response;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await context.get(endpoint);
          break;
        case 'POST':
          response = await context.post(endpoint, { data: payload });
          break;
        case 'PUT':
          response = await context.put(endpoint, { data: payload });
          break;
        case 'DELETE':
          response = await context.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response;
    } catch (error) {
      logger.error(`REST call failed: ${method} ${endpoint} - ${error.message}`);
      throw error;
    }
  }

  // Retry wrapper for resilient requests (basic version)
  async requestWithRetry(method, endpoint, options = {}, maxAttempts = 2) {
    let attempt = 0;
    let lastError;

    while (attempt < maxAttempts) {
      try {
        return await this.sendRequest(method, endpoint, options);
      } catch (error) {
        lastError = error;
        logger.warn(`Attempt ${attempt + 1} failed for ${method} ${endpoint}`);
        attempt++;
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // basic backoff
        }
      }
    }

    throw new Error(`All ${maxAttempts} attempts failed: ${lastError.message}`);
  }
}

export default RestUtils;
