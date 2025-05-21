// @ts-check
const { test, expect } = require('./fixtures/optimized-fixtures');

/**
 * Example of optimized tests using the new fixtures and configuration
 */

test.describe('Example Optimized', () => {
  // Setup that runs once before all tests in this file
  test.beforeAll(async ({ browser }) => {
    // Create a browser context
    const context = await browser.newContext();
    // Do any setup needed
  });

  // Setup that runs before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to the starting URL
    await page.goto(process.env.BASE_URL);
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should have the correct title', async ({ page }) => {
    // Check the page title
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('should navigate to docs page', async ({ page }) => {
    // Click the docs link
    await page.click('text=Docs');
    
    // Wait for navigation to complete
    await page.waitForURL(/.*docs/);
    
    // Verify we're on the docs page
    await expect(page).toHaveTitle(/Docs/);
  });

  test('should handle async operations properly', async ({ page }) => {
    // Click a button that triggers an async operation
    await page.click('#async-button');
    
    // Wait for the operation to complete
    await page.waitForSelector('#operation-complete', { state: 'visible' });
    
    // Verify the operation completed successfully
    await expect(page.locator('#operation-complete')).toBeVisible();
  });

  // Teardown that runs after each test
  test.afterEach(async ({ page }) => {
    // Clean up any resources
  });

  // Teardown that runs once after all tests in this file
  test.afterAll(async ({ browser }) => {
    // Close the browser
    await browser.close();
  });
});