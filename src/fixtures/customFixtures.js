// src/fixtures/customFixtures.js
require('module-alias/register');

const { test: baseTest } = require('@playwright/test');
const RestUtils = require('@utils/api/restUtils');
const GraphQLUtils = require('@utils/api/graphqlUtils');
const AuthUtils = require('@utils/api/auth');
const XrayUtils = require('@utils/xray/xrayUtils');
const ReportUtils = require('@utils/reporting/reportUtils');
const FlakyTestTracker = require('@utils/ci/flakyTestTracker');
const RetryWithBackoff = require('@utils/common/retryWithBackoff');

/**
 * Custom Playwright fixtures for the automation framework.
 */
const customTest = baseTest.extend({

  authenticatedPage: async ({ page }, use) => {
    const baseURL = process.env.BASE_URL;
    if (!baseURL) throw new Error('BASE_URL environment variable is required');

    const loginPath = process.env.LOGIN_PATH || '/login';
    const usernameSelector = process.env.USERNAME_SELECTOR || '#username';
    const passwordSelector = process.env.PASSWORD_SELECTOR || '#password';
    const submitSelector = process.env.SUBMIT_SELECTOR || '#submit';
    const username = process.env.TEST_USERNAME || 'testuser';
    const password = process.env.TEST_PASSWORD || 'password123';

    try {
      await page.goto(`${baseURL}${loginPath}`);
      await page.fill(usernameSelector, username);
      await page.fill(passwordSelector, password);
      await page.click(submitSelector);
      await page.waitForSelector('.dashboard', { timeout: 5000 });
      await use(page);
    } catch (error) {
      throw new Error(`Failed to authenticate: ${error.message}`);
    }
  },

  apiClient: async ({ request }, use) => {
    const baseURL = process.env.BASE_URL;
    if (!baseURL) throw new Error('BASE_URL environment variable is required');

    const auth = new AuthUtils();
    const rest = new RestUtils(request);
    const graphql = new GraphQLUtils(`${baseURL}/graphql`, {
      headers: auth.getApiKeyHeaders(),
    });

    const apiClient = {
      get: async (endpoint, options) => rest.requestWithRetry('GET', endpoint, options),
      post: async (endpoint, options) => rest.requestWithRetry('POST', endpoint, options),
      put: async (endpoint, options) => rest.requestWithRetry('PUT', endpoint, options),
      delete: async (endpoint, options) => rest.requestWithRetry('DELETE', endpoint, options),
      batch: async (requests) => rest.batchRequests(requests),
      graphqlQuery: async (query, variables) => graphql.request(query, variables),
      graphqlSubscribe: async (subscription, callback, variables) => graphql.subscribe(subscription, callback, variables),
      graphqlIntrospect: async () => graphql.introspectSchema(),
    };

    await use(apiClient);
  },

  apiUser: async ({ request }, use) => {
    const context = await request.newContext();
    await use(context);
    await context.dispose();
  },

  xrayClient: async ({}, use) => {
    const xray = new XrayUtils();
    await xray.authenticate();
    await use(xray);
  },

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
        await testInfo.attach('screenshot', {
          body: await testInfo.page.screenshot(),
          contentType: 'image/png',
        });
      }
    });
  },

  flakyTestTracker: async ({}, use, testInfo) => {
    const tracker = new FlakyTestTracker();
    await use(tracker);

    const isFlaky = testInfo.title.includes('@flaky');
    tracker.trackTest(testInfo, isFlaky);
  },

  retryWithBackoff: async ({}, use) => {
    const retry = new RetryWithBackoff();
    await use(retry);
  },

});

module.exports = { test: customTest };