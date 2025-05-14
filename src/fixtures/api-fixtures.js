// src/fixtures/api-fixtures.js

const base = require('@playwright/test');
const { getApiHeaders } = require('../utils/api/apiHeaderProvider');

/**
 * API test fixtures that automatically apply the required headers to all requests
 */
exports.test = base.test.extend({
  // Override the default API request context to include our headers
  request: async ({ playwright }, use) => {
    // Get headers from our provider
    const headers = getApiHeaders() || { 'Content-Type': 'application/json' };
    
    // Create a new request context with our headers
    const context = await playwright.request.newContext({
      extraHTTPHeaders: headers
    });
    
    // Use this context in tests
    await use(context);
    
    // Dispose the context after tests
    await context.dispose();
  }
});

exports.expect = base.expect;