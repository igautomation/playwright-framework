// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Form Validation', () => {

/**
 * Core Test: Form Validation
 * Demonstrates form interactions and validation testing
 */
test('form submission and validation', async ({ page }) => {
  // Navigate to a form page
  await page.goto(process.env.TODO_APP_URL);
});

  // Test empty input validation
  await page.getByPlaceholder('What needs to be done?').click();
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Verify no todo was added (validation prevented empty submission)
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  
  // Test valid input submission
  await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Verify todo was added successfully
  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-item')).toHaveText('Buy groceries');
  
  // Test form interaction - mark as completed
  await page.getByRole('checkbox').check();
  
  // Verify todo was marked as completed
  await expect(page.locator('.completed')).toHaveCount(1);
  
  // Test form interaction - clear completed
  await page.getByRole('button', { name: 'Clear completed' }).click();
  
  // Verify todo was removed
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});
});
