// @ts-check
const { test, expect } = require('@playwright/test');
const ScreenshotUtils = require('../../utils/web/screenshotUtils');

/**
 * Visual Regression Test Suite
 * 
 * Tests for visual regression using screenshot comparison
 */
test.describe('Visual Regression Tests', () => {
  let screenshotUtils;
  
  test.beforeEach(async ({ page }) => {
    screenshotUtils = new ScreenshotUtils(page, 'reports/visual');
  });
  
  test('homepage visual regression test', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://playwright.dev/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for visual comparison
    await screenshotUtils.takeScreenshot('homepage');
    
    // Compare with baseline if it exists
    if (screenshotUtils.screenshotExists('homepage-baseline')) {
      const diffPath = screenshotUtils.getScreenshotPath('homepage-diff');
      const baselinePath = screenshotUtils.getScreenshotPath('homepage-baseline');
      const currentPath = screenshotUtils.getScreenshotPath('homepage');
      
      const diffPixels = await screenshotUtils.compareScreenshots(
        baselinePath,
        currentPath,
        diffPath
      );
      
      // Allow small differences (0.5% of pixels)
      const maxDiffPixels = page.viewportSize().width * page.viewportSize().height * 0.005;
      expect(diffPixels).toBeLessThanOrEqual(maxDiffPixels);
    } else {
      // Create baseline if it doesn't exist
      const currentPath = screenshotUtils.getScreenshotPath('homepage');
      const baselinePath = screenshotUtils.getScreenshotPath('homepage-baseline');
      
      require('fs').copyFileSync(currentPath, baselinePath);
      console.log('Created baseline screenshot');
    }
  });
  
  test('navbar visual regression test', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://playwright.dev/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the navbar
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Take element screenshot
    await screenshotUtils.takeElementScreenshot('nav', 'navbar');
    
    // Compare with baseline if it exists
    if (screenshotUtils.screenshotExists('navbar-baseline')) {
      const diffPath = screenshotUtils.getScreenshotPath('navbar-diff');
      const baselinePath = screenshotUtils.getScreenshotPath('navbar-baseline');
      const currentPath = screenshotUtils.getScreenshotPath('navbar');
      
      const diffPixels = await screenshotUtils.compareScreenshots(
        baselinePath,
        currentPath,
        diffPath
      );
      
      // Allow small differences (0.5% of pixels)
      const navbarSize = await navbar.boundingBox();
      const maxDiffPixels = navbarSize.width * navbarSize.height * 0.005;
      expect(diffPixels).toBeLessThanOrEqual(maxDiffPixels);
    } else {
      // Create baseline if it doesn't exist
      const currentPath = screenshotUtils.getScreenshotPath('navbar');
      const baselinePath = screenshotUtils.getScreenshotPath('navbar-baseline');
      
      require('fs').copyFileSync(currentPath, baselinePath);
      console.log('Created baseline screenshot');
    }
  });
  
  test('responsive visual regression test', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the page
    await page.goto('https://playwright.dev/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for visual comparison
    await screenshotUtils.takeScreenshot('homepage-mobile');
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Navigate to the page
    await page.goto('https://playwright.dev/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for visual comparison
    await screenshotUtils.takeScreenshot('homepage-tablet');
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Navigate to the page
    await page.goto('https://playwright.dev/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for visual comparison
    await screenshotUtils.takeScreenshot('homepage-desktop');
  });
});