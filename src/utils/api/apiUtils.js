// src/utils/api/apiUtils.js

import Ajv from "ajv";
import { faker } from "@faker-js/faker";
import logger from "../common/logger.js";

// Initialize AJV JSON Schema Validator
const ajv = new Ajv({ allErrors: true, verbose: true });

/**
 * API utility class providing reusable request methods,
 * schema validation, dynamic payload generation, and response checks.
 */
class ApiUtils {
  constructor(apiClient) {
    if (!apiClient) {
      throw new Error("apiClient must be provided to ApiUtils.");
    }

    this.apiClient = apiClient;

    // Default headers for API requests (can be overridden per call)
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
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

    logger.info(
      `Sending ${method} request to ${finalUrl} with payload: ${body || "none"}`
    );
    logger.debug(`Headers: ${JSON.stringify(allHeaders)}`);
    logger.debug(`Query Params: ${JSON.stringify(queryParams)}`);

    try {
      const response = await this.apiClient[method.toLowerCase()](finalUrl, {
        headers: allHeaders,
        params: queryParams,
        data: body,
      });

      const responseBody = await response.json().catch(() => ({}));
      const responseHeaders = response.headers();

      logger.info(
        `Received response for ${finalUrl}: ${JSON.stringify(responseBody)}`
      );
      logger.debug(`Response headers: ${JSON.stringify(responseHeaders)}`);

      return {
        status: response.status(),
        body: responseBody,
        headers: responseHeaders,
      };
    } catch (error) {
      logger.error(`Request failed: ${method} ${finalUrl} - ${error.message}`);
      throw new Error(
        `API request failed: ${method} ${finalUrl} - ${error.message}`
      );
    }
  }

  /**
   * Validates a JSON response body against a schema.
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
      email: faker.internet.email(),
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
    }
  }
}

export default ApiUtils;
