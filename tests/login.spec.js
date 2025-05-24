/**
 * OrangeHRM Login Tests
 */
const { test, expect } = require('@playwright/test');
const OrangeHRMLogin = require('../src/pages/OrangeHRMLogin');
const OrangeHRMDashboard = require('../src/pages/OrangeHRMDashboard');

test.describe('OrangeHRM Login Tests', () => {
  let page;
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new OrangeHRMLogin(page);
    dashboardPage = new OrangeHRMDashboard(page);
    
    await loginPage.goto();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display login page', async () => {
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator(loginPage.loginForm)).toBeVisible();
  });

  test('should login with valid credentials', async () => {
    await loginPage.login('Admin', 'admin123');
    
    // Verify successful login
    await expect(dashboardPage.isLoggedIn()).resolves.toBeTruthy();
    await expect(page).toHaveURL(/.*\/dashboard\/index/);
  });

  test('should show error with invalid credentials', async () => {
    await loginPage.login('Admin', 'wrongpassword');
    
    // Verify error message
    await expect(loginPage.hasErrorMessage()).resolves.toBeTruthy();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid credentials');
  });

  test('should navigate to forgot password page', async () => {
    await loginPage.clickForgotPassword();
    
    // Verify navigation to forgot password page
    await expect(page).toHaveURL(/.*\/requestPasswordResetCode/);
  });

  test('should logout successfully', async () => {
    // Login first
    await loginPage.login('Admin', 'admin123');
    await expect(dashboardPage.isLoggedIn()).resolves.toBeTruthy();
    
    // Then logout
    await dashboardPage.logout();
    
    // Verify back at login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator(loginPage.loginForm)).toBeVisible();
  });
});

test.describe('OrangeHRM Dashboard Tests', () => {
  let page;
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new OrangeHRMLogin(page);
    dashboardPage = new OrangeHRMDashboard(page);
    
    // Login before each test
    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');
    await expect(dashboardPage.isLoggedIn()).resolves.toBeTruthy();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display dashboard widgets', async () => {
    const widgetCount = await dashboardPage.getWidgetCount();
    expect(widgetCount).toBeGreaterThan(0);
  });

  test('should navigate to different sections', async () => {
    // Navigate to Admin
    await dashboardPage.navigateToAdmin();
    await expect(page).toHaveURL(/.*\/admin\/viewSystemUsers/);
    
    // Navigate to PIM
    await dashboardPage.navigateToPIM();
    await expect(page).toHaveURL(/.*\/pim\/viewEmployeeList/);
    
    // Navigate to Leave
    await dashboardPage.navigateToLeave();
    await expect(page).toHaveURL(/.*\/leave\/viewLeaveList/);
  });
});