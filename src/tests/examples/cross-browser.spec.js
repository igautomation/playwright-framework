// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Example Test: Cross-Browser Compatibility
 * Demonstrates testing across different browsers
 */

// Test that runs on all browsers
test('basic functionality works across browsers', async ({ page, browserName }) => {
  // Log which browser we're testing on
  console.log(`Running on ${browserName}`);
  
  // Navigate to the page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Add a todo
  await page.getByPlaceholder('What needs to be done?').fill('Cross-browser task');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Verify the todo was added (should work on all browsers)
  await expect(page.getByTestId('todo-item')).toHaveText('Cross-browser task');
  
  // Take a browser-specific screenshot
  await page.screenshot({ path: `todo-${browserName}.png` });
});

// Test for Chromium-specific features
test('Chromium-specific feature test', async ({ page, browserName }) => {
  // Skip test if not running on Chromium
  test.skip(browserName !== 'chromium', 'This test only runs on Chromium');
  
  // Navigate to the page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Test Chrome-specific feature (for demonstration)
  // In a real test, you would test actual Chrome-specific features
  console.log('Testing Chromium-specific feature');
  
  // Example: Use Chrome DevTools Protocol (CDP) which is Chromium-specific
  if (browserName === 'chromium') {
    const client = await page.context().newCDPSession(page);
    const version = await client.send('Browser.getVersion');
    console.log('Chrome version:', version.product);
  }
});

// Test for Firefox-specific features
test('Firefox-specific feature test', async ({ page, browserName }) => {
  // Skip test if not running on Firefox
  test.skip(browserName !== 'firefox', 'This test only runs on Firefox');
  
  // Navigate to the page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Test Firefox-specific feature (for demonstration)
  console.log('Testing Firefox-specific feature');
});

// Test for WebKit-specific features
test('WebKit-specific feature test', async ({ page, browserName }) => {
  // Skip test if not running on WebKit
  test.skip(browserName !== 'webkit', 'This test only runs on WebKit');
  
  // Navigate to the page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Test WebKit-specific feature (for demonstration)
  console.log('Testing WebKit-specific feature');
});

// Test that handles browser differences
test('handle browser-specific behavior', async ({ page, browserName }) => {
  // Navigate to the page
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  // Add a todo
  await page.getByPlaceholder('What needs to be done?').fill('Browser-specific task');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Handle browser-specific behavior (for demonstration)
  if (browserName === 'webkit') {
    // WebKit-specific handling
    console.log('Applying WebKit-specific handling');
  } else if (browserName === 'firefox') {
    // Firefox-specific handling
    console.log('Applying Firefox-specific handling');
  } else {
    // Chromium-specific handling
    console.log('Applying Chromium-specific handling');
  }
  
  // Verify the todo was added (common assertion)
  await expect(page.getByTestId('todo-item')).toHaveText('Browser-specific task');
});