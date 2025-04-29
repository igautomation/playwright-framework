// src/fixtures/api.js
/**
 * API utilities module for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Create isolated API request contexts
 * - Standardize helper methods for GET, POST, PUT, DELETE
 */
import { request } from "@playwright/test";

/**
 * Creates a new API request context with optional base URL and headers.
 *
 * @param {string} baseURL - The base URL for API requests.
 * @param {object} [extraHTTPHeaders={}] - Additional headers (e.g., auth).
 * @returns {Promise<import('@playwright/test').APIRequestContext>}
 */
async function createRequestContext(baseURL, extraHTTPHeaders = {}) {
  return await request.newContext({
    baseURL,
    extraHTTPHeaders,
  });
}

/**
 * Generic function to make an API request.
 *
 * @param {import('@playwright/test').APIRequestContext} context - Request context.
 * @param {string} method - HTTP method.
 * @param {string} endpoint - API endpoint path.
 * @param {object} [payload={}] - Request body.
 * @param {object} [headers={}] - Additional headers.
 * @returns {Promise<import('@playwright/test').APIResponse>}
 */
async function makeApiRequest(
  context,
  method,
  endpoint,
  payload = {},
  headers = {}
) {
  const options = {
    headers,
    ...(method.toUpperCase() !== "GET" && { data: payload }),
  };

  switch (method.toUpperCase()) {
    case "GET":
      return await context.get(endpoint, options);
    case "POST":
      return await context.post(endpoint, options);
    case "PUT":
      return await context.put(endpoint, options);
    case "DELETE":
      return await context.delete(endpoint, options);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

/**
 * Performs a GET request.
 */
async function get(context, endpoint, headers = {}) {
  return await makeApiRequest(context, "GET", endpoint, {}, headers);
}

/**
 * Performs a POST request.
 */
async function post(context, endpoint, payload = {}, headers = {}) {
  return await makeApiRequest(context, "POST", endpoint, payload, headers);
}

/**
 * Performs a PUT request.
 */
async function put(context, endpoint, payload = {}, headers = {}) {
  return await makeApiRequest(context, "PUT", endpoint, payload, headers);
}

/**
 * Performs a DELETE request.
 */
async function del(context, endpoint, headers = {}) {
  return await makeApiRequest(context, "DELETE", endpoint, {}, headers);
}

export { createRequestContext, get, post, put, del };
