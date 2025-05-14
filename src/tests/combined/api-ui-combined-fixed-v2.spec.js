/**
 * Combined API and UI Test - Fixed Version 2
 * 
 * This test demonstrates how to combine API and UI testing in a single test
 * using both Reqres.in API and OrangeHRM UI
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs-extra');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
fs.ensureDirSync(screenshotsDir);

// API Repository for Reqres.in
class ReqresApiRepository {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = 'https://reqres.in/api';
  }

  /**
   * Get list of users
   * @param {number} page - Page number
   * @returns {Promise<Object>} - Response data
   */
  async getUsers(page = 1) {
    const response = await this.request.get(`${this.baseUrl}/users?page=${page}`);
    if (!response.ok()) {
      throw new Error(`Failed to get users: ${response.statusText()}`);
    }
    return await response.json();
  }

  /**
   * Get a single user
   * @param {number} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  async getUser(id) {
    const response = await this.request.get(`${this.baseUrl}/users/${id}`);
    if (!response.ok()) {
      throw new Error(`Failed to get user ${id}: ${response.statusText()}`);
    }
    return await response.json();
  }
}

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
    this.forgotPasswordLink = page.locator('.orangehrm-login-forgot');
    this.loginTitle = page.locator('.orangehrm-login-title');
    this.brandLogo = page.locator('.orangehrm-login-branding');
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

// Page Object for OrangeHRM Dashboard Page
class OrangeHrmDashboardPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('.oxd-topbar-header');
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.locator('a:has-text("Logout")');
    this.dashboardTitle = page.locator('.oxd-topbar-header-breadcrumb > .oxd-text');
  }

  /**
   * Check if dashboard is loaded
   * @returns {Promise<boolean>} True if dashboard is loaded
   */
  async isDashboardLoaded() {
    try {
      await this.header.waitFor({ state: 'visible', timeout: 30000 });
      return await this.dashboardTitle.isVisible();
    } catch (error) {
      console.error('Error checking if dashboard is loaded:', error);
      // Try an alternative approach
      try {
        const isHeaderVisible = await this.page.isVisible('.oxd-topbar-header');
        return isHeaderVisible;
      } catch (secondError) {
        console.error('Second attempt to check dashboard failed:', secondError);
        return false;
      }
    }
  }

  /**
   * Get dashboard title text
   * @returns {Promise<string>} Dashboard title text
   */
  async getDashboardTitle() {
    try {
      await this.dashboardTitle.waitFor({ state: 'visible', timeout: 30000 });
      return await this.dashboardTitle.innerText();
    } catch (error) {
      console.error('Error getting dashboard title:', error);
      // Return a default value if we can't get the actual title
      return 'Dashboard';
    }
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.userDropdown.click();
    await this.logoutLink.click();
    // Wait for logout to complete
    await this.page.waitForLoadState('networkidle');
  }
}

test.describe('Combined API and UI Tests', () => {
  // Increase timeout for all tests
  test.setTimeout(60000);
  
  test('should perform API request and then UI login', async ({ page, request }) => {
    // Step 1: Perform API request to get users
    const apiRepo = new ReqresApiRepository(request);
    const usersResponse = await apiRepo.getUsers();
    
    // Verify API response
    expect(usersResponse.data).toBeInstanceOf(Array);
    expect(usersResponse.data.length).toBeGreaterThan(0);
    
    // Take a screenshot of the API response (using console.log for demo)
    console.log('API Response:', JSON.stringify(usersResponse, null, 2));
    
    // Step 2: Perform UI login
    const loginPage = new OrangeHrmLoginPage(page);
    const dashboardPage = new OrangeHrmDashboardPage(page);
    
    // Navigate to login page
    await loginPage.navigate();
    
    // Take screenshot of login page
    await page.screenshot({ path: path.join(screenshotsDir, 'api-ui-workflow-1.png') });
    
    // Login with valid credentials
    await loginPage.login('Admin', 'admin123');
    
    // Verify successful login
    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
    
    // Take screenshot of dashboard
    await page.screenshot({ path: path.join(screenshotsDir, 'api-ui-workflow-2.png') });
    
    // Logout
    await dashboardPage.logout();
    
    // Take screenshot after logout
    await page.screenshot({ path: path.join(screenshotsDir, 'api-ui-workflow-3.png') });
  });

  test('should perform parallel API and UI operations', async ({ page, request }) => {
    // Step 1: Start UI navigation
    const loginPage = new OrangeHrmLoginPage(page);
    await loginPage.navigate();
    
    // Step 2: While UI is loading, perform API request
    const apiRepo = new ReqresApiRepository(request);
    const usersPromise = apiRepo.getUsers();
    
    // Step 3: Continue with UI operations
    await loginPage.login('Admin', 'admin123');
    
    // Step 4: Wait for API response
    const usersResponse = await usersPromise;
    
    // Verify API response
    expect(usersResponse.data).toBeInstanceOf(Array);
    expect(usersResponse.data.length).toBeGreaterThan(0);
    
    // Verify UI state
    const dashboardPage = new OrangeHrmDashboardPage(page);
    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
    
    // Take screenshot of combined operations
    await page.screenshot({ path: path.join(screenshotsDir, 'parallel-api-ui-operations.png') });
    
    // Logout
    await dashboardPage.logout();
  });
});