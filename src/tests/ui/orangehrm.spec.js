/**
 * OrangeHRM UI Tests
 * 
 * Comprehensive test suite for OrangeHRM demo site
 */
const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/orangehrm/LoginPage');
const DashboardPage = require('../../pages/orangehrm/DashboardPage');

test.describe('OrangeHRM Login', () => {
  let loginPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });
  
  test('should display login page', async ({ page }) => {
    // Verify login page elements
    await expect(page).toHaveTitle(/OrangeHRM/);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
  
  test('should login successfully with valid credentials', async ({ page }) => {
    // Login with valid credentials
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
    
    // Verify successful login
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.header).toBeVisible();
    await expect(dashboardPage.header).toContainText('Dashboard');
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    // Login with invalid credentials
    await loginPage.login('invalid', 'invalid');
    
    // Verify error message
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });
});

test.describe('OrangeHRM Dashboard', () => {
  let loginPage;
  let dashboardPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Login before each test
    await loginPage.goto();
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
    
    // Verify we're on the dashboard
    await expect(dashboardPage.header).toBeVisible();
  });
  
  test('should display dashboard widgets', async ({ page }) => {
    // Verify dashboard widgets
    await expect(dashboardPage.timeAtWorkWidget).toBeVisible();
    await expect(dashboardPage.quickLaunchWidget).toBeVisible();
  });
  
  test('should navigate to Admin page', async ({ page }) => {
    // Navigate to Admin page
    await dashboardPage.navigateToMenu('Admin');
    
    // Verify Admin page is loaded
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('Admin');
  });
});

test.describe('OrangeHRM Employee Management', () => {
  let loginPage;
  let dashboardPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Login before each test
    await loginPage.goto();
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
  });
  
  test('should navigate to PIM module', async ({ page }) => {
    // Navigate to PIM module
    await dashboardPage.navigateToMenu('PIM');
    
    // Verify PIM page is loaded
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toContainText('PIM');
  });
});