/**
 * Base fixtures for Playwright tests
 *
 * This file defines common fixtures that can be used across tests
 */
const base = require('@playwright/test');
const ApiUtils = require('../../utils/api/apiUtils');
const LoginPage = require('../../pages/orangehrm/LoginPage');
const DashboardPage = require('../../pages/orangehrm/DashboardPage');
const SelfHealingLocator = require('../../utils/web/SelfHealingLocator');
const WebScrapingUtils = require('../../utils/web/webScrapingUtils');
const DOMComparisonUtils = require('../../utils/web/domComparisonUtils');
const path = require('path');

// Load environment variables
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
  override: true,
  debug: false
});

// Extend base test with custom fixtures
const test = base.test.extend({
  // API client fixture
  apiClient: async ({}, use) => {
    const apiClient = new ApiUtils(process.env.API_URL);
    await use(apiClient);
  },

  // Login page fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Dashboard page fixture
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  // Self-healing locator fixture
  selfHealingLocator: async ({ page }, use) => {
    const selfHealingLocator = new SelfHealingLocator(page);
    await use(selfHealingLocator);
  },

  // Web scraping utils fixture
  webScrapingUtils: async ({ page }, use) => {
    const webScrapingUtils = new WebScrapingUtils(page);
    await use(webScrapingUtils);
  },

  // DOM comparison utils fixture
  domComparisonUtils: async ({ page }, use) => {
    const domComparisonUtils = new DOMComparisonUtils(page);
    await use(domComparisonUtils);
  },

  // Authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    // Login with credentials from environment variables
    await loginPage.login(
      process.env.USERNAME || 'Admin',
      process.env.PASSWORD || 'admin123'
    );

    // Use the authenticated page
    await use(page);
  },
});

// Export the extended test and expect
module.exports = {
  test,
  expect: base.expect,
};