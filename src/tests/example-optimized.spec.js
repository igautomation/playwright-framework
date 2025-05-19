// @ts-check
const { test, expect } = require('./fixtures/optimized-fixtures');

/**
 * Example of optimized tests using the new fixtures and configuration
 */

// Setup that runs once before all tests in this file
test.beforeAll(async ({ browser }) => {
  // Create a browser context
  const context = await browser.newContext();
  
  // Create a page and perform login once
  const page = await context.newPage();
  await page.goto('/login');
  await page.fill('input[name="username"]', process.env.USERNAME || 'test-user');
  await page.fill('input[name="password"]', process.env.PASSWORD || 'test-pass');
  await page.click('button[type="submit"]');
  
  // Save the authentication state for reuse in tests
  await page.context().storageState({ path: 'src/tests/auth.json' });
  
  // Close the context
  await context.close();
});

// Fast test using authenticated page fixture
test('fast authenticated test @fast', async ({ authenticatedPage }) => {
  // This test reuses authentication from the fixture
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.locator('h1')).toContainText('Dashboard');
  
  // Perform test actions
  await authenticatedPage.click('text=View Profile');
  await expect(authenticatedPage.locator('.profile-section')).toBeVisible();
});

// API test using API client fixture
test('API data retrieval test @fast', async ({ apiClient }) => {
  // This test uses the shared API client
  const users = await apiClient.get('/users');
  expect(users.length).toBeGreaterThan(0);
  expect(users[0]).toHaveProperty('id');
  expect(users[0]).toHaveProperty('name');
});

// Test using test data fixture
test('data-driven test @fast', async ({ page, testData }) => {
  // This test uses shared test data
  await page.goto('/products');
  
  // Use test data in the test
  for (const product of testData.products || []) {
    await page.fill('input[name="search"]', product.name);
    await page.click('button[type="submit"]');
    await expect(page.locator('.product-item')).toContainText(product.name);
  }
});

// Slow test that will run in a separate group
test('resource intensive operation @slow', async ({ page }) => {
  test.setTimeout(60000); // Longer timeout for slow test
  
  await page.goto('/large-data-table');
  
  // Perform resource intensive operation
  await page.click('button#load-large-dataset');
  await expect(page.locator('.data-row')).toHaveCount(1000);
  
  // Verify data processing
  await page.click('button#process-data');
  await expect(page.locator('#processing-complete')).toBeVisible();
});

// Conditionally skip tests based on browser
test('chromium specific feature test @fast', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'This test only runs on Chromium');
  
  await page.goto('/chrome-features');
  await expect(page.locator('.chrome-only-feature')).toBeVisible();
});