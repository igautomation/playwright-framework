/**
 * API Request utility for making HTTP requests
 * 
 * This class provides a wrapper around Playwright's APIRequestContext
 * for making HTTP requests to REST APIs.
 */
const { request } = require('@playwright/test');

class ApiRequest {
  /**
   * Constructor
   * @param {string} baseUrl - Base URL for API requests
   * @param {Object} options - Additional options for API requests
   */
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.options = options;
    this.headers = options.headers || {};
    this.requestContext = null;
  }

  /**
   * Initialize the API request context
   * @returns {Promise<void>}
   */
  async init() {
    if (!this.requestContext) {
      this.requestContext = await request.newContext({
        baseURL: this.baseUrl,
        extraHTTPHeaders: this.headers,
        ...this.options
      });
    }
  }

  /**
   * Make a GET request
   * @param {string} url - URL to request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async get(url, options = {}) {
    await this.init();
    const response = await this.requestContext.get(url, options);
    return await this.handleResponse(response);
  }

  /**
   * Make a POST request
   * @param {string} url - URL to request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async post(url, options = {}) {
    await this.init();
    const response = await this.requestContext.post(url, options);
    return await this.handleResponse(response);
  }

  /**
   * Make a PUT request
   * @param {string} url - URL to request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async put(url, options = {}) {
    await this.init();
    const response = await this.requestContext.put(url, options);
    return await this.handleResponse(response);
  }

  /**
   * Make a PATCH request
   * @param {string} url - URL to request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async patch(url, options = {}) {
    await this.init();
    const response = await this.requestContext.patch(url, options);
    return await this.handleResponse(response);
  }

  /**
   * Make a DELETE request
   * @param {string} url - URL to request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async delete(url, options = {}) {
    await this.init();
    const response = await this.requestContext.delete(url, options);
    return await this.handleResponse(response);
  }

  /**
   * Handle API response
   * @param {import('@playwright/test').APIResponse} response - API response
   * @returns {Promise<Object>} Processed response data
   * @private
   */
  async handleResponse(response) {
    const contentType = response.headers()['content-type'] || '';
    const status = response.status();
    
    // For successful responses
    if (response.ok()) {
      if (contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    }
    
    // For error responses
    const error = new Error(`API request failed with status ${status}`);
    error.status = status;
    error.response = response;
    
    try {
      if (contentType.includes('application/json')) {
        error.data = await response.json();
      } else {
        error.data = await response.text();
      }
    } catch (e) {
      error.data = null;
    }
    
    throw error;
  }

  /**
   * Dispose the API request context
   * @returns {Promise<void>}
   */
  async dispose() {
    if (this.requestContext) {
      await this.requestContext.dispose();
      this.requestContext = null;
    }
  }
}

module.exports = ApiRequest;