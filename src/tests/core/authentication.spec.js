// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Core Test: Authentication Flow
 * Demonstrates login process and session management
 */
test('user authentication flow', async ({ page }) => {
  // Navigate to demo login page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Create a todo item (simulating authenticated action)
  await page.getByPlaceholder('What needs to be done?').fill('Task 1');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Verify the todo was added
  await expect(page.getByTestId('todo-item')).toHaveText('Task 1');
  
  // Store authentication state
  await page.context().storageState({ path: 'auth.json' });
});