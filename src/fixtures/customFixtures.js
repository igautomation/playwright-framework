// src/tests/fixtures/customFixtures.js
// @ts-check
import { test as baseTest } from '@playwright/test';

/**
 * @typedef {Object} CustomFixtures
 * @property {import('@playwright/test').Page} authenticatedPage - A page pre-authenticated with the application
 * @property {{ get: (endpoint: string) => Promise<import('@playwright/test').APIResponse>, post: (endpoint: string, data: any) => Promise<import('@playwright/test').APIResponse>, put: (endpoint: string, data: any) => Promise<import('@playwright/test').APIResponse>, delete: (endpoint: string) => Promise<import('@playwright/test').APIResponse>, graphql: (query: string, variables?: any) => Promise<any> }} apiClient - An API client for making requests
 */

/**
 * @type {import('@playwright/test').PlaywrightTestConfig & { test: import('@playwright/test').TestType<CustomFixtures, {}> }}
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
      // Verify login success (e.g., check for a dashboard element)
      await page.waitForSelector('.dashboard', { timeout: 5000 });
      await use(page);
    } catch (error) {
      throw new Error(`Failed to authenticate: ${error.message}`);
    }
  },

  apiClient: async ({ request }, use) => {
    const baseURL = process.env.BASE_URL;
    if (!baseURL) throw new Error('BASE_URL environment variable is required');

    const authType = process.env.AUTH_TYPE || 'api-key'; // 'api-key' or 'oauth2'
    let authHeader = {};
    if (authType === 'api-key') {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error('API_KEY environment variable is required for api-key auth');
      authHeader = { Authorization: `Bearer ${apiKey}` };
    } else if (authType === 'oauth2') {
      const token = process.env.OAUTH2_TOKEN;
      if (!token) throw new Error('OAUTH2_TOKEN environment variable is required for oauth2 auth');
      authHeader = { Authorization: `Bearer ${token}` };
    }

    const apiClient = {
      async get(endpoint) {
        const response = await request.get(`${baseURL}${endpoint}`, {
          headers: authHeader,
        });
        if (!response.ok()) throw new Error(`GET ${endpoint} failed: ${response.statusText()}`);
        return response;
      },
      async post(endpoint, data) {
        const response = await request.post(`${baseURL}${endpoint}`, {
          headers: authHeader,
          data,
        });
        if (!response.ok()) throw new Error(`POST ${endpoint} failed: ${response.statusText()}`);
        return response;
      },
      async put(endpoint, data) {
        const response = await request.put(`${baseURL}${endpoint}`, {
          headers: authHeader,
          data,
        });
        if (!response.ok()) throw new Error(`PUT ${endpoint} failed: ${response.statusText()}`);
        return response;
      },
      async delete(endpoint) {
        const response = await request.delete(`${baseURL}${endpoint}`, {
          headers: authHeader,
        });
        if (!response.ok()) throw new Error(`DELETE ${endpoint} failed: ${response.statusText()}`);
        return response;
      },
      async graphql(query, variables = {}) {
        const response = await request.post(`${baseURL}/graphql`, {
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
          data: JSON.stringify({ query, variables }),
        });
        if (!response.ok()) throw new Error(`GraphQL request failed: ${response.statusText()}`);
        return response.json();
      },
    };

    await use(apiClient);
  },
});

export default customTest;