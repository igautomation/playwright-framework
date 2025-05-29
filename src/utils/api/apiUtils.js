/**
 * API Utilities
 * Provides methods for API testing and interactions
 */
const axios = require('axios');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class ApiUtils {
  /**
   * Create a new ApiUtils instance
   * @param {Object} options - API options
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.API_URL;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add API key if provided
    if (options.apiKey || process.env.API_KEY) {
      const headerName = options.apiKeyHeader || process.env.API_HEADER_NAME || 'x-api-key';
      this.headers[headerName] = options.apiKey || process.env.API_KEY;
    }
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: this.headers,
      timeout: options.timeout || 10000,
    });
    
    // Set up JSON schema validator
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
  }

  /**
   * Send a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async get(endpoint, options = {}) {
    try {
      const response = await this.client.get(endpoint, {
        params: options.params,
        headers: { ...this.headers, ...options.headers },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Send a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async post(endpoint, data, options = {}) {
    try {
      const response = await this.client.post(endpoint, data, {
        headers: { ...this.headers, ...options.headers },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Send a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async put(endpoint, data, options = {}) {
    try {
      const response = await this.client.put(endpoint, data, {
        headers: { ...this.headers, ...options.headers },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Send a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async patch(endpoint, data, options = {}) {
    try {
      const response = await this.client.patch(endpoint, data, {
        headers: { ...this.headers, ...options.headers },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Send a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async delete(endpoint, options = {}) {
    try {
      const response = await this.client.delete(endpoint, {
        headers: { ...this.headers, ...options.headers },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Validate response against JSON schema
   * @param {Object} data - Response data
   * @param {Object} schema - JSON schema
   * @returns {boolean} - Validation result
   */
  validateSchema(data, schema) {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);
    
    if (!valid) {
      const errors = validate.errors.map(error => {
        return {
          path: error.instancePath,
          message: error.message,
          params: error.params,
        };
      });
      
      throw new Error(`Schema validation failed: ${JSON.stringify(errors)}`);
    }
    
    return true;
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   */
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      throw new Error(`API Error ${status}: ${JSON.stringify(data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(`API Request Error: No response received`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`API Request Setup Error: ${error.message}`);
    }
  }
}

module.exports = ApiUtils;