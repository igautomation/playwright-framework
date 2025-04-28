// src/utils/api/restUtils.js
const AuthUtils = require('./auth');

/**
 * REST utilities for Playwright API testing
 */
function RestUtils(request) {
  if (!request) throw new Error('Request object is required');
  this.request = request;
  this.auth = new AuthUtils();
}

/**
 * Performs a REST request with retry logic
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - Request URL
 * @param {Object} [options] - Request options (data, headers, etc.)
 * @param {number} [retries=3] - Number of retries
 * @returns {Promise} Resolves to response
 * @throws {Error} If request fails after retries
 */
RestUtils.prototype.requestWithRetry = async function (method, url, options = {}, retries = 3) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
    throw new Error('Invalid HTTP method');
  }
  if (!url) throw new Error('URL is required');
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
          throw new Error('Unsupported method');
      }
    } catch (error) {
      attempt++;
      if (attempt === retries) throw new Error(`Request failed after ${retries} retries: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
};

/**
 * Performs batch REST requests
 * @param {Array} requests - Array of request objects ({ method, url, options })
 * @returns {Promise} Resolves to array of responses
 * @throws {Error} If any request fails
 */
RestUtils.prototype.batchRequests = async function (requests) {
  if (!Array.isArray(requests)) throw new Error('Requests array is required');
  try {
    const promises = requests.map((req) => this.requestWithRetry(req.method, req.url, req.options));
    return await Promise.all(promes);
  } catch (error) {
    throw new Error(`Batch request failed: ${error.message}`);
  }
};

module.exports = RestUtils;