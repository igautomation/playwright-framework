/**
 * Combined API and UI Test - Fixed Version 2
 * 
 * This test demonstrates how to combine API and UI testing in a single test
 * using both Reqres.in API and OrangeHRM UI
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api/apiUtils');
const LoginPage = require('../../pages/orangehrm/LoginPage');
const DashboardPage = require('../../pages/orangehrm/DashboardPage');

test.describe('Combined API and UI Tests', () => {
  let apiClient;
  let loginPage;
  let dashboardPage;
  
  test.beforeEach(async ({ page }) => {
    apiClient = new ApiClient(process.env.API_URL);
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });
  
  test('should fetch user data via API and verify on UI', async ({ page }) => {
    // 1. Fetch user data via API
    const response = await apiClient.get('/users/2');
    
    // 2. Verify API response
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('id', 2);
    expect(response.data).toHaveProperty('email');
    
    // 3. Navigate to OrangeHRM
    await loginPage.goto();
    
    // 4. Login with valid credentials
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
    
    // 5. Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // 6. Verify dashboard is displayed
    await expect(dashboardPage.header).toBeVisible();
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
    
    // 4. Navigate to OrangeHRM
    await loginPage.goto();
    
    // 5. Login with valid credentials
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
    
    // 6. Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // 7. Verify dashboard is displayed
    await expect(dashboardPage.header).toBeVisible();
  });
});