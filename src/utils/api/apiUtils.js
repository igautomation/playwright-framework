// src/utils/api/apiUtils.js
import Ajv from "ajv";
import { faker } from "@faker-js/faker";
import logger from "../common/logger.js";

const ajv = new Ajv({ allErrors: true, verbose: true });

/**
 * Utility class for API testing, providing reusable methods for sending requests,
 * validating schemas, generating payloads, and handling responses.
 */
export class ApiUtils {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * Sends an API request with the specified method, endpoint, and options.
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
   * @param {string} endpoint - API endpoint (e.g., '/api/users').
   * @param {object} [options] - Request options (payload, headers, queryParams, delay).
   * @returns {Promise<{ status: number, body: object, headers: object }>} Response details.
   */
  async sendRequest(method, endpoint, options = {}) {
    const { payload, headers = {}, queryParams = {}, delay } = options;
    try {
      const requestUrl = delay ? `${endpoint}?delay=${delay}` : endpoint;
      const requestPayload = payload ? JSON.stringify(payload) : null; // Serialize
      const requestHeaders = { ...this.defaultHeaders, ...headers };

      logger.info(
        `Sending ${method} request to ${requestUrl} with payload: ${
          requestPayload || "none"
        }`
      );
      logger.debug(`Request headers: ${JSON.stringify(requestHeaders)}`);
      logger.debug(`Query params: ${JSON.stringify(queryParams)}`);

      const response = await this.apiClient[method.toLowerCase()](requestUrl, {
        headers: requestHeaders,
        params: queryParams,
        data: requestPayload,
      });

      const responseBody = await response.json().catch(() => ({})); // Deserialize
      const responseHeaders = response.headers();
      logger.info(`Received response: ${JSON.stringify(responseBody)}`);
      logger.debug(`Response headers: ${JSON.stringify(responseHeaders)}`);

      return {
        status: response.status(),
        body: responseBody,
        headers: responseHeaders,
      };
    } catch (error) {
      logger.error(`Request failed: ${method} ${endpoint} - ${error.message}`);
      throw new Error(
        `API request failed: ${method} ${endpoint} - ${error.message}`
      );
    }
  }

  /**
   * Validates a response body against a JSON schema.
   * @param {object} data - Response body to validate.
   * @param {object} schema - JSON schema.
   * @param {string} endpoint - Endpoint for error context.
   * @throws {Error} If validation fails.
   */
  validateSchema(data, schema, endpoint) {
    const validate = ajv.compile(schema);
    if (!validate(data)) {
      const errors = validate.errors.map(
        (err) => `${err.instancePath || "root"} ${err.message}`
      );
      logger.error(
        `Schema validation failed for ${endpoint}: ${errors.join(", ")}`
      );
      throw new Error(
        `Schema validation failed for ${endpoint}: ${errors.join(", ")}`
      );
    }
    logger.info(`Schema validation passed for ${endpoint}`);
  }

  /**
   * Generates a dynamic user payload for testing.
   * @param {object} [overrides] - Optional overrides for specific fields.
   * @returns {object} User payload with name, job, email.
   */
  generateDynamicUser(overrides = {}) {
    const payload = {
      name: faker.name.fullName(),
      job: faker.name.jobTitle(),
      email: faker.internet.email(),
    };
    const dynamicPayload = { ...payload, ...overrides };
    logger.info(`Generated dynamic payload: ${JSON.stringify(dynamicPayload)}`);
    return dynamicPayload;
  }

  /**
   * Validates response status and headers.
   * @param {object} response - Response object from sendRequest.
   * @param {number} expectedStatus - Expected HTTP status code.
   * @param {object} [expectedHeaders] - Expected headers (key-value pairs).
   * @param {string} endpoint - Endpoint for error context.
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
    for (const [key, value] of Object.entries(expectedHeaders)) {
      if (headers[key.toLowerCase()] !== value) {
        logger.error(
          `Header validation failed for ${endpoint}: Expected ${key}=${value}, got ${
            headers[key.toLowerCase()]
          }`
        );
        throw new Error(
          `Header validation failed for ${endpoint}: Expected ${key}=${value}, got ${
            headers[key.toLowerCase()]
          }`
        );
      }
    }
    logger.info(`Response validation passed for ${endpoint}: Status ${status}`);
  }

  /**
   * Checks if an operation is idempotent (e.g., DELETE).
   * @param {string} method - HTTP method.
   * @param {string} endpoint - API endpoint.
   * @param {number} expectedStatus - Expected status code for idempotent calls.
   * @param {number} [attempts=2] - Number of attempts to verify idempotency.
   * @returns {Promise<void>}
   */
  async verifyIdempotency(method, endpoint, expectedStatus, attempts = 2) {
    try {
      for (let i = 1; i <= attempts; i++) {
        const { status } = await this.sendRequest(method, endpoint);
        if (status !== expectedStatus) {
          throw new Error(
            `Idempotency check failed on attempt ${i} for ${method} ${endpoint}: Expected ${expectedStatus}, got ${status}`
          );
        }
        logger.info(
          `Idempotency check passed on attempt ${i} for ${method} ${endpoint}: Status ${status}`
        );
      }
    } catch (error) {
      logger.error(`Idempotency verification failed: ${error.message}`);
      throw error;
    }
  }
}

export default ApiUtils;
