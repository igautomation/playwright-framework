// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Core Test: Visual Regression
 * Demonstrates visual comparison capabilities
 */
test('visual comparison of page elements', async ({ page }) => {
  // Navigate to a stable page
  await page.goto('https://playwright.dev/');
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot of a specific element
  const navbar = page.locator('nav');
  await expect(navbar).toBeVisible();
  
  // Take screenshot for visual comparison
  const screenshot = await navbar.screenshot();
  
  // Compare with a baseline (first run will create the baseline)
  // This uses Playwright's built-in screenshot comparison
  expect(screenshot).toMatchSnapshot('navbar.png');
  
  // Take a full page screenshot
  await page.screenshot({ path: 'visual-regression-full-page.png', fullPage: true });
});