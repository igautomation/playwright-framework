// src/utils/web/networkUtils.js

/**
 * Network interception utilities for Playwright tests
 * Requires Playwright's page object (from @playwright/test)
 */
function NetworkUtils(page) {
    if (!page) throw new Error('Page object is required');
    this.page = page;
  }
  
  /**
   * Intercepts a network request and applies a custom handler
   * @param {string} urlPattern - URL pattern to match (e.g., /api/users')
   * @param {Function} handler - Handler function receiving route and request objects
   * @returns {Promise} Resolves when the route is set
   * @throws {Error} If urlPattern or handler is invalid
   * @example
   * const network = new NetworkUtils(page);
   * await network.interceptRequest('/api/users', (route, request) => {
   *   route.fulfill({ status: 200, body: JSON.stringify({ id: '123' }) });
   * });
   */

  NetworkUtils.prototype.interceptRequest = async function (urlPattern, handler) {
    if (!urlPattern || typeof handler !== 'function') {
      throw new Error('Valid URL pattern and handler function are required');
    }
    await this.page.route(urlPattern, (route, request) => handler(route, request));
  };
  
  /**
   * Mocks a network response for a given URL pattern
   * @param {string} urlPattern - URL pattern to match
   * @param {Object} [response] - Response details
   * @param {number} [response.status=200] - HTTP status code
   * @param {Object} [response.body={}] - Response body (JSON)
   * @param {Object} [response.headers={}] - Response headers
   * @returns {Promise} Resolves when the mock is set
   * @throws {Error} If urlPattern is invalid
   */
  NetworkUtils.prototype.mockResponse = async function (
    urlPattern,
    { status = 200, body = {}, headers = {} } = {}
  ) {
    if (!urlPattern) throw new Error('URL pattern is required');
    await this.page.route(urlPattern, (route) => {
      route.fulfill({
        status,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    });
  };
  
  /**
   * Validates a network request’s payload
   * @param {string} urlPattern - URL pattern to match
   * @param {Function} validator - Validator function receiving request object
   * @returns {Promise} Resolves to true if the request payload is valid
   * @throws {Error} If urlPattern or validator is invalid
   */
  NetworkUtils.prototype.validateRequest = async function (urlPattern, validator) {
    if (!urlPattern || typeof validator !== 'function') {
      throw new Error('Valid URL pattern and validator function are required');
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
   * Captures a network request’s response
   * @param {string} urlPattern - URL pattern to match
   * @returns {Promise} Resolves to response details (status, body, headers)
   * @throws {Error} If urlPattern is invalid
   */
  NetworkUtils.prototype.captureResponse = async function (urlPattern) {
    if (!urlPattern) throw new Error('URL pattern is required');
    let responseData;
    await this.page.route(urlPattern, async (route) => {
      const response = await route.fetch();
      responseData = {
        status: response.status(),
        body: await response.json().catch(() => null), // Handle non-JSON responses
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