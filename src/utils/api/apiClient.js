/**
 * API Client
 * 
 * Consolidated API client that combines functionality from apiRequest.js and apiUtils.js
 */
const { request } = require('@playwright/test');
const config = require('../../config');

/**
 * API Client for making HTTP requests
 */
class ApiClient {
  /**
   * Constructor
   * @param {string} baseUrl - Base URL for API requests
   * @param {Object} options - Additional options for API requests
   */
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl || config.api.baseUrl;
    this.options = options;
    this.defaultHeaders = options.headers || {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add API key header if available from environment or config
    const apiKey = process.env.API_KEY || config.api.apiKey;
    const apiHeaderName = process.env.API_HEADER_NAME || 'x-api-key';
    if (apiKey) {
      this.defaultHeaders[apiHeaderName] = apiKey;
    }
    
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
        extraHTTPHeaders: this.defaultHeaders,
        ...this.options
      });
    }
  }

  /**
   * Format URL with path
   * @param {string} path - API path
   * @returns {string} Full URL
   */
  formatUrl(path) {
    // Handle paths that already have a protocol
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Ensure path starts with / if baseUrl doesn't end with /
    if (this.baseUrl && !this.baseUrl.endsWith('/') && !path.startsWith('/')) {
      path = `/${path}`;
    }
    
    return path;
  }

  /**
   * Make a GET request
   * @param {string} path - URL path
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async get(path, options = {}) {
    await this.init();
    const url = this.formatUrl(path);
    
    // Handle query parameters
    const params = options.params || {};
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, value);
    }
    
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
    
    const response = await this.requestContext.get(fullUrl, options);
    return await this.handleResponse(response);
  }

  /**
   * Make a POST request
   * @param {string} path - URL path
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async post(path, data, options = {}) {
    await this.init();
    const url = this.formatUrl(path);
    
    const requestOptions = {
      ...options,
      data
    };
    
    const response = await this.requestContext.post(url, requestOptions);
    return await this.handleResponse(response);
  }

  /**
   * Make a PUT request
   * @param {string} path - URL path
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async put(path, data, options = {}) {
    await this.init();
    const url = this.formatUrl(path);
    
    const requestOptions = {
      ...options,
      data
    };
    
    const response = await this.requestContext.put(url, requestOptions);
    return await this.handleResponse(response);
  }

  /**
   * Make a PATCH request
   * @param {string} path - URL path
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async patch(path, data, options = {}) {
    await this.init();
    const url = this.formatUrl(path);
    
    const requestOptions = {
      ...options,
      data
    };
    
    const response = await this.requestContext.patch(url, requestOptions);
    return await this.handleResponse(response);
  }

  /**
   * Make a DELETE request
   * @param {string} path - URL path
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async delete(path, options = {}) {
    await this.init();
    const url = this.formatUrl(path);
    
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
   * Set auth token for requests
   * @param {string} token - Auth token
   * @param {string} scheme - Auth scheme (default: Bearer)
   */
  setAuthToken(token, scheme = 'Bearer') {
    this.defaultHeaders['Authorization'] = `${scheme} ${token}`;
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

module.exports = ApiClient;