// src/tests/fixtures/customFixtures.js

const baseTest = require("@playwright/test").test;
const RestUtils = require("../utils/api/restUtils");
const GraphQLUtils = require("../utils/api/graphqlUtils");
const AuthUtils = require("../utils/api/auth");
const XrayUtils = require("../utils/xray/xrayUtils");
const ReportUtils = require("../utils/reporting/reportUtils");
const FlakyTestTracker = require("../utils/ci/flakyTestTracker");
const RetryWithBackoff = require("../utils/common/retryWithBackoff");

/**
 * Custom Playwright fixtures for the automation framework.
 * This extends the base test object with reusable utilities like:
 * - Authenticated page navigation
 * - API and GraphQL client setup
 * - Xray integration
 * - Flaky test tracking
 * - Retry and diagnostics utilities
 */
const customTest = baseTest.extend({
  /**
   * Fixture to log in as a test user and provide an authenticated page object.
   * Automatically fills credentials and waits for dashboard presence.
   *
   * Usage:
   * ```javascript
   * test('authenticated test', async ({ authenticatedPage }) => {
   *   await authenticatedPage.goto('/profile');
   * });
   * ```
   */
  authenticatedPage: async ({ page }, use) => {
    const baseURL = process.env.BASE_URL;
    if (!baseURL) throw new Error("BASE_URL environment variable is required");

    const loginPath = process.env.LOGIN_PATH || "/login";
    const usernameSelector = process.env.USERNAME_SELECTOR || "#username";
    const passwordSelector = process.env.PASSWORD_SELECTOR || "#password";
    const submitSelector = process.env.SUBMIT_SELECTOR || "#submit";
    const username = process.env.TEST_USERNAME || "testuser";
    const password = process.env.TEST_PASSWORD || "password123";

    try {
      await page.goto(`${baseURL}${loginPath}`);
      await page.fill(usernameSelector, username);
      await page.fill(passwordSelector, password);
      await page.click(submitSelector);
      await page.waitForSelector(".dashboard", { timeout: 5000 });
      await use(page);
    } catch (error) {
      throw new Error(`Failed to authenticate: ${error.message}`);
    }
  },

  /**
   * Fixture providing an API client abstraction with REST and GraphQL support.
   * Uses custom utilities for retries, batching, and authentication headers.
   *
   * Usage:
   * ```javascript
   * test('api test', async ({ apiClient }) => {
   *   const data = await apiClient.get('/users');
   *   console.log(data);
   * });
   * ```
   */
  apiClient: async ({ request }, use) => {
    const baseURL = process.env.BASE_URL;
    if (!baseURL) throw new Error("BASE_URL environment variable is required");

    const auth = new AuthUtils();
    const rest = new RestUtils(request);
    const graphql = new GraphQLUtils(`${baseURL}/graphql`, {
      headers: auth.getApiKeyHeaders(),
    });

    const apiClient = {
      get: async (endpoint, options) =>
        rest.requestWithRetry("GET", endpoint, options),
      post: async (endpoint, options) =>
        rest.requestWithRetry("POST", endpoint, options),
      put: async (endpoint, options) =>
        rest.requestWithRetry("PUT", endpoint, options),
      delete: async (endpoint, options) =>
        rest.requestWithRetry("DELETE", endpoint, options),
      batch: async (requests) => rest.batchRequests(requests),
      graphqlQuery: async (query, variables) =>
        graphql.request(query, variables),
      graphqlSubscribe: async (subscription, callback, variables) =>
        graphql.subscribe(subscription, callback, variables),
      graphqlIntrospect: async () => graphql.introspectSchema(),
    };

    await use(apiClient);
  },

  /**
   * Fixture providing an authenticated Xray client for Jira Test Management.
   * Handles automatic authentication using client credentials or API keys.
   */
  xrayClient: async ({}, use) => {
    const xray = new XrayUtils();
    await xray.authenticate();
    await use(xray);
  },

  /**
   * Fixture capturing retry diagnostics such as error logs and screenshots.
   * Automatically attaches information if a test fails and retries.
   */
  retryDiagnostics: async ({}, use, testInfo) => {
    const report = new ReportUtils();
    let attempt = 0;
    await use(async (error) => {
      attempt++;
      if (error) {
        report.attachLog(
          `Retry attempt ${attempt} failed: ${error.message}`,
          `Retry ${attempt}`
        );
        await testInfo.attach("screenshot", {
          body: await testInfo.page.screenshot(),
          contentType: "image/png",
        });
      }
    });
  },

  /**
   * Fixture tracking flaky tests by detecting special markers (e.g., '@flaky').
   * Integrates with CI systems to report flaky test rates.
   */
  flakyTestTracker: async ({}, use, testInfo) => {
    const tracker = new FlakyTestTracker();
    await use(tracker);

    const isFlaky = testInfo.title.includes("@flaky");
    tracker.trackTest(testInfo, isFlaky);
  },

  /**
   * Fixture providing a retry utility with exponential backoff strategies.
   * Useful for retrying flaky actions like API requests or UI interactions.
   */
  retryWithBackoff: async ({}, use) => {
    const retry = new RetryWithBackoff();
    await use(retry);
  },
});

module.exports = { test: customTest };
