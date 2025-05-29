/**
 * Form Validation Tests
 * 
 * Core tests for form validation functionality
 */
const { test, expect } = require('@playwright/test');
const config = require('../../config');

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto(config.baseUrl);
    
    // Login with default credentials
    await page.getByPlaceholder('Username').fill(config.credentials.username);
    await page.getByPlaceholder('Password').fill(config.credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/index');
  });
  
  test('should validate required fields in Add User form', async ({ page }) => {
    // Navigate to Admin page
    await page.getByRole('link', { name: 'Admin' }).click();
    
    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for form to load
    await page.waitForSelector('.oxd-form');
    
    // Submit form without filling required fields
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for validation messages to appear
    await page.waitForTimeout(1000);
    
    // Verify validation messages
    const requiredFields = page.locator('.oxd-input-field-error-message');
    const count = await requiredFields.count();
    expect(count).toBeGreaterThan(0);
    await expect(requiredFields.first()).toContainText('Required');
  });
  
  test('should validate password strength in Add User form', async ({ page }) => {
    // Skip this test for now as it's unstable
    //test.skip();
    
    // Navigate to Admin page
    await page.getByRole('link', { name: 'Admin' }).click();
    
    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for form to load
    await page.waitForSelector('.oxd-form');
    
    // Fill in a weak password
    const passwordInputs = page.locator('input[type=password]');
    await passwordInputs.first().fill('weak');
    
    // Click elsewhere to trigger validation
    await page.locator('body').click();
    
    // Wait for validation to appear
    await page.waitForTimeout(1000);
    
    // Verify password strength validation message
    const passwordError = page.locator('.oxd-input-field-error-message').first();
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText('Should have at least');
  });
  
  test('should validate password confirmation in Add User form', async ({ page }) => {
    // Skip this test for now as it's unstable
    //test.skip();
    
    // Navigate to Admin page
    await page.getByRole('link', { name: 'Admin' }).click();
    
    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for form to load
    await page.waitForSelector('.oxd-form');
    
    // Fill in different passwords
    const passwordInputs = page.locator('input[type=password]');
    await passwordInputs.first().fill('Password123');
    await passwordInputs.last().fill('DifferentPassword123');
    
    // Click elsewhere to trigger validation
    await page.locator('body').click();
    
    // Wait for validation to appear
    await page.waitForTimeout(1000);
    
    // Verify password confirmation validation message
    const confirmPasswordError = page.locator('.oxd-input-field-error-message').filter({ hasText: /[Pp]asswords/ });
    await expect(confirmPasswordError).toBeVisible();
    await expect(confirmPasswordError).toContainText('assword');
  });
  
  test('should validate username uniqueness in Add User form', async ({ page }) => {
    // Skip this test for now as it's unstable
    //test.skip();
    
    // Navigate to Admin page
    await page.getByRole('link', { name: 'Admin' }).click();
    
    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for form to load
    await page.waitForSelector('.oxd-form');
    
    // Select User Role
    await page.locator('.oxd-select-text').first().click();
    await page.getByRole('option', { name: 'Admin' }).click();
    
    // Enter Employee Name
    await page.locator('input[placeholder="Type for hints..."]').fill('Paul');
    await page.waitForTimeout(1000); // Wait for suggestions
    await page.getByText('Paul Collings').click();
    
    // Select Status
    await page.locator('.oxd-select-text').nth(1).click();
    await page.getByRole('option', { name: 'Enabled' }).click();
    
    // Enter existing username (Admin)
    await page.locator('input[autocomplete="off"]').nth(0).fill('Admin');
    
    // Click elsewhere to trigger validation
    await page.locator('body').click();
    
    // Wait for validation to appear
    await page.waitForTimeout(2000);
    
    // Verify username uniqueness validation message
    const usernameError = page.locator('.oxd-input-field-error-message').filter({ hasText: /[Aa]lready/ });
    await expect(usernameError).toBeVisible();
    await expect(usernameError).toContainText('lready exist');
  });
});