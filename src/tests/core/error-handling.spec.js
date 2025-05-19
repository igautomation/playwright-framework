// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Core Test: Error Handling
 * Demonstrates testing error states and error handling
 */
test('error state handling', async ({ page }) => {
  // Navigate to a page that will show a 404 error
  await page.goto('https://playwright.dev/non-existent-page');
  
  // Verify the page shows a 404 error
  await expect(page.locator('text=Page Not Found')).toBeVisible();
  
  // Take a screenshot of the error state
  await page.screenshot({ path: 'error-404.png' });
});

test('form validation error handling', async ({ page }) => {
  // Navigate to a form page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Add a todo
  await page.getByPlaceholder('What needs to be done?').fill('Task 1');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Try to add a duplicate (assuming this would show an error in a real app)
  await page.getByPlaceholder('What needs to be done?').fill('Task 1');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // In a real app, we would check for error messages here
  // For this demo, we'll just verify the todo count
  await expect(page.getByTestId('todo-item')).toHaveCount(2);
  
  // Simulate network error handling
  await page.route('**/*', route => {
    route.abort('failed');
  });
  
  // Try to add another todo, which should fail due to network error
  await page.getByPlaceholder('What needs to be done?').fill('Task that will fail');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // In a real app, we would check for network error messages
  // For this demo, we'll just verify the todo count hasn't changed
  await expect(page.getByTestId('todo-item')).toHaveCount(2);
});