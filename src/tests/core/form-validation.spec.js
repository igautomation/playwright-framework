/**
 * Form Validation Tests
 * 
 * Core tests for form validation functionality
 */
const { test, expect } = require('@playwright/test');

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto(process.env.ORANGEHRM_URL);
    
    // Login with default credentials
    await page.getByPlaceholder('Username').fill(process.env.USERNAME);
    await page.getByPlaceholder('Password').fill(process.env.PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/index');
  });
  
  test('should validate required fields in Add User form', async ({ page }) => {
    // Navigate to Admin page
    await page.getByRole('link', { name: process.env.USERNAME }).click();
    
    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for form to load
    await page.waitForSelector('.oxd-form');
    
    // Submit form without filling required fields
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify validation messages
    const requiredFields = page.locator('.oxd-input-field-error-message');
    await expect(requiredFields).toHaveCount(4); // User Role, Employee Name, Status, Username, Password
    await expect(requiredFields.first()).toHaveText('Required');
  });
  
  test('should validate password strength in Add User form', async ({ page }) => {
    // Navigate to Admin page
    await page.getByRole('link', { name: process.env.USERNAME }).click();
    
    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for form to load
    await page.waitForSelector('.oxd-form');
    
    // Fill in a weak password
    const passwordInputs = page.locator('input[type=password]');
    await passwordInputs.first().fill('weak');
    
    // Click elsewhere to trigger validation
    await page.locator('body').click();
    
    // Verify password strength validation message
    const passwordError = page.locator('.user-password-cell .oxd-input-field-error-message');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText('should have at least 7 characters');
  });
  
  test('should validate password confirmation in Add User form', async ({ page }) => {
    // Navigate to Admin page
    await page.getByRole('link', { name: process.env.USERNAME }).click();
    
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
    
    // Verify password confirmation validation message
    const confirmPasswordError = page.locator('.user-password-row .oxd-input-field-error-message').last();
    await expect(confirmPasswordError).toBeVisible();
    await expect(confirmPasswordError).toContainText('Passwords do not match');
  });
  
  test('should validate username uniqueness in Add User form', async ({ page }) => {
    // Navigate to Admin page
    await page.getByRole('link', { name: process.env.USERNAME }).click();
    
    // Click Add button
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for form to load
    await page.waitForSelector('.oxd-form');
    
    // Select User Role
    await page.locator('.oxd-select-text').first().click();
    await page.getByRole('option', { name: process.env.USERNAME }).click();
    
    // Enter Employee Name
    await page.locator('input[placeholder="Type for hints..."]').fill('Paul');
    await page.waitForTimeout(1000); // Wait for suggestions
    await page.getByText('Paul Collings').click();
    
    // Select Status
    await page.locator('.oxd-select-text').nth(1).click();
    await page.getByRole('option', { name: 'Enabled' }).click();
    
    // Enter existing username (Admin)
    await page.locator('input[autocomplete="off"]').nth(0).fill(process.env.USERNAME);
    
    // Click elsewhere to trigger validation
    await page.locator('body').click();
    await page.waitForTimeout(1000); // Wait for validation
    
    // Verify username uniqueness validation message
    const usernameError = page.locator('.oxd-input-field-error-message').nth(2);
    await expect(usernameError).toBeVisible();
    await expect(usernameError).toContainText('Already exists');
  });
});