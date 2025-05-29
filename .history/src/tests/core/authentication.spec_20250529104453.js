/**
 * Authentication Tests
 * 
 * Core tests for authentication functionality
 */
const { test, expect } = require('@playwright/test');
const WebInteractions = require('../../utils/web/webInteractions');

// Define constants for the tests
const baseUrl = 'https://opensource-demo.orangehrmlive.com';
const loginPath = '/web/index.php/auth/login';
const dashboardPath = '/web/index.php/dashboard/index';

// Credentials
const validUsername = 'Admin';
const validPassword = 'admin123';
const invalidUsername = 'invalid_user';
const invalidPassword = 'invalid_password';

// Selectors
const selectors = {
  usernameInput: 'input[name="username"]',
  passwordInput: 'input[name="password"]',
  loginButton: 'button[type="submit"]',
  errorAlert: '.oxd-alert-content-text',
  requiredFieldError: '.oxd-input-field-error-message',
  userDropdown: '.oxd-userdropdown-tab',
  logoutMenuItem: 'a:has-text("Logout")',
  rememberMeCheckbox: 'input[type="checkbox"]'
};

test.describe('Authentication', () => {
  let webInteractions;
  
  test.beforeEach(async ({ page }) => {
    // Initialize web interactions utility
    webInteractions = new WebInteractions(page);
    
    // Navigate to the login page before each test
    await page.goto(`${baseUrl}${loginPath}`);
  });
  
  test('should login with valid credentials', async ({ page }) => {
    // Fill in login form with valid credentials using utility
    await webInteractions.fillForm({
      [selectors.usernameInput]: validUsername,
      [selectors.passwordInput]: validPassword
    });
    
    // Click login button
    await webInteractions.click(selectors.loginButton);
    
    // Verify successful login by checking URL and dashboard element
    await page.waitForURL(`**${dashboardPath}`);
    await expect(page.locator('.oxd-topbar-header-title')).toBeVisible();
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in login form with invalid credentials using utility
    await webInteractions.fillForm({
      [selectors.usernameInput]: invalidUsername,
      [selectors.passwordInput]: invalidPassword
    });
    
    // Click login button
    await webInteractions.click(selectors.loginButton);
    
    // Verify error message
    await expect(page.locator(selectors.errorAlert)).toBeVisible();
    await expect(page.locator(selectors.errorAlert)).toHaveText('Invalid credentials');
  });
  
  test('should require username and password', async ({ page }) => {
    // Click login button without entering credentials
    await webInteractions.click(selectors.loginButton);
    
    // Verify validation messages
    const requiredFields = page.locator(selectors.requiredFieldError);
    await expect(requiredFields).toHaveCount(2);
    await expect(requiredFields.first()).toHaveText('Required');
    await expect(requiredFields.last()).toHaveText('Required');
  });
  
  test('should logout successfully', async ({ page }) => {
    // Login first using utility method
    await webInteractions.login(validUsername, validPassword);
    
    // Wait for dashboard to load
    await page.waitForURL(`**${dashboardPath}`);
    
    // Click on user dropdown
    await webInteractions.click(selectors.userDropdown);
    
    // Click logout
    await webInteractions.click(selectors.logoutMenuItem);
    
    // Verify we're back at the login page
    await expect(page).toHaveURL(new RegExp(`.*${loginPath}`));
    await expect(page.locator(selectors.loginButton)).toBeVisible();
  });
});