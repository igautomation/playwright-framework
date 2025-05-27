/**
 * Authentication Tests
 * 
 * Core tests for authentication functionality
 */
const { test, expect } = require('@playwright/test');
const WebInteractions = require('../../utils/web/webInteractions');
const config = require('../../config');

// Get configuration values
const baseUrl = config.urls.orangeHRM;
const loginPath = config.paths.orangeHRM.login;
const dashboardPath = config.paths.orangeHRM.dashboard;

// Credentials
const validUsername = config.credentials.orangeHRM.username;
const validPassword = config.credentials.orangeHRM.password;
const invalidUsername = config.credentials.orangeHRM.invalidUsername;
const invalidPassword = config.credentials.orangeHRM.invalidPassword;

// Selectors
const selectors = config.selectors.auth;

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
    await expect(page).toHaveURL(new RegExp(`.*${loginPath.replace(/\\//g, '\\\\/')}`));
    await expect(page.locator(selectors.loginButton)).toBeVisible();
  });
  
  test('should remember login credentials', async ({ page }) => {
    // Check the "Remember me" checkbox
    await webInteractions.check(selectors.rememberMeCheckbox);
    
    // Fill in login form
    await webInteractions.fillForm({
      [selectors.usernameInput]: validUsername,
      [selectors.passwordInput]: validPassword
    });
    
    // Click login button
    await webInteractions.click(selectors.loginButton);
    
    // Verify successful login
    await page.waitForURL(`**${dashboardPath}`);
    
    // Logout
    await webInteractions.click(selectors.userDropdown);
    await webInteractions.click(selectors.logoutMenuItem);
    
    // Verify username is remembered
    await expect(page.locator(selectors.usernameInput)).toHaveValue(validUsername);
  });
});