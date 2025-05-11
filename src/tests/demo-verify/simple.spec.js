const { test, expect } = require('@playwright/test');

/**
 * Simple test suite for verification
 */
test.describe('Simple test suite', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test
    await page.goto('https://example.com/');
  });

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test('has heading', async ({ page }) => {
    // Expect heading to be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Example Domain');
  });
});