// @ts-check
const { test: base } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Optimized test fixtures for improved performance
 * Provides reusable components and shared state between tests
 */

// Extend the base test with custom fixtures
exports.test = base.extend({
  // Authenticated page fixture - reuse authentication state
  authenticatedPage: async ({ browser }, use) => {
    // Create a single browser context that will be shared
    const context = await browser.newContext({
      storageState: path.join(__dirname, '../auth.json')
    });
    
    // Create a new page in this context
    const page = await context.newPage();
    
    // Use the page in the test
    await use(page);
    
    // Clean up after test
    await context.close();
  },
  
  // API client fixture - reuse API client between tests
  apiClient: async ({}, use) => {
    // Create API client once and reuse
    const apiClient = {
      baseUrl: process.env.API_URL || 'https://api.example.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN || 'default-token'}`
      },
      async get(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: this.headers
        });
        return response.json();
      },
      async post(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(data)
        });
        return response.json();
      }
    };
    
    await use(apiClient);
  },
  
  // Test data fixture - load test data once for all tests
  testData: async ({}, use) => {
    // Load test data from file once
    const dataPath = path.join(__dirname, '../../data/json/test-fixtures.json');
    let testData = {};
    
    if (fs.existsSync(dataPath)) {
      testData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    await use(testData);
  }
});

// Export other test helpers
exports.expect = base.expect;