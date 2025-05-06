<<<<<<< HEAD
// src/utils/api/apiUtils.js

import Ajv from 'ajv';
import { faker } from '@faker-js/faker';
import logger from '../common/logger.js';

// Initialize AJV JSON Schema Validator
const ajv = new Ajv({ allErrors: true, verbose: true });

/**
 * API utility class providing reusable request methods,
 * schema validation, dynamic payload generation, and response checks.
 */
class ApiUtils {
  constructor(apiClient) {
    if (!apiClient) {
      throw new Error('apiClient must be provided to ApiUtils.');
    }

    this.apiClient = apiClient;

    // Default headers for API requests (can be overridden per call)
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }

  /**
   * Sends an HTTP request using apiClient with provided options.
   * Supports GET, POST, PUT, DELETE.
   */
  async sendRequest(method, endpoint, options = {}) {
    const { payload, headers = {}, queryParams = {}, delay } = options;

    const finalUrl = delay ? `${endpoint}?delay=${delay}` : endpoint;
    const body = payload ? JSON.stringify(payload) : null;
    const allHeaders = { ...this.defaultHeaders, ...headers };

    logger.info(`Sending ${method} request to ${finalUrl} with payload: ${body || 'none'}`);
    logger.debug(`Headers: ${JSON.stringify(allHeaders)}`);
    logger.debug(`Query Params: ${JSON.stringify(queryParams)}`);

    try {
      const response = await this.apiClient[method.toLowerCase()](finalUrl, {
        headers: allHeaders,
        params: queryParams,
        data: body
      });

      const responseBody = await response.json().catch(() => ({}));
      const responseHeaders = response.headers();

      logger.info(`Received response for ${finalUrl}: ${JSON.stringify(responseBody)}`);
      logger.debug(`Response headers: ${JSON.stringify(responseHeaders)}`);

      return {
        status: response.status(),
        body: responseBody,
        headers: responseHeaders
      };
    } catch (error) {
      logger.error(`Request failed: ${method} ${finalUrl} - ${error.message}`);
      throw new Error(`API request failed: ${method} ${finalUrl} - ${error.message}`);
    }
  }

  /**
   * Validates a JSON response body against a schema.
   */
  validateSchema(data, schema, endpoint) {
    const validate = ajv.compile(schema);

    if (!validate(data)) {
      const errors = validate.errors.map((err) => `${err.instancePath || 'root'} ${err.message}`);

      logger.error(`Schema validation failed for ${endpoint}: ${errors.join(', ')}`);
      throw new Error(`Schema validation failed for ${endpoint}: ${errors.join(', ')}`);
    }

    logger.info(`✅ Schema validation passed for ${endpoint}`);
  }

  /**
   * Generates dynamic user payload using Faker.
   * Used for POST/PUT testing.
   */
  generateDynamicUser(overrides = {}) {
    const base = {
      name: faker.person.fullName(),
      job: faker.person.jobTitle(),
      email: faker.internet.email()
    };

    const merged = { ...base, ...overrides };
    logger.info(`Generated dynamic payload: ${JSON.stringify(merged)}`);
    return merged;
  }

  /**
   * Validates status code and headers in the response.
   */
  validateResponse(response, expectedStatus, expectedHeaders = {}, endpoint) {
    const { status, headers } = response;

    if (status !== expectedStatus) {
      logger.error(
        `Status validation failed for ${endpoint}: Expected ${expectedStatus}, got ${status}`
      );
      throw new Error(
        `Status validation failed for ${endpoint}: Expected ${expectedStatus}, got ${status}`
      );
    }

    for (const [key, expected] of Object.entries(expectedHeaders)) {
      const actual = headers[key.toLowerCase()];
      if (actual !== expected) {
        logger.error(
          `Header mismatch for ${endpoint}: ${key} expected "${expected}" but got "${actual}"`
        );
        throw new Error(
          `Header mismatch for ${endpoint}: ${key} expected "${expected}" but got "${actual}"`
        );
      }
    }

    logger.info(`✅ Response validation passed for ${endpoint}`);
  }

  /**
   * Verifies API operation is idempotent by making multiple calls.
   */
  async verifyIdempotency(method, endpoint, expectedStatus, attempts = 2) {
    for (let i = 1; i <= attempts; i++) {
      const { status } = await this.sendRequest(method, endpoint);

      if (status !== expectedStatus) {
        const msg = `Idempotency failed on attempt ${i} for ${method} ${endpoint}: Expected ${expectedStatus}, got ${status}`;
        logger.error(msg);
        throw new Error(msg);
      }

      logger.info(`Idempotency passed on attempt ${i}: ${status}`);
=======
const axios = require('axios');
const logger = require('../common/logger');

/**
 * API Utilities class for making API requests
 */
class ApiUtils {
  /**
   * Constructor
   * @param {string} baseUrl - Base URL for API requests
   * @param {Object} defaultHeaders - Default headers for API requests
   */
  constructor(baseUrl, defaultHeaders = {}) {
    this.baseUrl = baseUrl || process.env.API_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...defaultHeaders,
    };

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: this.defaultHeaders,
      timeout: 30000,
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(
          `API Request: ${config.method.toUpperCase()} ${config.url}`,
          {
            headers: config.headers,
            data: config.data,
          }
        );
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(
          `API Response: ${response.status} ${response.statusText}`,
          {
            data: response.data,
          }
        );
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(
            `API Response Error: ${error.response.status} ${error.response.statusText}`,
            {
              data: error.response.data,
            }
          );
        } else {
          logger.error('API Response Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authorization header
   * @param {string} token - Authorization token
   * @param {string} type - Token type (e.g., Bearer)
   * @returns {ApiUtils} This instance for chaining
   */
  setAuthToken(token, type = 'Bearer') {
    this.defaultHeaders['Authorization'] = `${type} ${token}`;
    this.client.defaults.headers.common['Authorization'] = `${type} ${token}`;
    return this;
  }

  /**
   * Set API key
   * @param {string} apiKey - API key
   * @param {string} headerName - Header name for the API key
   * @returns {ApiUtils} This instance for chaining
   */
  setApiKey(apiKey, headerName = 'X-API-Key') {
    this.defaultHeaders[headerName] = apiKey;
    this.client.defaults.headers.common[headerName] = apiKey;
    return this;
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}, headers = {}) {
    try {
      const response = await this.client.get(endpoint, {
        params,
        headers: { ...this.defaultHeaders, ...headers },
      });
      return response.data;
    } catch (error) {
      logger.error(`GET request failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = {}, headers = {}) {
    try {
      const response = await this.client.post(endpoint, data, {
        headers: { ...this.defaultHeaders, ...headers },
      });
      return response.data;
    } catch (error) {
      logger.error(`POST request failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data = {}, headers = {}) {
    try {
      const response = await this.client.put(endpoint, data, {
        headers: { ...this.defaultHeaders, ...headers },
      });
      return response.data;
    } catch (error) {
      logger.error(`PUT request failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, params = {}, headers = {}) {
    try {
      const response = await this.client.delete(endpoint, {
        params,
        headers: { ...this.defaultHeaders, ...headers },
      });
      return response.data;
    } catch (error) {
      logger.error(`DELETE request failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async patch(endpoint, data = {}, headers = {}) {
    try {
      const response = await this.client.patch(endpoint, data, {
        headers: { ...this.defaultHeaders, ...headers },
      });
      return response.data;
    } catch (error) {
      logger.error(`PATCH request failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Make a request with multipart/form-data
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} formData - Form data
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async uploadFile(method, endpoint, formData, headers = {}) {
    try {
      const response = await this.client({
        method,
        url: endpoint,
        data: formData,
        headers: {
          ...this.defaultHeaders,
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      logger.error(`File upload failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Make a batch request
   * @param {Array<Object>} requests - Array of request objects
   * @returns {Promise<Array<Object>>} Array of response data
   */
  async batch(requests) {
    try {
      const promises = requests.map((request) => {
        const { method, endpoint, data, params, headers } = request;

        switch (method.toLowerCase()) {
          case 'get':
            return this.get(endpoint, params, headers);
          case 'post':
            return this.post(endpoint, data, headers);
          case 'put':
            return this.put(endpoint, data, headers);
          case 'delete':
            return this.delete(endpoint, params, headers);
          case 'patch':
            return this.patch(endpoint, data, headers);
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      logger.error('Batch request failed', error);
      throw error;
>>>>>>> 51948a2 (Main v1.0)
    }
  }
}

<<<<<<< HEAD
export default ApiUtils;
=======
module.exports = ApiUtils;
>>>>>>> 51948a2 (Main v1.0)
