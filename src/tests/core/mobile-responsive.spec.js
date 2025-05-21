// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Mobile Responsive', () => {

/**
 * Core Test: Mobile Responsiveness
 * Demonstrates testing responsive design across different device sizes
 */

// Test on mobile viewport
test('responsive design on mobile', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 });
});

  // Navigate to the page
  await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
  
  // Verify mobile navigation is visible (hamburger menu)
  const mobileNav = page.locator('button.navbar__toggle');
  await expect(mobileNav).toBeVisible();
  
  // Open mobile menu
  await mobileNav.click();
  
  // Verify menu items are now visible
  await expect(page.locator('.navbar__items--show')).toBeVisible();
  
  // Take a screenshot for visual verification
  await page.screenshot({ path: 'mobile-view.png' });
});

// Test on tablet viewport
test('responsive design on tablet', async ({ page }) => {
  // Set viewport to tablet size
  await page.setViewportSize({ width: 768, height: 1024 });
  
  // Navigate to the page
  await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
  
  // Verify tablet-specific elements
  // This will depend on the specific site being tested
  
  // Take a screenshot for visual verification
  await page.screenshot({ path: 'tablet-view.png' });
});

// Test on desktop viewport
test('responsive design on desktop', async ({ page }) => {
  // Set viewport to desktop size
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Navigate to the page
  await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
  
  // Verify desktop navigation is visible
  const desktopNav = page.locator('nav.navbar');
  await expect(desktopNav).toBeVisible();
  
  // Verify desktop-specific elements
  await expect(page.locator('.navbar__items')).toBeVisible();
  
  // Take a screenshot for visual verification
  await page.screenshot({ path: 'desktop-view.png' });
});
});
