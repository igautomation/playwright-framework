// src/utils/web/networkUtils.js

/**
 * Network Utilities for Playwright Automation Framework.
 *
 * Responsibilities:
 * - Intercept and manipulate network requests and responses
 * - Mock API responses
 * - Validate outgoing request payloads
 * - Capture network response details
 */

const { expect } = require("@playwright/test"); // optional for assertions if needed

/**
 * Constructor for NetworkUtils.
 *
 * @param {import('@playwright/test').Page} page - Playwright Page object.
 * @throws {Error} If page is not provided.
 */
function NetworkUtils(page) {
  if (!page) {
    throw new Error("Page object is required");
  }
  this.page = page;
}

/**
 * Intercepts a network request and applies a custom handler.
 *
 * @param {string} urlPattern - URL pattern to match (e.g., '/api/users').
 * @param {Function} handler - Function receiving (route, request) to control.
 * @returns {Promise<void>}
 * @throws {Error} If parameters are invalid.
 *
 * @example
 * const network = new NetworkUtils(page);
 * await network.interceptRequest('/api/users', (route, request) => {
 *   route.fulfill({ status: 200, body: JSON.stringify({ id: '123' }) });
 * });
 */
NetworkUtils.prototype.interceptRequest = async function (urlPattern, handler) {
  if (!urlPattern || typeof handler !== "function") {
    throw new Error("Valid URL pattern and handler function are required");
  }
  await this.page.route(urlPattern, (route, request) =>
    handler(route, request)
  );
};

/**
 * Mocks a network response for a given URL pattern.
 *
 * @param {string} urlPattern - URL pattern to intercept.
 * @param {Object} [response] - Response details.
 * @param {number} [response.status=200] - HTTP status code.
 * @param {Object} [response.body={}] - Response body as JSON.
 * @param {Object} [response.headers={}] - Additional headers.
 * @returns {Promise<void>}
 * @throws {Error} If parameters are invalid.
 */
NetworkUtils.prototype.mockResponse = async function (
  urlPattern,
  { status = 200, body = {}, headers = {} } = {}
) {
  if (!urlPattern) {
    throw new Error("URL pattern is required");
  }
  await this.page.route(urlPattern, (route) => {
    route.fulfill({
      status,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", ...headers },
    });
  });
};

/**
 * Validates the payload of a network request.
 *
 * @param {string} urlPattern - URL pattern to match.
 * @param {Function} validator - Validator function receiving the request object.
 * @returns {Promise<boolean>} Resolves to true if payload validation passes.
 * @throws {Error} If no matching request or validation fails.
 */
NetworkUtils.prototype.validateRequest = async function (
  urlPattern,
  validator
) {
  if (!urlPattern || typeof validator !== "function") {
    throw new Error("Valid URL pattern and validator function are required");
  }

  let isValid = false;

  await this.page.route(urlPattern, (route) => {
    isValid = validator(route.request());
    route.continue();
  });

  try {
    await this.page.waitForRequest(urlPattern, { timeout: 5000 });
  } catch (error) {
    throw new Error(`No request matched ${urlPattern}: ${error.message}`);
  }

  return isValid;
};

/**
 * Captures a network response for a given URL pattern.
 *
 * @param {string} urlPattern - URL pattern to intercept.
 * @returns {Promise<Object>} Resolves to captured response details (status, body, headers).
 * @throws {Error} If no response matches.
 */
NetworkUtils.prototype.captureResponse = async function (urlPattern) {
  if (!urlPattern) {
    throw new Error("URL pattern is required");
  }

  let responseData;

  await this.page.route(urlPattern, async (route) => {
    const response = await route.fetch();
    responseData = {
      status: response.status(),
      body: await response.json().catch(() => null), // Handle non-JSON responses gracefully
      headers: response.headers(),
    };
    route.continue();
  });

  try {
    await this.page.waitForResponse(urlPattern, { timeout: 5000 });
  } catch (error) {
    throw new Error(`No response matched ${urlPattern}: ${error.message}`);
  }

  return responseData;
};

module.exports = NetworkUtils;
