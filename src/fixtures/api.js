// src/fixtures/api.js

/**
 * API utilities module to perform HTTP requests using Playwright's request context.
 * Provides standardized helper methods for GET, POST, PUT, DELETE operations.
 *
 * This module promotes code reuse and centralized API management across tests.
 */

const { request } = require("@playwright/test");

/**
 * Creates a new API request context.
 * This context is isolated per test and includes a base URL and optional headers.
 *
 * @param {string} baseURL - The base URL for the API requests (e.g., 'https://example.com/api').
 * @param {object} [extraHTTPHeaders={}] - Optional additional headers (e.g., authentication tokens).
 * @returns {Promise<APIRequestContext>} - Returns a new Playwright APIRequestContext instance.
 *
 * Example usage:
 * ```javascript
 * const context = await createRequestContext('https://example.com/api', { Authorization: 'Bearer token' });
 * ```
 */
async function createRequestContext(baseURL, extraHTTPHeaders = {}) {
  return await request.newContext({
    baseURL,
    extraHTTPHeaders,
  });
}

/**
 * Generic function to make an API request.
 * Automatically builds request options based on method and payload.
 *
 * @param {APIRequestContext} context - The Playwright request context created earlier.
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @param {string} endpoint - API endpoint (e.g., '/users/123').
 * @param {object} [payload={}] - Optional request body payload for non-GET methods.
 * @param {object} [headers={}] - Optional additional request headers.
 * @returns {Promise<Response>} - Returns a Playwright API response object.
 *
 * Example usage:
 * ```javascript
 * const response = await makeApiRequest(context, 'POST', '/users', { name: 'John Doe' });
 * ```
 */
async function makeApiRequest(
  context,
  method,
  endpoint,
  payload = {},
  headers = {}
) {
  const options = {
    method,
    headers,
    ...(method.toUpperCase() !== "GET" && { data: payload }),
  };

  return await context.request(endpoint, options);
}

/**
 * Performs a GET request to the specified endpoint.
 *
 * @param {APIRequestContext} context - The Playwright request context.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [headers={}] - Optional headers.
 * @returns {Promise<Response>} - API response.
 */
async function get(context, endpoint, headers = {}) {
  return await makeApiRequest(context, "GET", endpoint, {}, headers);
}

/**
 * Performs a POST request with an optional payload.
 *
 * @param {APIRequestContext} context - The Playwright request context.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [payload={}] - Request body.
 * @param {object} [headers={}] - Optional headers.
 * @returns {Promise<Response>} - API response.
 */
async function post(context, endpoint, payload = {}, headers = {}) {
  return await makeApiRequest(context, "POST", endpoint, payload, headers);
}

/**
 * Performs a PUT request with an optional payload.
 *
 * @param {APIRequestContext} context - The Playwright request context.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [payload={}] - Request body.
 * @param {object} [headers={}] - Optional headers.
 * @returns {Promise<Response>} - API response.
 */
async function put(context, endpoint, payload = {}, headers = {}) {
  return await makeApiRequest(context, "PUT", endpoint, payload, headers);
}

/**
 * Performs a DELETE request to the specified endpoint.
 *
 * @param {APIRequestContext} context - The Playwright request context.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [headers={}] - Optional headers.
 * @returns {Promise<Response>} - API response.
 */
async function del(context, endpoint, headers = {}) {
  return await makeApiRequest(context, "DELETE", endpoint, {}, headers);
}

// Export all API request functions for external usage
module.exports = {
  createRequestContext,
  get,
  post,
  put,
  del,
};
