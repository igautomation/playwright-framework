/**
 * API Utilities
 * 
 * Provides helper functions for API testing
 */
const externalResources = require('../../config/external-resources');

/**
 * API Client for making HTTP requests
 */
class ApiClient {
  /**
   * @param {string} baseUrl - Base URL for API requests
   * @param {Object} defaultHeaders - Default headers for all requests
   */
  constructor(baseUrl, defaultHeaders = {}) {
    this.baseUrl = baseUrl || externalResources.apis.default;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
    
    // Validate that baseUrl is provided
    if (!this.baseUrl) {
      throw new Error('API base URL is required. Provide it as a parameter or set DEFAULT_API_URL environment variable.');
    }
  }
  
  /**
   * Set authorization header
   * @param {string} token - Authorization token
   */
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, headers = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...headers }
    });
    
    return this.handleResponse(response);
  }
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data, headers = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { ...this.defaultHeaders, ...headers },
      body: JSON.stringify(data)
    });
    
    return this.handleResponse(response);
  }
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data, headers = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { ...this.defaultHeaders, ...headers },
      body: JSON.stringify(data)
    });
    
    return this.handleResponse(response);
  }
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, headers = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: { ...this.defaultHeaders, ...headers }
    });
    
    return this.handleResponse(response);
  }
  
  /**
   * Handle API response
   * @param {Response} response - Fetch response
   * @returns {Promise<Object>} Response data
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
      }
      
      return data;
    } else {
      const text = await response.text();
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${text}`);
      }
      
      return text;
    }
  }
}

module.exports = {
  ApiClient
};