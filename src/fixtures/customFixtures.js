// src/fixtures/customFixtures.js

import { test as baseTest } from '@playwright/test';
import RestUtils from '../utils/api/restUtils.js';
import AuthUtils from '../utils/api/auth.js';
import XrayUtils from '../utils/xray/xrayUtils.js';
import reportUtils from '../utils/reporting/reportUtils.js';
import FlakyTestTracker from '../utils/ci/flakyTestTracker.js';
import logger from '../utils/common/logger.js';

/**
 * This file extends Playwright's base test object with custom fixtures
 * including:
 * - apiClient: For RESTful operations
 * - retryDiagnostics: Retry helper with screenshot/logging
 * - flakyTestTracker: Tracks flaky behavior
 * - xrayClient: For test result submission
 * - authenticatedPage: Auto-login flow for UI testing
 */
const customTest = baseTest.extend({
  /**
   * Fixture: apiClient
   * Injects a reusable client for REST API testing.
   * Uses `RestUtils` + `AuthUtils` and is pre-configured with retries and headers.
   */
  apiClient: async ({ request }, use) => {
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) {
      throw new Error('API_BASE_URL must be defined in environment.');
    }

    const auth = new AuthUtils();
    const headers = auth.getApiKeyHeaders();
    const rest = new RestUtils(request, baseUrl, headers);

    const client = {
      get: (endpoint, opts = {}) => rest.requestWithRetry('GET', endpoint, opts),
      post: (endpoint, body, opts = {}) =>
        rest.requestWithRetry('POST', endpoint, { ...opts, data: body }),
      put: (endpoint, body, opts = {}) =>
        rest.requestWithRetry('PUT', endpoint, { ...opts, data: body }),
      delete: (endpoint, opts = {}) => rest.requestWithRetry('DELETE', endpoint, opts)
    };

    await use(client);
  },

  /**
   * Fixture: retryDiagnostics
   * Attaches a screenshot and logs to the test report if the test fails and is retried.
   */
  retryDiagnostics: async ({ page }, use, testInfo) => {
    await use(async (error) => {
      const attempt = (testInfo.retry || 0) + 1;
      const title = testInfo.title.replace(/\s+/g, '_');
      const screenshotPath = `screenshots/${title}_attempt${attempt}.png`;

      logger.error(`Retry #${attempt} failed: ${error.message}`);

      try {
        await page.screenshot({ path: screenshotPath });
        reportUtils.attachScreenshot(screenshotPath, `Attempt ${attempt}`, testInfo);
        await testInfo.attach('retry-failure', {
          body: await page.screenshot(),
          contentType: 'image/png'
        });
      } catch (e) {
        logger.warn('Retry screenshot capture failed: ' + e.message);
      }
    });
  },

  /**
   * Fixture: flakyTestTracker
   * Tracks retries and logs flaky behavior for later quarantine or reporting.
   */
  flakyTestTracker: async ({}, use, testInfo) => {
    const tracker = new FlakyTestTracker();
    await use(tracker);
    tracker.trackTest(testInfo);
  },

  /**
   * Fixture: xrayClient
   * Authenticates and provides an Xray client instance for use inside tests.
   */
  xrayClient: async ({}, use) => {
    const client = new XrayUtils();
    await client.authenticate();
    await use(client);
  },

  /**
   * Fixture: authenticatedPage
   * Logs in a user before tests begin and provides a ready-to-use page object.
   * This enables UI tests to skip login during the test phase.
   */
  authenticatedPage: async ({ page }, use) => {
    const baseURL = process.env.BASE_URL;
    const loginPath = process.env.LOGIN_PATH || '/login';

    const selectors = {
      username: process.env.USERNAME_SELECTOR || '#username',
      password: process.env.PASSWORD_SELECTOR || '#password',
      submit: process.env.SUBMIT_SELECTOR || '#submit',
      dashboard: process.env.DASHBOARD_SELECTOR || '#dashboard'
    };

    const credentials = {
      username: process.env.LOGIN_USERNAME || process.env.USERNAME || 'Admin',
      password: process.env.LOGIN_PASSWORD || process.env.PASSWORD || 'admin123'
    };

    if (!credentials.username || !credentials.password) {
      throw new Error('USERNAME and PASSWORD must be set in .env');
    }

    try {
      await page.goto(`${baseURL}${loginPath}`);
      await page.fill(selectors.username, credentials.username);
      await page.fill(selectors.password, credentials.password);
      await page.click(selectors.submit);
      await page.waitForSelector(selectors.dashboard);
      await use(page);
    } catch (error) {
      logger.error(`Login failed during authenticatedPage fixture: ${error.message}`);
      throw error;
    }
  }
});

// Export the extended test object
export { customTest };
