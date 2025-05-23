/**
 * Network Utilities
 * 
 * Provides utilities for intercepting and manipulating network requests
 */
const config = require('../../config');

/**
 * Network Utilities class for handling network requests and responses
 */
class NetworkUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options
   */
  constructor(page, options = {}) {
    if (!page) {
      throw new Error('Page object is required');
    }
    this.page = page;
    this.interceptedRequests = [];
    this.interceptedResponses = [];
    this.requestHandlers = new Map();
    this.responseHandlers = new Map();
    this.options = {
      maxStoredRequests: options.maxStoredRequests || 100,
      maxStoredResponses: options.maxStoredResponses || 100,
      ...options
    };
  }

  /**
   * Start intercepting network requests
   * @returns {Promise<void>}
   */
  async startIntercepting() {
    // Set up request interception
    await this.page.route('**/*', async (route, request) => {
      const url = request.url();
      const method = request.method();
      const resourceType = request.resourceType();

      // Store the intercepted request
      const interceptedRequest = {
        url,
        method,
        resourceType,
        headers: request.headers(),
        timestamp: new Date().toISOString(),
      };

      // Add to intercepted requests, maintaining max size
      this.interceptedRequests.unshift(interceptedRequest);
      if (this.interceptedRequests.length > this.options.maxStoredRequests) {
        this.interceptedRequests = this.interceptedRequests.slice(0, this.options.maxStoredRequests);
      }

      // Check if we have a handler for this request
      const handlers = Array.from(this.requestHandlers.entries())
        .filter(([pattern]) => this.matchPattern(url, pattern))
        .map(([, handler]) => handler);

      if (handlers.length > 0) {
        // Execute handlers
        for (const handler of handlers) {
          try {
            await handler(route, request);
            // If handler doesn't call route.continue() or route.fulfill(), we need to continue
            if (!route.isHandled()) {
              await route.continue();
            }
            return;
          } catch (handlerError) {
            console.error(`Error in request handler for: ${url}`, handlerError);
          }
        }
      }

      // Continue the request if no handlers or all handlers failed
      if (!route.isHandled()) {
        await route.continue();
      }
    });

    // Set up response interception
    this.page.on('response', async (response) => {
      try {
        const url = response.url();
        const status = response.status();
        const headers = response.headers();

        // Store the intercepted response
        const interceptedResponse = {
          url,
          status,
          headers,
          timestamp: new Date().toISOString(),
        };

        // Try to get the response body
        try {
          const contentType = headers['content-type'] || '';

          if (contentType.includes('application/json')) {
            interceptedResponse.body = await response
              .json()
              .catch(() => null);
          } else if (contentType.includes('text/')) {
            interceptedResponse.body = await response
              .text()
              .catch(() => null);
          }
        } catch (bodyError) {
          // Ignore body extraction errors
        }

        // Add to intercepted responses, maintaining max size
        this.interceptedResponses.unshift(interceptedResponse);
        if (this.interceptedResponses.length > this.options.maxStoredResponses) {
          this.interceptedResponses = this.interceptedResponses.slice(0, this.options.maxStoredResponses);
        }

        // Check if we have a handler for this response
        const handlers = Array.from(this.responseHandlers.entries())
          .filter(([pattern]) => this.matchPattern(url, pattern))
          .map(([, handler]) => handler);

        if (handlers.length > 0) {
          // Execute handlers
          for (const handler of handlers) {
            try {
              await handler(response);
            } catch (handlerError) {
              console.error(`Error in response handler for: ${url}`, handlerError);
            }
          }
        }
      } catch (error) {
        console.error(`Error intercepting response: ${response.url()}`, error);
      }
    });
  }

  /**
   * Stop intercepting network requests
   * @returns {Promise<void>}
   */
  async stopIntercepting() {
    // Remove all route handlers
    await this.page.unroute('**/*');

    // Clear handlers
    this.requestHandlers.clear();
    this.responseHandlers.clear();
  }

  /**
   * Add a request handler
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Function} handler - Handler function
   * @returns {NetworkUtils} This instance for chaining
   */
  addRequestHandler(urlPattern, handler) {
    this.requestHandlers.set(urlPattern, handler);
    return this;
  }

  /**
   * Add a response handler
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Function} handler - Handler function
   * @returns {NetworkUtils} This instance for chaining
   */
  addResponseHandler(urlPattern, handler) {
    this.responseHandlers.set(urlPattern, handler);
    return this;
  }

  /**
   * Mock a response
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Object|Function} responseData - Response data or function that returns response data
   * @param {Object} options - Options
   * @returns {NetworkUtils} This instance for chaining
   */
  mockResponse(urlPattern, responseData, options = {}) {
    this.addRequestHandler(urlPattern, async (route, request) => {
      try {
        // Get response data
        const data =
          typeof responseData === 'function'
            ? await responseData(request)
            : responseData;

        // Set up response options
        const responseOptions = {
          status: options.status || 200,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        };

        // Fulfill the request with mock data
        await route.fulfill({
          ...responseOptions,
          body: typeof data === 'string' ? data : JSON.stringify(data),
        });
      } catch (error) {
        console.error(`Error mocking response for: ${request.url()}`, error);
        await route.continue();
      }
    });

    return this;
  }

  /**
   * Block requests
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Object} options - Options
   * @returns {NetworkUtils} This instance for chaining
   */
  blockRequests(urlPattern, options = {}) {
    this.addRequestHandler(urlPattern, async (route) => {
      await route.abort(options.errorCode || 'blockedbyclient');
    });

    return this;
  }

  /**
   * Wait for a request
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Object} options - Options
   * @returns {Promise<Object>} Request object
   */
  async waitForRequest(urlPattern, options = {}) {
    const timeout = options.timeout || 30000;
    const predicate = options.predicate || (() => true);

    // Check if we already have a matching request
    const existingRequest = this.interceptedRequests.find(
      (req) => this.matchPattern(req.url, urlPattern) && predicate(req)
    );

    if (existingRequest) {
      return existingRequest;
    }

    // Wait for the request
    const request = await this.page.waitForRequest(
      (req) => this.matchPattern(req.url(), urlPattern) && predicate(req),
      { timeout }
    );

    return {
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Wait for a response
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Object} options - Options
   * @returns {Promise<Object>} Response object
   */
  async waitForResponse(urlPattern, options = {}) {
    const timeout = options.timeout || 30000;
    const predicate = options.predicate || (() => true);

    // Check if we already have a matching response
    const existingResponse = this.interceptedResponses.find(
      (res) => this.matchPattern(res.url, urlPattern) && predicate(res)
    );

    if (existingResponse) {
      return existingResponse;
    }

    // Wait for the response
    const response = await this.page.waitForResponse(
      (res) => this.matchPattern(res.url(), urlPattern) && predicate(res),
      { timeout }
    );

    const result = {
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      timestamp: new Date().toISOString(),
    };

    // Try to get the response body
    try {
      const contentType = response.headers()['content-type'] || '';

      if (contentType.includes('application/json')) {
        result.body = await response.json().catch(() => null);
      } else if (contentType.includes('text/')) {
        result.body = await response.text().catch(() => null);
      }
    } catch (bodyError) {
      // Ignore body extraction errors
    }

    return result;
  }

  /**
   * Get intercepted requests
   * @param {string|RegExp} [urlPattern] - URL pattern to filter by
   * @returns {Array<Object>} Intercepted requests
   */
  getInterceptedRequests(urlPattern) {
    if (urlPattern) {
      return this.interceptedRequests.filter((req) =>
        this.matchPattern(req.url, urlPattern)
      );
    }

    return this.interceptedRequests;
  }

  /**
   * Get intercepted responses
   * @param {string|RegExp} [urlPattern] - URL pattern to filter by
   * @returns {Array<Object>} Intercepted responses
   */
  getInterceptedResponses(urlPattern) {
    if (urlPattern) {
      return this.interceptedResponses.filter((res) =>
        this.matchPattern(res.url, urlPattern)
      );
    }

    return this.interceptedResponses;
  }

  /**
   * Clear intercepted requests and responses
   * @returns {NetworkUtils} This instance for chaining
   */
  clearIntercepted() {
    this.interceptedRequests = [];
    this.interceptedResponses = [];
    return this;
  }

  /**
   * Match a URL against a pattern
   * @param {string} url - URL to match
   * @param {string|RegExp} pattern - Pattern to match against
   * @returns {boolean} Whether the URL matches the pattern
   * @private
   */
  matchPattern(url, pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(url);
    }

    if (typeof pattern === 'string') {
      // Handle glob patterns
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
        return new RegExp(`^${regexPattern}$`).test(url);
      }

      // Exact match
      return url.includes(pattern);
    }

    return false;
  }

  /**
   * Validates the payload of a network request
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Function} validator - Validator function
   * @returns {Promise<boolean>} Whether the request is valid
   */
  async validateRequest(urlPattern, validator) {
    if (!urlPattern || typeof validator !== 'function') {
      throw new Error('Valid URL pattern and validator function are required');
    }

    let isValid = false;

    this.addRequestHandler(urlPattern, (route, request) => {
      isValid = validator(request);
      route.continue();
    });

    try {
      await this.waitForRequest(urlPattern, { timeout: 5000 });
    } catch (error) {
      throw new Error(`No request matched ${urlPattern}: ${error.message}`);
    }

    return isValid;
  }

  /**
   * Captures a network response for a given URL pattern
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @returns {Promise<Object>} Response data
   */
  async captureResponse(urlPattern) {
    if (!urlPattern) {
      throw new Error('URL pattern is required');
    }

    return this.waitForResponse(urlPattern, { timeout: 5000 });
  }
  
  /**
   * Modify a request before it's sent
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Function} modifier - Function to modify the request
   * @returns {NetworkUtils} This instance for chaining
   */
  modifyRequest(urlPattern, modifier) {
    this.addRequestHandler(urlPattern, async (route, request) => {
      try {
        const modifiedRequest = await modifier(request);
        await route.continue(modifiedRequest);
      } catch (error) {
        console.error(`Error modifying request for: ${request.url()}`, error);
        await route.continue();
      }
    });
    
    return this;
  }
  
  /**
   * Delay a response
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {number} delayMs - Delay in milliseconds
   * @returns {NetworkUtils} This instance for chaining
   */
  delayResponse(urlPattern, delayMs) {
    this.addRequestHandler(urlPattern, async (route, request) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      await route.continue();
    });
    
    return this;
  }
  
  /**
   * Throttle network speed
   * @param {Object} options - Throttling options
   * @returns {Promise<void>}
   */
  async throttleNetwork(options = {}) {
    const throttlingOptions = {
      offline: options.offline || false,
      downloadThroughput: options.downloadThroughput || 200000, // 200 kbps
      uploadThroughput: options.uploadThroughput || 200000, // 200 kbps
      latency: options.latency || 100 // 100 ms
    };
    
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.emulateNetworkConditions', throttlingOptions);
  }
  
  /**
   * Reset network throttling
   * @returns {Promise<void>}
   */
  async resetNetworkThrottling() {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
  }
}

module.exports = NetworkUtils;