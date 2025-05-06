/**
 * API utilities for testing
 */
const logger = require('../common/logger');

class ApiUtils {
  /**
   * Constructor
   * @param {string} baseUrl - Base URL for API requests
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'https://api.example.com';
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Set authorization header
   * @param {string} token - Authorization token
   * @param {string} type - Authorization type (e.g., 'Bearer')
   * @returns {ApiUtils} This instance for chaining
   */
  setAuth(token, type = 'Bearer') {
    this.headers['Authorization'] = `${type} ${token}`;
    return this;
  }

  /**
   * Set custom header
   * @param {string} name - Header name
   * @param {string} value - Header value
   * @returns {ApiUtils} This instance for chaining
   */
  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response object
   */
  async get(endpoint, options = {}) {
    const url = this._buildUrl(endpoint);
    logger.info(`GET ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { ...this.headers, ...options.headers },
        ...options
      });
      
      return await this._processResponse(response);
    } catch (error) {
      logger.error(`GET ${url} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response object
   */
  async post(endpoint, data, options = {}) {
    const url = this._buildUrl(endpoint);
    logger.info(`POST ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...this.headers, ...options.headers },
        body: JSON.stringify(data),
        ...options
      });
      
      return await this._processResponse(response);
    } catch (error) {
      logger.error(`POST ${url} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response object
   */
  async put(endpoint, data, options = {}) {
    const url = this._buildUrl(endpoint);
    logger.info(`PUT ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { ...this.headers, ...options.headers },
        body: JSON.stringify(data),
        ...options
      });
      
      return await this._processResponse(response);
    } catch (error) {
      logger.error(`PUT ${url} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response object
   */
  async delete(endpoint, options = {}) {
    const url = this._buildUrl(endpoint);
    logger.info(`DELETE ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { ...this.headers, ...options.headers },
        ...options
      });
      
      return await this._processResponse(response);
    } catch (error) {
      logger.error(`DELETE ${url} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate response against schema
   * @param {Object} response - Response object
   * @param {Object} schema - JSON schema
   * @returns {boolean} Validation result
   */
  validateSchema(response, schema) {
    // This would typically use a schema validator like Ajv
    // For now, we'll just return true
    return true;
  }

  /**
   * Build URL from endpoint
   * @param {string} endpoint - API endpoint
   * @returns {string} Full URL
   * @private
   */
  _buildUrl(endpoint) {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * Process response
   * @param {Response} response - Fetch response
   * @returns {Promise<Object>} Processed response
   * @private
   */
  async _processResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data
    };
  }
}

module.exports = ApiUtils;