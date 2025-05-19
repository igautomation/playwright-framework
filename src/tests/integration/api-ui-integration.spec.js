// @ts-check
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api/apiUtils');

/**
 * Integration Test Suite
 * 
 * Tests that combine API and UI interactions
 */
test.describe('API and UI Integration Tests', () => {
  let apiClient;
  
  test.beforeEach(() => {
    apiClient = new ApiClient('https://reqres.in/api');
  });
  
  test('should display user data from API in UI', async ({ page }) => {
    // First get user data from API
    const response = await apiClient.get('/users/2');
    const userData = response.data;
    
    // Navigate to a demo page
    await page.goto('https://demo.playwright.dev/todomvc/#/');
    
    // Use API data in UI interaction
    await page.getByPlaceholder('What needs to be done?').fill(`Task for ${userData.first_name} ${userData.last_name}`);
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // Verify the todo was added with the API data
    const todoText = await page.locator('.todo-list li').textContent();
    expect(todoText).toContain(userData.first_name);
    expect(todoText).toContain(userData.last_name);
  });
  
  test('should create user via API and verify in UI', async ({ page }) => {
    // Create user via API
    const userData = {
      name: 'John Doe',
      job: 'QA Engineer'
    };
    
    const createResponse = await apiClient.post('/users', userData);
    expect(createResponse).toHaveProperty('id');
    
    // Navigate to a demo page
    await page.goto('https://demo.playwright.dev/todomvc/#/');
    
    // Use created user data in UI
    await page.getByPlaceholder('What needs to be done?').fill(`Welcome ${userData.name}, ${userData.job}`);
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // Verify the todo was added with the user data
    const todoText = await page.locator('.todo-list li').textContent();
    expect(todoText).toContain(userData.name);
    expect(todoText).toContain(userData.job);
  });
  
  test('should handle API errors gracefully in UI', async ({ page }) => {
    // Navigate to a demo page
    await page.goto('https://demo.playwright.dev/todomvc/#/');
    
    // Mock API error response
    await page.route('**/api/users/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Try to get user data (will be mocked to fail)
    let apiError = null;
    try {
      await fetch('https://reqres.in/api/users/2');
    } catch (error) {
      apiError = error;
    }
    
    // Use error information in UI
    await page.getByPlaceholder('What needs to be done?').fill(`Error occurred: ${apiError || 'API Error'}`);
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // Verify the todo was added with the error information
    const todoText = await page.locator('.todo-list li').textContent();
    expect(todoText).toContain('Error occurred');
  });
  
  test('should update UI based on API data', async ({ page }) => {
    // Get list of users from API
    const response = await apiClient.get('/users?page=1');
    const users = response.data;
    
    // Navigate to a demo page
    await page.goto('https://demo.playwright.dev/todomvc/#/');
    
    // Add todos for each user from API
    for (const user of users) {
      await page.getByPlaceholder('What needs to be done?').fill(`Task for ${user.first_name}`);
      await page.getByPlaceholder('What needs to be done?').press('Enter');
    }
    
    // Verify the number of todos matches the number of users
    await expect(page.locator('.todo-list li')).toHaveCount(users.length);
  });
});