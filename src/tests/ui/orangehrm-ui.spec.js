/**
 * OrangeHRM UI Tests
 * 
 * This test suite demonstrates UI testing best practices using the OrangeHRM demo site
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Page Object for OrangeHRM Login Page
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.oxd-alert-content-text');
    this.forgotPasswordLink = page.locator('.orangehrm-login-forgot');
    this.logoImage = page.locator('.orangehrm-login-branding img');
  }

  /**
   * Navigate to the login page
   * @returns {Promise<void>}
   */
  async navigate() {
    await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await this.page.waitForLoadState('networkidle');
    await this.logoImage.waitFor({ state: 'visible' });
  }

  /**
   * Login with the given credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<void>}
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Click the forgot password link
   * @returns {Promise<void>}
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<void>}
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: true
    });
  }
}

/**
 * Page Object for OrangeHRM Dashboard Page
 */
class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('.oxd-topbar-header');
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.locator('a:has-text("Logout")');
    this.dashboardTitle = page.locator('h6:has-text("Dashboard")');
  }

  /**
   * Check if user is logged in
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    return await this.header.isVisible();
  }

  /**
   * Logout
   * @returns {Promise<void>}
   */
  async logout() {
    await this.userDropdown.click();
    await this.logoutLink.click();
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<void>}
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: true
    });
  }
}

// Test data
const testData = {
  validUser: {
    username: 'Admin',
    password: 'admin123'
  },
  invalidUser: {
    username: 'invalid',
    password: 'invalid123'
  }
};

test.describe('OrangeHRM UI Tests', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should display login page correctly', async () => {
    // When: Navigating to the login page
    await loginPage.navigate();
    
    // Then: Login page elements should be visible
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.logoImage).toBeVisible();
    
    // And: Take a screenshot
    await loginPage.takeScreenshot('orangehrm-login-page');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Given: User is on the login page
    await loginPage.navigate();
    
    // When: User logs in with valid credentials
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    
    // Then: User should be logged in successfully
    await expect(dashboardPage.header).toBeVisible();
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    
    // And: Take a screenshot
    await dashboardPage.takeScreenshot('orangehrm-dashboard');
  });

  test('should show error with invalid credentials', async () => {
    // Given: User is on the login page
    await loginPage.navigate();
    
    // When: User logs in with invalid credentials
    await loginPage.login(testData.invalidUser.username, testData.invalidUser.password);
    
    // Then: Error message should be displayed
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
    
    // And: Take a screenshot
    await loginPage.takeScreenshot('orangehrm-login-error');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Given: User is on the login page
    await loginPage.navigate();
    
    // When: User clicks on forgot password link
    await loginPage.clickForgotPassword();
    
    // Then: User should be on the forgot password page
    await expect(page.locator('h6:has-text("Reset Password")')).toBeVisible();
    
    // And: Take a screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'orangehrm-forgot-password.png'),
      fullPage: true
    });
  });

  test('should logout successfully', async ({ page }) => {
    // Given: User is logged in
    await loginPage.navigate();
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    await expect(dashboardPage.header).toBeVisible();
    
    // When: User logs out
    await dashboardPage.logout();
    
    // Then: User should be redirected to the login page
    await expect(loginPage.loginButton).toBeVisible();
    
    // And: Take a screenshot
    await loginPage.takeScreenshot('orangehrm-logout');
  });
});