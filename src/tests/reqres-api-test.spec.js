/**
 * Reqres Api Test Tests
 */
const { test, expect } = require('@playwright/test');

test.describe('Reqres Api Test', () => {
  test('basic test', async ({ page }) => {
    // Navigate to a page
    await page.goto(process.env.EXAMPLE_URL || process.env.BASE_URL);
    
    // Verify the page loaded
    await expect(page).toHaveTitle(/Example Domain/);
  });
});