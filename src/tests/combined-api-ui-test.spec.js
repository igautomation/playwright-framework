/**
 * Combined API and UI Test
 * 
 * This test demonstrates how to combine API testing with UI verification
 * using reqres.in API and OrangeHRM UI
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs-extra');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
fs.ensureDirSync(screenshotsDir);

// Page Object for OrangeHRM Login Page
class OrangeHrmLoginPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.oxd-alert');
  }

  /**
   * Navigate to the login page
   */
  async navigate() {
    try {
      await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
        timeout: 30000
      });
      // Wait for the page to load with a more reliable approach
      await this.page.waitForSelector('input[name="username"]', { timeout: 30000 });
    } catch (error) {
      console.error('Error navigating to login page:', error);
      // Try again with a different approach if the first one fails
      await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });
    }
  }

  /**
   * Login with the given credentials
   * @param {string} username 
   * @param {string} password 
   */
  async login(username, password) {
    try {
      await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    } catch (error) {
      console.error('Error during login:', error);
      // Try again with a different approach
      await this.page.waitForTimeout(2000);
      await this.page.fill('input[name="username"]', username);
      await this.page.fill('input[name="password"]', password);
      await this.page.click('button[type="submit"]');
    }
  }
}

// API utility class for reqres.in
class ReqresApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = 'https://reqres.in/api';
  }

  /**
   * Get users from API
   * @param {number} page - Page number
   * @returns {Promise<Object>} - Response data and status
   */
  async getUsers(page = 1) {
    const response = await this.request.get(`${this.baseUrl}/users?page=${page}`);
    const data = await response.json();
    return {
      data,
      status: response.status()
    };
  }

  /**
   * Get a single user
   * @param {number} id - User ID
   * @returns {Promise<Object>} - Response data and status
   */
  async getUser(id) {
    const response = await this.request.get(`${this.baseUrl}/users/${id}`);
    const data = await response.json();
    return {
      data,
      status: response.status()
    };
  }

  /**
   * Create a user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Response data and status
   */
  async createUser(userData) {
    const response = await this.request.post(`${this.baseUrl}/users`, {
      data: userData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return {
      data,
      status: response.status()
    };
  }
}

test.describe('Combined API and UI Test', () => {
  test('should get users from API and login to OrangeHRM', async ({ page, request }) => {
    // 1. Get users from reqres.in API
    const apiClient = new ReqresApiClient(request);
    const { data: apiResponse, status } = await apiClient.getUsers();
    
    // 2. Verify API response
    expect(status).toBe(200);
    expect(apiResponse.page).toBe(1);
    expect(apiResponse.data.length).toBeGreaterThan(0);
    
    // 3. Extract first user's email for logging
    const firstUser = apiResponse.data[0];
    console.log(`First user from API: ${firstUser.first_name} ${firstUser.last_name} (${firstUser.email})`);
    
    // 4. Navigate to OrangeHRM and login
    const loginPage = new OrangeHrmLoginPage(page);
    await loginPage.navigate();
    await loginPage.login('Admin', 'admin123');
    
    // 5. Verify successful login
    await expect(page.locator('.oxd-topbar-header')).toBeVisible();
    
    // 6. Take a screenshot of the dashboard
    await page.screenshot({ path: path.join(screenshotsDir, 'api-ui-combined-test.png') });
  });

  test('should create a user via API and use data in OrangeHRM search', async ({ page, request }) => {
    // 1. Create a user via reqres.in API
    const apiClient = new ReqresApiClient(request);
    const userData = {
      name: 'John Doe',
      job: 'QA Engineer'
    };
    
    const { data: createdUser, status } = await apiClient.createUser(userData);
    
    // 2. Verify API response
    expect(status).toBe(201);
    expect(createdUser.name).toBe(userData.name);
    expect(createdUser.job).toBe(userData.job);
    expect(createdUser.id).toBeTruthy();
    
    console.log('Created user:', createdUser);
    
    // 3. Navigate to OrangeHRM and login
    const loginPage = new OrangeHrmLoginPage(page);
    await loginPage.navigate();
    await loginPage.login('Admin', 'admin123');
    
    // 4. Verify successful login
    await expect(page.locator('.oxd-topbar-header')).toBeVisible();
    
    // 5. Navigate to Admin page
    await page.locator('.oxd-main-menu-item').filter({ hasText: 'Admin' }).click();
    
    // 6. Wait for the Admin page to load
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Admin');
    
    // 7. Enter the created user's name in the Username search field
    await page.locator('.oxd-input').nth(1).fill(createdUser.name);
    
    // 8. Take a screenshot of the search
    await page.screenshot({ path: path.join(screenshotsDir, 'api-data-in-ui-search.png') });
  });

  test('should get user from API and verify OrangeHRM login status', async ({ page, request }) => {
    // 1. Get a specific user from reqres.in API
    const apiClient = new ReqresApiClient(request);
    const { data: apiResponse, status } = await apiClient.getUser(2);
    
    // 2. Verify API response
    expect(status).toBe(200);
    expect(apiResponse.data.id).toBe(2);
    expect(apiResponse.data.email).toBeTruthy();
    
    // 3. Navigate to OrangeHRM
    const loginPage = new OrangeHrmLoginPage(page);
    await loginPage.navigate();
    
    // 4. Try to login with API user's email (which will fail)
    await loginPage.login(apiResponse.data.email, 'wrong_password');
    
    // 5. Verify error message is displayed
    await expect(page.locator('.oxd-alert-content-text')).toBeVisible();
    
    // 6. Take a screenshot of the error
    await page.screenshot({ path: path.join(screenshotsDir, 'api-user-login-attempt.png') });
    
    // 7. Now login with correct credentials
    await loginPage.login('Admin', 'admin123');
    
    // 8. Verify successful login
    await expect(page.locator('.oxd-topbar-header')).toBeVisible();
    
    // 9. Take a screenshot of successful login
    await page.screenshot({ path: path.join(screenshotsDir, 'successful-login-after-api.png') });
  });

  test('should perform parallel API and UI operations', async ({ page, request }) => {
    // 1. Start API request
    const apiClient = new ReqresApiClient(request);
    const userPromise = apiClient.getUsers();
    
    // 2. While API request is in progress, navigate to OrangeHRM
    const loginPage = new OrangeHrmLoginPage(page);
    await loginPage.navigate();
    
    // 3. Wait for API response
    const { data: apiResponse, status } = await userPromise;
    
    // 4. Verify API response
    expect(status).toBe(200);
    expect(apiResponse.data.length).toBeGreaterThan(0);
    
    // 5. Use API data for login attempt (will fail but demonstrates using API data in UI)
    const firstUser = apiResponse.data[0];
    await loginPage.login(firstUser.email, 'password');
    
    // 6. Verify error message
    await expect(page.locator('.oxd-alert-content-text')).toBeVisible();
    
    // 7. Take a screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'parallel-api-ui-operations.png') });
    
    // 8. Log API and UI interaction
    console.log(`Attempted login with API user: ${firstUser.first_name} ${firstUser.last_name} (${firstUser.email})`);
  });
});