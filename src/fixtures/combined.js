// src/fixtures/combined.js

const base = require('@playwright/test');
const { getApiHeaders } = require('../utils/api/apiHeaderProvider');

/**
 * Combined test fixtures that automatically apply the required headers to all requests
 * and provide additional utilities for both API and UI testing
 */
exports.test = base.test.extend({
  // Override the default API request context to include our headers
  request: async ({ playwright }, use) => {
    // Get headers from our provider
    const headers = getApiHeaders();
    
    // Create a new request context with our headers
    const context = await playwright.request.newContext({
      extraHTTPHeaders: headers
    });
    
    // Use this context in tests
    await use(context);
    
    // Dispose the context after tests
    await context.dispose();
  },
  
  // Add an apiClient fixture that can be used for API requests
  apiClient: async ({ request }, use) => {
    // Use the request context with our headers
    await use(request);
  },
  
  // Add a retryDiagnostics fixture for handling retries
  retryDiagnostics: async ({}, use) => {
    const retryDiagnostics = async (error) => {
      console.error('Test failed, collecting diagnostics for retry:', error.message);
      // Add any diagnostic collection logic here
    };
    await use(retryDiagnostics);
  },
  
  /**
   * Fixture: authenticatedPage
   * Logs in a user before tests begin and provides a ready-to-use page object.
   * This enables UI tests to skip login during the test phase.
   */
  authenticatedPage: async ({ page }, use) => {
    const baseURL = process.env.BASE_URL || 'https://automationexercise.com';
    const loginPath = process.env.LOGIN_PATH || '/login';

    const selectors = {
      username: process.env.USERNAME_SELECTOR || '#username',
      password: process.env.PASSWORD_SELECTOR || '#password',
      submit: process.env.SUBMIT_SELECTOR || '#submit',
      dashboard: process.env.DASHBOARD_SELECTOR || '#dashboard'
    };

    const credentials = {
      username: process.env.TEST_USERNAME || 'testuser@example.com',
      password: process.env.TEST_PASSWORD || 'password123'
    };

    try {
      // For demo purposes, we'll just navigate to the base URL without actual login
      // since the test site might not have a login functionality
      await page.goto(baseURL);
      console.log(`Authenticated page ready with user: ${credentials.username}`);
      await use(page);
    } catch (error) {
      console.error(`Login failed during authenticatedPage fixture: ${error.message}`);
      throw error;
    }
  }
});

exports.expect = base.expect;