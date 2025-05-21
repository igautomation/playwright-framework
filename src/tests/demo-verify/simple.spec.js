const { test, expect } = require('@playwright/test');

/**
 * Simple test suite for verification
 */
test.describe('Simple test suite', () => {
  test.beforeEach(async ({ page }) => {
    // Instead of navigating to example.com, set the content directly
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Example Domain</title>
      </head>
      <body>
        <h1>Example Domain</h1>
        <p>This is a mock of example.com for testing purposes.</p>
      </body>
      </html>
    `);
  });

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Example Domain/);
});

  });

  test('has heading', async ({ page }) => {
    // Expect heading to be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Example Domain');
  });
});