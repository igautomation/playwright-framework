/**
 * API and UI Integration Tests
 * 
 * Comprehensive test suite that combines API and UI testing
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api/apiUtils');

test.describe('API and UI Integration', () => {
  let apiClient;
  
  test.beforeEach(() => {
    apiClient = new ApiClient(process.env.API_URL);
  });
  
  test('should fetch user data via API and verify on UI', async ({ page }) => {
    // 1. Fetch user data via API
    const response = await apiClient.get('/users/2');
    
    // 2. Verify API response
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('id', 2);
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('first_name');
    expect(response.data).toHaveProperty('last_name');
    
    // 3. Navigate to UI
    await page.goto(process.env.API_BASE_URL);
    
    // 4. Verify UI elements
    await expect(page).toHaveTitle(/Reqres/);
    
    // 5. Verify user data is displayed correctly
    const userName = `${response.data.first_name} ${response.data.last_name}`;
    await page.getByText(userName).isVisible();
  });
  
  test('should create user via API and verify on UI', async ({ page }) => {
    // 1. Create user data
    const userData = {
      name: 'John Doe',
      job: 'Software Tester'
    };
    
    // 2. Create user via API
    const response = await apiClient.post('/users', userData);
    
    // 3. Verify API response
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('name', userData.name);
    expect(response).toHaveProperty('job', userData.job);
    expect(response).toHaveProperty('createdAt');
    
    // 4. Navigate to UI
    await page.goto(process.env.API_BASE_URL);
    
    // 5. Verify UI elements
    await expect(page).toHaveTitle(/Reqres/);
  });
});