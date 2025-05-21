/**
 * Visual Regression Tests
 * 
 * Comprehensive test suite for visual regression testing
 */
const { test, expect } = require('@playwright/test');
const ScreenshotUtils = require('../../utils/web/screenshotUtils');
const VisualComparisonUtils = require('../../utils/visual/visualComparisonUtils');

test.describe('Basic Visual Tests', () => {
  test('should take and compare screenshots', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
    
    // Take a screenshot
    const screenshotPath = './screenshots/homepage.png';
    await page.screenshot({ path: screenshotPath });
    
    // Verify screenshot was taken
    const fs = require('fs');
    expect(fs.existsSync(screenshotPath)).toBeTruthy();
  });
  
  test('should detect visual changes', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
    
    // Initialize screenshot utils
    const screenshotUtils = new ScreenshotUtils(page);
    
    // Take a screenshot
    const screenshotPath = await screenshotUtils.takeScreenshot('homepage');
    
    // Verify screenshot was taken
    const fs = require('fs');
    expect(fs.existsSync(screenshotPath)).toBeTruthy();
    
    // Compare with baseline (this will pass on first run as it creates the baseline)
    const comparison = await screenshotUtils.compareWithBaseline('homepage');
    expect(comparison.matches || comparison.isNew).toBeTruthy();
  });
});

test.describe('Advanced Visual Tests', () => {
  test('should compare specific elements', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
    
    // Initialize visual comparison utils
    const visualUtils = new VisualComparisonUtils(page);
    
    // Compare specific element
    const headerComparison = await visualUtils.compareElement('header', 'header');
    expect(headerComparison.matches || headerComparison.isNew).toBeTruthy();
  });
});