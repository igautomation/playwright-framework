/**
 * API Utilities
 * 
 * Provides utilities for API testing with Playwright
 */
const config = require('../../config');

/**
 * API Utils class for API testing
 */
class ApiUtils {
  /**
   * Constructor
   * @param {Object} request - Playwright request object
   * @param {string} baseUrl - Base URL for API requests
   */
  constructor(request, baseUrl) {
    this.request = request;
    this.baseUrl = baseUrl || config.api?.baseUrl || process.env.API_BASE_URL;
    
    // Get API key from config or environment
    const apiKey = process.env.API_KEY || config.api?.apiKey;
    
    // Set default headers with API key if available
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (apiKey) {
      this.defaultHeaders['x-api-key'] = apiKey;
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
    
    return this.baseUrl ? `${this.baseUrl}${path}` : path;
  }
  
  /**
   * Make GET request
   * @param {string} path - API path
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response
   */
  async get(path, options = {}) {
    const url = this.formatUrl(path);
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    // Handle query parameters
    const params = options.params || {};
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, value);
    }
    
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
    
    return await this.request.get(fullUrl, {
      headers,
      ...options
    });
  }
  
  /**
   * Make POST request
   * @param {string} path - API path
   * @param {Object|string} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response
   */
  async post(path, data, options = {}) {
    const url = this.formatUrl(path);
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    return await this.request.post(url, {
      headers,
      data,
      ...options
    });
  }
  
  /**
   * Make PUT request
   * @param {string} path - API path
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response
   */
  async put(path, data, options = {}) {
    const url = this.formatUrl(path);
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    return await this.request.put(url, {
      headers,
      data,
      ...options
    });
  }
  
  /**
   * Make PATCH request
   * @param {string} path - API path
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response
   */
  async patch(path, data, options = {}) {
    const url = this.formatUrl(path);
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    return await this.request.patch(url, {
      headers,
      data,
      ...options
    });
  }
  
  /**
   * Make DELETE request
   * @param {string} path - API path
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response
   */
  async delete(path, options = {}) {
    const url = this.formatUrl(path);
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    return await this.request.delete(url, {
      headers,
      ...options
    });
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
   * Get headers with auth token
   * @param {string} token - Auth token
   * @param {string} scheme - Auth scheme (default: Bearer)
   * @returns {Object} Headers with auth token
   */
  getAuthHeaders(token, scheme = 'Bearer') {
    return {
      ...this.defaultHeaders,
      'Authorization': `${scheme} ${token}`
    };
  }
}

module.exports = {
  ApiUtils
};