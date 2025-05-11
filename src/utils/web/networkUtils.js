const logger = require('../common/logger');

/**
 * Network Utilities class for handling network requests and responses
 */
class NetworkUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    if (!page) {
      throw new Error('Page object is required');
    }
    this.page = page;
    this.interceptedRequests = [];
    this.interceptedResponses = [];
    this.requestHandlers = new Map();
    this.responseHandlers = new Map();
  }

  /**
   * Start intercepting network requests
   * @returns {Promise<void>}
   */
  async startIntercepting() {
    try {
      logger.debug('Starting network interception');

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

        this.interceptedRequests.push(interceptedRequest);

        // Check if we have a handler for this request
        const handlers = Array.from(this.requestHandlers.entries())
          .filter(([pattern]) => this.matchPattern(url, pattern))
          .map(([, handler]) => handler);

        if (handlers.length > 0) {
          // Execute handlers
          for (const handler of handlers) {
            try {
              await handler(route, request);
            } catch (handlerError) {
              logger.error(
                `Error in request handler for: ${url}`,
                handlerError
              );
            }
          }
        } else {
          // Continue the request
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
            logger.debug(`Could not get response body for: ${url}`, bodyError);
          }

          this.interceptedResponses.push(interceptedResponse);

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
                logger.error(
                  `Error in response handler for: ${url}`,
                  handlerError
                );
              }
            }
          }
        } catch (error) {
          logger.error(`Error intercepting response: ${response.url()}`, error);
        }
      });

      logger.info('Network interception started');
    } catch (error) {
      logger.error('Failed to start network interception', error);
      throw error;
    }
  }

  /**
   * Stop intercepting network requests
   * @returns {Promise<void>}
   */
  async stopIntercepting() {
    try {
      logger.debug('Stopping network interception');

      // Remove all route handlers
      await this.page.unroute('**/*');

      // Clear handlers
      this.requestHandlers.clear();
      this.responseHandlers.clear();

      logger.info('Network interception stopped');
    } catch (error) {
      logger.error('Failed to stop network interception', error);
      throw error;
    }
  }

  /**
   * Add a request handler
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Function} handler - Handler function
   * @returns {NetworkUtils} This instance for chaining
   */
  addRequestHandler(urlPattern, handler) {
    logger.debug(`Adding request handler for: ${urlPattern}`);
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
    logger.debug(`Adding response handler for: ${urlPattern}`);
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
    logger.debug(`Setting up mock response for: ${urlPattern}`);

    this.addRequestHandler(urlPattern, async (route, request) => {
      try {
        // Get response data
        const data =
          typeof responseData === 'function'
            ? await responseData(request)
            : responseData;

        // Set up response options
        const responseOptions = {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          ...options,
        };

        // Fulfill the request with mock data
        await route.fulfill({
          ...responseOptions,
          body: JSON.stringify(data),
        });

        logger.debug(`Mocked response for: ${request.url()}`);
      } catch (error) {
        logger.error(`Error mocking response for: ${request.url()}`, error);
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
    logger.debug(`Setting up request blocking for: ${urlPattern}`);

    this.addRequestHandler(urlPattern, async (route, request) => {
      try {
        // Abort the request
        await route.abort(options.errorCode || 'blockedbyclient');
        logger.debug(`Blocked request: ${request.url()}`);
      } catch (error) {
        logger.error(`Error blocking request: ${request.url()}`, error);
        await route.continue();
      }
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
    try {
      logger.debug(`Waiting for request: ${urlPattern}`);

      const timeout = options.timeout || 30000;
      const predicate = options.predicate || (() => true);

      // Check if we already have a matching request
      const existingRequest = this.interceptedRequests.find(
        (req) => this.matchPattern(req.url, urlPattern) && predicate(req)
      );

      if (existingRequest) {
        logger.debug(`Found existing request: ${existingRequest.url}`);
        return existingRequest;
      }

      // Wait for the request
      const request = await this.page.waitForRequest(
        (req) => this.matchPattern(req.url(), urlPattern) && predicate(req),
        { timeout }
      );

      logger.debug(`Request found: ${request.url()}`);

      return {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        resourceType: request.resourceType(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Error waiting for request: ${urlPattern}`, error);
      throw error;
    }
  }

  /**
   * Wait for a response
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @param {Object} options - Options
   * @returns {Promise<Object>} Response object
   */
  async waitForResponse(urlPattern, options = {}) {
    try {
      logger.debug(`Waiting for response: ${urlPattern}`);

      const timeout = options.timeout || 30000;
      const predicate = options.predicate || (() => true);

      // Check if we already have a matching response
      const existingResponse = this.interceptedResponses.find(
        (res) => this.matchPattern(res.url, urlPattern) && predicate(res)
      );

      if (existingResponse) {
        logger.debug(`Found existing response: ${existingResponse.url}`);
        return existingResponse;
      }

      // Wait for the response
      const response = await this.page.waitForResponse(
        (res) => this.matchPattern(res.url(), urlPattern) && predicate(res),
        { timeout }
      );

      logger.debug(`Response found: ${response.url()}`);

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
        logger.debug(
          `Could not get response body for: ${response.url()}`,
          bodyError
        );
      }

      return result;
    } catch (error) {
      logger.error(`Error waiting for response: ${urlPattern}`, error);
      throw error;
    }
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
   * Validates the payload of a network request.
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
   * Captures a network response for a given URL pattern.
   * @param {string|RegExp} urlPattern - URL pattern to match
   * @returns {Promise<Object>} Response data
   */
  async captureResponse(urlPattern) {
    if (!urlPattern) {
      throw new Error('URL pattern is required');
    }

    return this.waitForResponse(urlPattern, { timeout: 5000 });
  }
}

module.exports = NetworkUtils;