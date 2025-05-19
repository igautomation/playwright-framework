// @ts-check
const { test: base, expect } = require('@playwright/test');
const { ApiClient } = require('../utils/api/apiUtils');

/**
 * Base fixtures for all tests
 */
exports.test = base.extend({
  /**
   * Page with automatic navigation to base URL
   */
  basePage: async ({ page }, use) => {
    await page.goto('/');
    await use(page);
  },
  
  /**
   * API client fixture
   */
  apiClient: async ({ request }, use) => {
    const apiClient = new ApiClient(
      process.env.API_URL || 'https://reqres.in/api',
      { 'Content-Type': 'application/json' }
    );
    
    await use(apiClient);
  },
  
  /**
   * Test data fixture
   */
  testData: async ({}, use) => {
    // You can load test data from files or generate it dynamically
    const testData = {
      users: [
        { id: 1, name: 'Test User 1', email: 'user1@example.com' },
        { id: 2, name: 'Test User 2', email: 'user2@example.com' }
      ],
      products: [
        { id: 101, name: 'Product 1', price: 19.99 },
        { id: 102, name: 'Product 2', price: 29.99 }
      ]
    };
    
    await use(testData);
  }
});

exports.expect = expect;