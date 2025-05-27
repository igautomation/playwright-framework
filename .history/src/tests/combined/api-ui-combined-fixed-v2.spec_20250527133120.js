/**
 * API-UI Combined Tests V2
 * 
 * Enhanced tests that combine API and UI interactions with improved error handling
 */
const { test, expect } = require('@playwright/test');
const { ApiClient, RestUtils } = require('../../utils/api');
const WebInteractions = require('../../utils/web/webInteractions');
const { DataGenerator } = require('../../utils/data/dataGenerator');
const { PlaywrightErrorHandler } = require('../../utils/common/errorHandler');
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
  adminLink: process.env.ADMIN_LINK || config.selectors?.combined?.adminLink,
  searchInput: process.env.SEARCH_INPUT || config.selectors?.combined?.searchInput,
  searchButton: process.env.SEARCH_BUTTON || config.selectors?.combined?.searchButton,
  employeeTable: process.env.EMPLOYEE_TABLE || config.selectors?.combined?.employeeTable,
  addButton: process.env.ADD_BUTTON || config.selectors?.combined?.addButton,
  userRoleDropdown: process.env.USER_ROLE_DROPDOWN || config.selectors?.combined?.userRoleDropdown,
  employeeNameInput: process.env.EMPLOYEE_NAME_INPUT || config.selectors?.combined?.employeeNameInput,
  statusDropdown: process.env.STATUS_DROPDOWN || config.selectors?.combined?.statusDropdown,
  usernameField: process.env.USERNAME_FIELD || config.selectors?.combined?.usernameField,
  passwordField: process.env.PASSWORD_FIELD || config.selectors?.combined?.passwordField,
  saveButton: process.env.SAVE_BUTTON || config.selectors?.combined?.saveButton
};

test.describe('API-UI Combined Tests V2', () => {
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
    
    // Login with error handling
    await PlaywrightErrorHandler.withRetry(async () => {
      await webInteractions.fillForm({
        [selectors.usernameInput]: username,
        [selectors.passwordInput]: password
      });
      await webInteractions.click(selectors.loginButton);
      
      // Wait for dashboard to load
      await page.waitForURL(`**${dashboardPath}`);
    }, { maxRetries: 2, retryDelay: 1000 });
  });
  
  test('should create user via UI and verify via API', async ({ page, request }) => {
    // Skip if no auth token
    test.skip(!authToken, 'Auth token not captured');
    
    // Generate random user data
    const userData = {
      username: dataGenerator.username(),
      password: dataGenerator.password(),
      employeeName: 'Paul Collings', // Using existing employee
      userRole: 'ESS',
      status: 'Enabled'
    };
    
    // Navigate to Admin page
    await webInteractions.click(selectors.adminLink);
    
    // Click Add button
    await webInteractions.click(selectors.addButton);
    
    // Wait for form to load
    await page.waitForSelector('.oxd-form');
    
    // Fill the form with self-healing locators
    await PlaywrightErrorHandler.withSelfHealing(async (selector) => {
      // Select User Role
      await page.locator(selector).first().click();
      await page.getByRole('option', { name: userData.userRole }).click();
    }, {
      selector: selectors.userRoleDropdown,
      alternativeSelectors: ['.oxd-select-wrapper input', '.oxd-select-text-input']
    });
    
    // Enter Employee Name
    await webInteractions.fill(selectors.employeeNameInput, userData.employeeName.split(' ')[0]);
    await page.waitForTimeout(1000); // Wait for suggestions
    await page.getByText(userData.employeeName).click();
    
    // Select Status
    await PlaywrightErrorHandler.withSelfHealing(async (selector) => {
      await page.locator(selector).nth(1).click();
      await page.getByRole('option', { name: userData.status }).click();
    }, {
      selector: selectors.userRoleDropdown,
      alternativeSelectors: ['.oxd-select-wrapper input', '.oxd-select-text-input']
    });
    
    // Enter Username and Password
    await webInteractions.fill(selectors.usernameField, userData.username);
    await webInteractions.fillForm({
      [selectors.passwordField]: userData.password,
      [selectors.passwordField + ':nth-child(2)']: userData.password
    });
    
    // Save the form
    await webInteractions.click(selectors.saveButton);
    
    // Wait for success (redirect back to users list)
    await page.waitForURL('**/admin/viewSystemUsers');
    
    // Verify via API that the user was created
    const responseData = await apiClient.get('/v2/admin/users', {
      params: {
        username: userData.username
      }
    });
    
    // Verify API response
    expect(responseData.data).toBeDefined();
    expect(responseData.data.length).toBeGreaterThan(0);
    
    // Find the created user
    const createdUser = responseData.data.find(user => user.username === userData.username);
    expect(createdUser).toBeDefined();
    expect(createdUser.userRole.name).toBe(userData.userRole);
    expect(createdUser.status).toBe(userData.status === 'Enabled' ? true : false);
  });
  
  test('should update employee via API and verify changes in UI', async ({ page, request }) => {
    // Skip if no auth token
    test.skip(!authToken, 'Auth token not captured');
    
    // First, get an existing employee via API
    const employeesData = await apiClient.get('/v2/pim/employees');
    
    // Skip if no employees found
    test.skip(!employeesData.data || employeesData.data.length === 0, 'No employees found');
    
    // Get the first employee
    const employee = employeesData.data[0];
    const employeeId = employee.empNumber;
    
    // Generate updated data
    const updatedData = {
      firstName: dataGenerator.firstName(),
      lastName: dataGenerator.lastName(),
      middleName: dataGenerator.firstName()
    };
    
    // Update employee via API with error handling
    const updateData = await PlaywrightErrorHandler.withRetry(async () => {
      return await apiClient.put(`/v2/pim/employees/${employeeId}`, updatedData);
    }, { maxRetries: 2, retryDelay: 1000 });
    
    // Navigate to PIM page to verify updated employee in UI
    await webInteractions.click(selectors.pimLink);
    
    // Search for the employee with performance measurement
    await PlaywrightErrorHandler.withPerformanceMeasurement(async () => {
      await webInteractions.fill(selectors.searchInput, `${updatedData.firstName} ${updatedData.lastName}`);
      await webInteractions.click(selectors.searchButton);
      
      // Wait for search results
      await page.waitForSelector(selectors.employeeTable);
    }, 'Employee Search');
    
    // Verify employee is found with updated data
    const employeeRow = page.locator(selectors.employeeTable).first();
    await expect(employeeRow).toContainText(updatedData.firstName);
    await expect(employeeRow).toContainText(updatedData.lastName);
  });
});