// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Core Test: Basic Page Navigation
 * Demonstrates navigation between pages and basic assertions
 */
test('basic navigation between pages', async ({ page }) => {
  // Navigate to home page
  await page.goto('https://playwright.dev/');
  
  // Verify page title
  await expect(page).toHaveTitle(/Playwright/);
  
  // Click on a navigation link
  await page.getByRole('link', { name: 'Docs' }).click();
  
  // Verify navigation occurred
  await expect(page).toHaveURL(/.*docs/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});