/**
 * OrangeHRM UI Tests
 * 
 * This test demonstrates UI testing capabilities using the OrangeHRM demo site
 * https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
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
    await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    // Wait for the page to load completely
    await this.page.waitForLoadState('networkidle');
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

  /**
   * Click on forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Get error message text
   * @returns {Promise<string>} Error message text
   */
  async getErrorMessage() {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.innerText();
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
    // Updated selector for quick launch items which may have changed in the UI
    this.quickLaunchItems = page.locator('.oxd-grid-item');
    this.sidebarMenuItems = page.locator('.oxd-main-menu-item');
    this.timeAtWorkWidget = page.locator('.orangehrm-attendance-card');
  }

  /**
   * Check if dashboard is loaded
   * @returns {Promise<boolean>} True if dashboard is loaded
   */
  async isDashboardLoaded() {
    await this.header.waitFor({ state: 'visible' });
    return await this.dashboardTitle.isVisible();
  }

  /**
   * Get dashboard title text
   * @returns {Promise<string>} Dashboard title text
   */
  async getDashboardTitle() {
    await this.dashboardTitle.waitFor({ state: 'visible' });
    return await this.dashboardTitle.innerText();
  }

  /**
   * Get quick launch items count
   * @returns {Promise<number>} Quick launch items count
   */
  async getQuickLaunchItemsCount() {
    return await this.quickLaunchItems.count();
  }

  /**
   * Get sidebar menu items
   * @returns {Promise<string[]>} Sidebar menu items text
   */
  async getSidebarMenuItems() {
    const count = await this.sidebarMenuItems.count();
    const items = [];
    for (let i = 0; i < count; i++) {
      const text = await this.sidebarMenuItems.nth(i).innerText();
      items.push(text.trim());
    }
    return items;
  }

  /**
   * Navigate to a specific menu item
   * @param {string} menuName - Name of the menu item
   */
  async navigateToMenu(menuName) {
    await this.page.locator(`.oxd-main-menu-item:has-text("${menuName}")`).click();
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.userDropdown.click();
    await this.logoutLink.click();
  }
}

// Page Object for OrangeHRM Forgot Password Page
class OrangeHrmForgotPasswordPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.resetButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button.orangehrm-forgot-password-button--cancel');
    this.title = page.locator('.orangehrm-forgot-password-title');
  }

  /**
   * Check if forgot password page is loaded
   * @returns {Promise<boolean>} True if forgot password page is loaded
   */
  async isForgotPasswordPageLoaded() {
    await this.title.waitFor({ state: 'visible' });
    return await this.title.isVisible();
  }

  /**
   * Enter username for password reset
   * @param {string} username - Username to reset password for
   */
  async enterUsername(username) {
    await this.usernameInput.fill(username);
  }

  /**
   * Click reset password button
   */
  async clickResetButton() {
    await this.resetButton.click();
  }

  /**
   * Click cancel button
   */
  async clickCancelButton() {
    await this.cancelButton.click();
  }
}

test.describe('OrangeHRM UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    const loginPage = new OrangeHrmLoginPage(page);
    await loginPage.navigate();
  });

  test('should display login page correctly', async ({ page }) => {
    const loginPage = new OrangeHrmLoginPage(page);
    
    // Verify login page elements
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.loginTitle).toBeVisible();
    await expect(loginPage.brandLogo).toBeVisible();
    
    // Verify page title
    await expect(page).toHaveTitle(/OrangeHRM/);
    
    // Take a screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'orangehrm-login-page.png') });
  });

  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new OrangeHrmLoginPage(page);
    const dashboardPage = new OrangeHrmDashboardPage(page);
    
    // Login with valid credentials
    await loginPage.login('Admin', 'admin123');
    
    // Verify successful login by checking for dashboard element
    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
    
    // Verify dashboard title
    const dashboardTitle = await dashboardPage.getDashboardTitle();
    expect(dashboardTitle).toBe('Dashboard');
    
    // Take a screenshot of the dashboard
    await page.screenshot({ path: path.join(screenshotsDir, 'orangehrm-dashboard.png') });
    
    // Logout
    await dashboardPage.logout();
    
    // Verify we're back at the login page
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new OrangeHrmLoginPage(page);
    
    // Login with invalid credentials
    await loginPage.login('invalid', 'invalid123');
    
    // Verify error message - wait for it to appear
    await expect(loginPage.errorMessage).toBeVisible();
    
    // Verify error message text
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
    
    // Take a screenshot showing the error
    await page.screenshot({ path: path.join(screenshotsDir, 'orangehrm-login-error.png') });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    const loginPage = new OrangeHrmLoginPage(page);
    const forgotPasswordPage = new OrangeHrmForgotPasswordPage(page);
    
    // Click on forgot password link
    await loginPage.clickForgotPassword();
    
    // Verify forgot password page is loaded
    const isForgotPasswordPageLoaded = await forgotPasswordPage.isForgotPasswordPageLoaded();
    expect(isForgotPasswordPageLoaded).toBeTruthy();
    
    // Take a screenshot of the forgot password page
    await page.screenshot({ path: path.join(screenshotsDir, 'orangehrm-forgot-password.png') });
    
    // Click cancel button to go back to login page
    await forgotPasswordPage.clickCancelButton();
    
    // Verify we're back at the login page
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should display dashboard with quick launch items', async ({ page }) => {
    const loginPage = new OrangeHrmLoginPage(page);
    const dashboardPage = new OrangeHrmDashboardPage(page);
    
    // Login with valid credentials
    await loginPage.login('Admin', 'admin123');
    
    // Verify dashboard is loaded
    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
    
    // Verify quick launch items are displayed
    const quickLaunchItemsCount = await dashboardPage.getQuickLaunchItemsCount();
    expect(quickLaunchItemsCount).toBeGreaterThan(0);
    
    // Get sidebar menu items
    const sidebarMenuItems = await dashboardPage.getSidebarMenuItems();
    console.log('Sidebar menu items:', sidebarMenuItems);
    expect(sidebarMenuItems.length).toBeGreaterThan(0);
    
    // Take a screenshot of the dashboard
    await page.screenshot({ path: path.join(screenshotsDir, 'orangehrm-dashboard-items.png') });
    
    // Logout
    await dashboardPage.logout();
  });

  test('should navigate to Admin page', async ({ page }) => {
    const loginPage = new OrangeHrmLoginPage(page);
    const dashboardPage = new OrangeHrmDashboardPage(page);
    
    // Login with valid credentials
    await loginPage.login('Admin', 'admin123');
    
    // Verify dashboard is loaded
    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
    
    // Navigate to Admin page
    await dashboardPage.navigateToMenu('Admin');
    
    // Verify Admin page is loaded
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Admin');
    
    // Take a screenshot of the Admin page
    await page.screenshot({ path: path.join(screenshotsDir, 'orangehrm-admin-page.png') });
    
    // Logout
    await dashboardPage.logout();
  });
});