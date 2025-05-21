/**
 * Combined Test Suite for Playwright Framework
 * 
 * This test suite includes:
 * 1. Web UI tests using OrangeHRM demo site
 * 2. API tests using Reqres.in
 * 3. Combined API and UI tests
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// API utility class
class ApiUtils {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
  }

  /**
   * Get data from an API endpoint
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data
   */
  async getData(endpoint) {
    const response = await this.request.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'reqres-free-v1'
      }
    });
    return await response.json();
  }

  /**
   * Post data to an API endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to post
   * @returns {Promise<Object>} - Response data
   */
  async postData(endpoint, data) {
    const response = await this.request.post(endpoint, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'reqres-free-v1'
      }
    });
    const responseData = await response.json();
    return responseData;
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
    this.passwordInput = page.locator('input[name=process.env.PASSWORD]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.oxd-alert');
  }

  /**
   * Navigate to the login page
   */
  async navigate() {
    await this.page.goto(process.env.ORANGEHRM_URL);
  }

  /**
   * Login with the given credentials
   * @param {string} username 
   * @param {string} password 
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

// Web UI Tests
test.describe('Web UI Tests - OrangeHRM', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new OrangeHrmLoginPage(page);
    await loginPage.navigate();
  });

  test('should display login page correctly', async ({ page }) => {
    // Verify login page elements
    await expect(loginPage.usernameInput).toBeVisible();
});

    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'orangehrm-login-page.png') });
  });

  test('should login with valid credentials', async ({ page }) => {
    // Login with default credentials
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
    
    // Verify successful login
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible();
    
    // Take a screenshot of the dashboard
    await page.screenshot({ path: path.join(screenshotsDir, 'orangehrm-dashboard.png') });
  });
});

// API Tests
test.describe('API Tests - Reqres.in', () => {
  let apiUtils;

  test.beforeEach(async ({ request }) => {
    apiUtils = new ApiUtils(request);
  });

  test('should get list of users', async () => {
    // Get users from API
    const apiResponse = await apiUtils.getData(`${process.env.API_URL}/'https:/`users?page=1');
    
    // Verify API response structure
    expect(apiResponse.page).toBe(1);
    expect(apiResponse.data.length).toBeGreaterThan(0);
    expect(apiResponse.data[0].email).toBeTruthy();
  });

  test('should create a user', async () => {
    // Create user data
    const userData = {
      name: 'John Doe',
      job: 'QA Engineer'
    };
    
    // Create user via API
    const apiResponse = await apiUtils.postData(`${process.env.API_URL}/'https:/`users', userData);
    
    // Verify API response
    expect(apiResponse.name).toBe(userData.name);
    expect(apiResponse.job).toBe(userData.job);
    expect(apiResponse.id).toBeTruthy();
  });
});

// Combined API and UI Tests
test.describe('Combined API and UI Tests', () => {
  let apiUtils;

  test.beforeEach(async ({ request }) => {
    apiUtils = new ApiUtils(request);
  });

  test('should get users via API and display in UI', async ({ page }) => {
    // Get users from API
    const apiResponse = await apiUtils.getData(`${process.env.API_URL}/'https:/`users?page=1');
    
    // Navigate to the website
    await page.goto(process.env.API_BASE_URL);
    
    // Create a custom UI element to display API results
    await page.evaluate((userData) => {
      const resultsDiv = document.createElement('div');
      resultsDiv.id = 'api-results';
      resultsDiv.style.padding = '20px';
      resultsDiv.style.margin = '20px';
      resultsDiv.style.border = '1px solid #ccc';
      resultsDiv.innerHTML = `
        <h3>API Results - User List</h3>
        <p>Total users: ${userData.total}</p>
        <ul>
          ${userData.data.map(user => `
            <li>${user.first_name} ${user.last_name} (${user.email})</li>
          `).join('')}
        </ul>
      `;
      document.body.appendChild(resultsDiv);
    }, apiResponse);
    
    // Take a screenshot showing the API results
    await page.screenshot({ path: path.join(screenshotsDir, 'combined-api-ui-test.png') });
    
    // Verify our custom element is visible
    await expect(page.locator('#api-results')).toBeVisible();
  });
});