/**
 * API-UI Combined Tests
 * 
 * Tests that combine API and UI interactions
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api');
const { WebInteractions } = require('../../utils/web/webInteractions');
const { DataGenerator } = require('../../utils/data/dataGenerator');
const config = require('../../config');

// Read base URLs from environment or config
const baseUrl = process.env.BASE_URL || config.baseUrl;
const apiBaseUrl = process.env.API_BASE_URL || config.api?.baseUrl;
const loginPath = process.env.LOGIN_PATH || config.paths?.login;
const dashboardPath = process.env.DASHBOARD_PATH || config.paths?.dashboard;

// Read credentials from environment or config
const username = process.env.USERNAME || config.credentials?.username;
const password = process.env.PASSWORD || config.credentials?.password;

// Read selectors from environment or config
const selectors = {
  usernameInput: process.env.USERNAME_INPUT || config.selectors?.combined?.usernameInput,
  passwordInput: process.env.PASSWORD_INPUT || config.selectors?.combined?.passwordInput,
  loginButton: process.env.LOGIN_BUTTON || config.selectors?.combined?.loginButton,
  pimLink: process.env.PIM_LINK || config.selectors?.combined?.pimLink,
  searchInput: process.env.SEARCH_INPUT || config.selectors?.combined?.searchInput,
  searchButton: process.env.SEARCH_BUTTON || config.selectors?.combined?.searchButton,
  employeeTable: process.env.EMPLOYEE_TABLE || config.selectors?.combined?.employeeTable
};

test.describe('API-UI Combined Tests', () => {
  let apiClient;
  let webInteractions;
  let dataGenerator;
  let authToken;
  
  test.beforeEach(async ({ page, request }) => {
    // Initialize utilities
    apiClient = new ApiClient(apiBaseUrl);
    webInteractions = new WebInteractions(page);
    dataGenerator = new DataGenerator();
    
    // Navigate to the login page
    await page.goto(`${baseUrl}${loginPath}`);
    
    // Intercept network requests to capture auth token
    await page.route('**/api/v2/auth/login', async route => {
      // Continue the request
      await route.continue();
      // Get the response
      const response = await route.request().response();
      const responseBody = await response.json();
      // Store the token
      authToken = responseBody?.data?.access_token || '';
      
      // Set auth token for API client
      if (authToken) {
        apiClient.setAuthToken(authToken);
      }
    });
    
    // Login
    await webInteractions.fillForm({
      [selectors.usernameInput]: username,
      [selectors.passwordInput]: password
    });
    await webInteractions.click(selectors.loginButton);
    
    // Wait for dashboard to load
    await page.waitForURL(`**${dashboardPath}`);
  });
  
  test('should create employee via API and verify in UI', async ({ page, request }) => {
    // Skip if no auth token
    test.skip(!authToken, 'Auth token not captured');
    
    // Generate random employee data
    const employeeData = {
      firstName: dataGenerator.firstName(),
      middleName: dataGenerator.firstName(),
      lastName: dataGenerator.lastName(),
      employeeId: dataGenerator.employeeId()
    };
    
    // Create employee via API
    const responseData = await apiClient.post('/v2/pim/employees', employeeData);
    
    // Verify API response
    expect(responseData.data).toBeDefined();
    const employeeId = responseData.data.empNumber;
    
    // Navigate to PIM page to verify employee in UI
    await webInteractions.click(selectors.pimLink);
    
    // Search for the employee
    await webInteractions.fill(selectors.searchInput, `${employeeData.firstName} ${employeeData.lastName}`);
    await webInteractions.click(selectors.searchButton);
    
    // Wait for search results
    await page.waitForSelector(selectors.employeeTable);
    
    // Verify employee is found in the table
    const employeeRow = page.locator(selectors.employeeTable).first();
    await expect(employeeRow).toContainText(employeeData.firstName);
    await expect(employeeRow).toContainText(employeeData.lastName);
    await expect(employeeRow).toContainText(employeeData.employeeId);
  });
  
  test('should get employee list via API and verify in UI', async ({ page, request }) => {
    // Skip if no auth token
    test.skip(!authToken, 'Auth token not captured');
    
    // Get employees via API
    const responseData = await apiClient.get('/v2/pim/employees');
    
    // Verify API response
    expect(responseData.data).toBeDefined();
    
    // Skip if no employees found
    test.skip(!responseData.data || responseData.data.length === 0, 'No employees found');
    
    // Get the first employee
    const employee = responseData.data[0];
    
    // Navigate to PIM page
    await webInteractions.click(selectors.pimLink);
    
    // Search for the employee
    await webInteractions.fill(selectors.searchInput, `${employee.firstName} ${employee.lastName}`);
    await webInteractions.click(selectors.searchButton);
    
    // Wait for search results
    await page.waitForSelector(selectors.employeeTable);
    
    // Verify employee is found in the table
    const employeeRow = page.locator(selectors.employeeTable).first();
    await expect(employeeRow).toContainText(employee.firstName);
    await expect(employeeRow).toContainText(employee.lastName);
    await expect(employeeRow).toContainText(employee.employeeId);
  });
});