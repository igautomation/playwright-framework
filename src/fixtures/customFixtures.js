// src/fixtures/customFixtures.js
import { test as baseTest } from "@playwright/test";
import RestUtils from "../utils/api/restUtils.js";
import GraphQLUtils from "../utils/api/graphqlUtils.js";
import AuthUtils from "../utils/api/auth.js";
import XrayUtils from "../utils/xray/xrayUtils.js";
import reportUtils from "../utils/reporting/reportUtils.js";
import FlakyTestTracker from "../utils/ci/flakyTestTracker.js";
import RetryWithBackoff from "../utils/common/retryWithBackoff.js";
import logger from "../utils/common/logger.js";

/**
 * Custom Playwright fixtures for the automation framework.
 */
const customTest = baseTest.extend({
  authenticatedPage: async ({ page }, use, testInfo) => {
    // Validate required environment variables
    const requiredVars = [
      "BASE_URL",
      "LOGIN_PATH",
      "USERNAME_SELECTOR",
      "PASSWORD_SELECTOR",
      "SUBMIT_SELECTOR",
      "DASHBOARD_SELECTOR",
      "TEST_USERNAME",
      "TEST_PASSWORD",
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      const errorMsg = `Missing required environment variables for authenticatedPage: ${missingVars.join(
        ", "
      )}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const baseURL = process.env.BASE_URL;
    const loginPath = process.env.LOGIN_PATH;
    const usernameSelector = process.env.USERNAME_SELECTOR;
    const passwordSelector = process.env.PASSWORD_SELECTOR;
    const submitSelector = process.env.SUBMIT_SELECTOR;
    const dashboardSelector = process.env.DASHBOARD_SELECTOR;
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    try {
      logger.info(
        `Navigating to ${baseURL}${loginPath} for test: ${testInfo.title}`
      );
      await page.goto(`${baseURL}${loginPath}`, { timeout: 10000 });

      logger.debug(`Filling username: ${usernameSelector} with ${username}`);
      await page.fill(usernameSelector, username);

      logger.debug(`Filling password: ${passwordSelector}`);
      await page.fill(passwordSelector, password);

      logger.debug(`Clicking submit: ${submitSelector}`);
      await page.click(submitSelector);

      logger.debug(`Waiting for dashboard: ${dashboardSelector}`);
      await page.waitForSelector(dashboardSelector, { timeout: 5000 });

      await use(page);
    } catch (error) {
      const errorMsg = `Failed to authenticate for test ${testInfo.title}: ${error.message}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  apiClient: async ({ request }, use) => {
    // Validate required environment variables
    const requiredVars = ["API_BASE_URL", "API_GRAPHQL_PATH"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      const errorMsg = `Missing required environment variables for apiClient: ${missingVars.join(
        ", "
      )}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const baseURL = process.env.API_BASE_URL;
    const graphqlPath = process.env.API_GRAPHQL_PATH;

    try {
      logger.info(`Initializing apiClient with baseURL: ${baseURL}`);
      const auth = new AuthUtils();
      const rest = new RestUtils(request);
      const graphql = new GraphQLUtils(`${baseURL}${graphqlPath}`, {
        headers: auth.getApiKeyHeaders(),
      });

      const apiClient = {
        get: async (endpoint, options = {}) => {
          logger.debug(`GET request to ${baseURL}${endpoint}`);
          return rest.requestWithRetry("GET", endpoint, options);
        },
        post: async (endpoint, options = {}) => {
          logger.debug(`POST request to ${baseURL}${endpoint}`);
          return rest.requestWithRetry("POST", endpoint, options);
        },
        put: async (endpoint, options = {}) => {
          logger.debug(`PUT request to ${baseURL}${endpoint}`);
          return rest.requestWithRetry("PUT", endpoint, options);
        },
        delete: async (endpoint, options = {}) => {
          logger.debug(`DELETE request to ${baseURL}${endpoint}`);
          return rest.requestWithRetry("DELETE", endpoint, options);
        },
        batch: async (requests) => {
          logger.debug(`Batch request with ${requests.length} operations`);
          return rest.batchRequests(requests);
        },
        graphqlQuery: async (query, variables) => {
          logger.debug(`GraphQL query to ${baseURL}${graphqlPath}`);
          return graphql.request(query, variables);
        },
        graphqlSubscribe: async (subscription, callback, variables) => {
          logger.debug(`GraphQL subscription to ${baseURL}${graphqlPath}`);
          return graphql.subscribe(subscription, callback, variables);
        },
        graphqlIntrospect: async () => {
          logger.debug(`GraphQL introspection at ${baseURL}${graphqlPath}`);
          return graphql.introspectSchema();
        },
      };

      await use(apiClient);
    } catch (error) {
      const errorMsg = `Failed to initialize apiClient: ${error.message}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  apiUser: async ({ request }, use) => {
    try {
      logger.info("Creating new API context for apiUser");
      const context = await request.newContext();
      await use(context);
      await context.dispose();
      logger.info("API context disposed");
    } catch (error) {
      logger.error(`Failed to manage apiUser context: ${error.message}`);
      throw new Error(`Failed to manage apiUser context: ${error.message}`);
    }
  },

  xrayClient: async ({}, use) => {
    try {
      logger.info("Initializing xrayClient");
      const xray = new XrayUtils();
      await xray.authenticate();
      await use(xray);
      logger.info("xrayClient authentication completed");
    } catch (error) {
      logger.error(`Failed to initialize xrayClient: ${error.message}`);
      throw new Error(`Failed to initialize xrayClient: ${error.message}`);
    }
  },

  retryDiagnostics: async ({ page }, use, testInfo) => {
    let attempt = 0;
    await use(async (error) => {
      attempt++;
      if (error) {
        const logMsg = `Retry attempt ${attempt} failed for test ${testInfo.title}: ${error.message}`;
        logger.error(logMsg);
        reportUtils.attachLog(logMsg, `Retry ${attempt}`, testInfo);
        const screenshotPath = `screenshots/test-${testInfo.title.replace(
          /\s+/g,
          "-"
        )}-${attempt}.png`;
        try {
          await page.screenshot({ path: screenshotPath });
          reportUtils.attachScreenshot(
            screenshotPath,
            `Failed attempt ${attempt}`,
            testInfo
          );
          await testInfo.attach("screenshot", {
            body: await page.screenshot(),
            contentType: "image/png",
          });
        } catch (screenshotError) {
          logger.error(
            `Failed to capture screenshot: ${screenshotError.message}`
          );
        }
      }
    });
  },

  flakyTestTracker: async ({}, use, testInfo) => {
    try {
      logger.info(`Tracking flaky test: ${testInfo.title}`);
      const tracker = new FlakyTestTracker();
      await use(tracker);
      const isFlaky = testInfo.title.includes("@flaky");
      tracker.trackTest(testInfo, isFlaky);
      logger.info(`Flaky test tracking completed for ${testInfo.title}`);
    } catch (error) {
      logger.error(`Failed to track flaky test: ${error.message}`);
      throw new Error(`Failed to track flaky test: ${error.message}`);
    }
  },

  retryWithBackoff: async ({}, use) => {
    try {
      logger.info("Initializing retryWithBackoff");
      const retry = new RetryWithBackoff();
      await use(retry);
      logger.info("retryWithBackoff completed");
    } catch (error) {
      logger.error(`Failed to initialize retryWithBackoff: ${error.message}`);
      throw new Error(
        `Failed to initialize retryWithBackoff: ${error.message}`
      );
    }
  },
});

// Correct ESM Export
export { customTest };
