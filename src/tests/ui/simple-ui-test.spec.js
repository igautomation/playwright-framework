/**
 * Simple UI test for Playwright Framework
 * 
 * This test demonstrates basic UI testing capabilities
 */
const { test, expect } = require('@playwright/test');

test.describe('Simple UI Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Playwright website before each test
    await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
  });

  test('should have the correct title', async ({ page }) => {
    // Verify the page title contains "Playwright"
    await expect(page).toHaveTitle(/Playwright/);
});

  });

  test('should navigate to the getting started page', async ({ page }) => {
    // Click the "Get started" link in the navigation
    await page.getByRole('link', { name: 'Get started' }).click();
    
    // Verify we're on the getting started page
    await expect(page).toHaveURL(/.*docs\/intro/);
  });

  test('should display documentation content', async ({ page }) => {
    // Navigate to the docs page directly
    await page.goto(`${process.env.PLAYWRIGHT_DOCS_URL}docs'https:/`/intro');
    
    // Verify the page contains content
    await expect(page.locator('main')).toBeVisible();
  });
});