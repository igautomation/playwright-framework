// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Core Test: API Integration
 * Demonstrates API testing capabilities
 */
test('basic API request and response validation', async ({ request }) => {
  // Make API request
  const response = await request.get('https://reqres.in/api/users?page=2');
  
  // Verify response status
  expect(response.status()).toBe(200);
  
  // Parse response body
  const body = await response.json();
  
  // Validate response structure
  expect(body).toHaveProperty('data');
  expect(Array.isArray(body.data)).toBeTruthy();
  expect(body.data.length).toBeGreaterThan(0);
  
  // Validate a specific user
  const firstUser = body.data[0];
  expect(firstUser).toHaveProperty('id');
  expect(firstUser).toHaveProperty('email');
  expect(firstUser).toHaveProperty('first_name');
  expect(firstUser).toHaveProperty('last_name');
});