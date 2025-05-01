// src/fixtures/customFixtures.js

import { test as baseTest } from '@playwright/test';
import RestUtils from '../utils/api/restUtils.js';
import AuthUtils from '../utils/api/auth.js';
import XrayUtils from '../utils/xray/xrayUtils.js';
import reportUtils from '../utils/reporting/reportUtils.js';
import FlakyTestTracker from '../utils/ci/flakyTestTracker.js';
import logger from '../utils/common/logger.js';

// Extend Playwright's base test with custom fixtures
const customTest = baseTest.extend({
  // Provide apiClient using injected request and .env configs
  apiClient: async ({ request }, use) => {
    // Ensure API_BASE_URL is defined
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) {
      throw new Error('API_BASE_URL must be set in the environment config.');
    }

    // Setup authorization headers using auth utility
    const auth = new AuthUtils();
    const headers = auth.getApiKeyHeaders(); // e.g., { Authorization: Bearer token }

    const rest = new RestUtils(request, baseUrl, headers);

    const client = {
      get: async (endpoint, opts = {}) => rest.requestWithRetry('GET', endpoint, opts),
      post: async (endpoint, body, opts = {}) =>
        rest.requestWithRetry('POST', endpoint, { ...opts, data: body }),
      put: async (endpoint, body, opts = {}) =>
        rest.requestWithRetry('PUT', endpoint, { ...opts, data: body }),
      delete: async (endpoint, opts = {}) => rest.requestWithRetry('DELETE', endpoint, opts)
    };

    await use(client);
  },

  // Retry diagnostics helper with screenshot + log on failure
  retryDiagnostics: async ({ page }, use, testInfo) => {
    await use(async (error) => {
      const attempt = (testInfo.retry || 0) + 1;
      const title = testInfo.title.replace(/\s+/g, '_');
      const screenshotPath = `screenshots/${title}_attempt${attempt}.png`;

      const message = `Retry #${attempt} failed: ${error.message}`;
      logger.error(message);

      try {
        await page.screenshot({ path: screenshotPath });
        reportUtils.attachScreenshot(screenshotPath, `Attempt ${attempt}`, testInfo);
        await testInfo.attach('screenshot', {
          body: await page.screenshot(),
          contentType: 'image/png'
        });
      } catch (e) {
        logger.warn('Failed to capture retry screenshot: ' + e.message);
      }
    });
  },

  // Flaky test tracker to analyze stability
  flakyTestTracker: async ({}, use, testInfo) => {
    const tracker = new FlakyTestTracker();
    await use(tracker);
    tracker.trackTest(testInfo);
  },

  // Optional: Xray client if needed for hybrid test result reporting
  xrayClient: async ({}, use) => {
    const client = new XrayUtils();
    await client.authenticate();
    await use(client);
  },

  // Optional: If hybrid flow needs login, inject authenticated page
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
      username: process.env.LOGIN_USERNAME,
      password: process.env.LOGIN_PASSWORD
    };

    if (!credentials.username || !credentials.password) {
      throw new Error('LOGIN_USERNAME and LOGIN_PASSWORD must be set in .env');
    }

    try {
      await page.goto(`${baseURL}${loginPath}`);
      await page.fill(selectors.username, credentials.username);
      await page.fill(selectors.password, credentials.password);
      await page.click(selectors.submit);
      await page.waitForSelector(selectors.dashboard);
      await use(page);
    } catch (error) {
      logger.error(`Authentication failed: ${error.message}`);
      throw error;
    }
  }
});

// Export the extended test object
export { customTest };
