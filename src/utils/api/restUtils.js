/**
 * REST Utilities for API testing
 */
const { request } = require('@playwright/test');

/**
 * REST Utilities class
 */
class RestUtils {
  /**
   * Constructor
   * @param {Object} request - Playwright request object
   * @param {string} baseURL - Base URL for API requests
   * @param {Object} defaultHeaders - Default headers for requests
   */
  constructor(request, baseURL, defaultHeaders = {}) {
    if (!request || !baseURL) {
      throw new Error('Request object and baseURL are required for RestUtils');
    }

    this.request = request;
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
    this.context = null;
  }

  /**
   * Initialize request context
   * @returns {Promise<void>}
   */
  async init() {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.baseURL,
        extraHTTPHeaders: this.defaultHeaders
      });
    }
  }

  /**
   * Send HTTP request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response
   */
  async sendRequest(method, endpoint, options = {}) {
    await this.init();
    const payload = options.data || null;
    
    try {
      console.log(`Sending ${method} to ${this.baseURL}${endpoint}`);
      
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.context.get(endpoint, options);
          break;
        case 'POST':
          response = await this.context.post(endpoint, { data: payload, ...options });
          break;
        case 'PUT':
          response = await this.context.put(endpoint, { data: payload, ...options });
          break;
        case 'DELETE':
          response = await this.context.delete(endpoint, options);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response;
    } catch (error) {
      console.error(`REST call failed: ${method} ${endpoint} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Request with retry
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {number} maxAttempts - Maximum retry attempts
   * @returns {Promise<Object>} Response
   */
  async requestWithRetry(method, endpoint, options = {}, maxAttempts = 2) {
    let attempt = 0;
    let lastError;

    while (attempt < maxAttempts) {
      try {
        return await this.sendRequest(method, endpoint, options);
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed for ${method} ${endpoint}`);
        attempt++;
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // basic backoff
        }
      }
    }

    throw new Error(`All ${maxAttempts} attempts failed: ${lastError.message}`);
  }
  
  /**
   * Dispose request context
   * @returns {Promise<void>}
   */
  async dispose() {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }
}

module.exports = RestUtils;