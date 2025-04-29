// src/utils/web/networkUtils.js

/**
 * Network Utilities for Playwright Automation Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Intercept and manipulate network requests and responses
 * - Mock API responses
 * - Validate outgoing request payloads
 * - Capture network response details
 */

class NetworkUtils {
  /**
   * Constructor for NetworkUtils.
   *
   * @param {import('@playwright/test').Page} page - Playwright Page object.
   */
  constructor(page) {
    if (!page) {
      throw new Error('Page object is required');
    }
    this.page = page;
  }

  /**
   * Intercepts a network request and applies a custom handler.
   */
  async interceptRequest(urlPattern, handler) {
    if (!urlPattern || typeof handler !== 'function') {
      throw new Error('Valid URL pattern and handler function are required');
    }
    await this.page.route(urlPattern, (route, request) => handler(route, request));
  }

  /**
   * Mocks a network response for a given URL pattern.
   */
  async mockResponse(urlPattern, { status = 200, body = {}, headers = {} } = {}) {
    if (!urlPattern) {
      throw new Error('URL pattern is required');
    }
    await this.page.route(urlPattern, (route) => {
      route.fulfill({
        status,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    });
  }

  /**
   * Validates the payload of a network request.
   */
  async validateRequest(urlPattern, validator) {
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
  }

  /**
   * Captures a network response for a given URL pattern.
   */
  async captureResponse(urlPattern) {
    if (!urlPattern) {
      throw new Error('URL pattern is required');
    }

    let responseData;

    await this.page.route(urlPattern, async (route) => {
      const response = await route.fetch();
      responseData = {
        status: response.status(),
        body: await response.json().catch(() => null),
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
  }
}

export default NetworkUtils;