const { test, expect } = require('@playwright/test');

/**
 * Example test suite to demonstrate test verification
 */
test.describe('Example test suite', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
  });

  test.afterEach(async ({ page }) => {
    // Teardown code
  });

  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test
    await page.goto('https://playwright.dev/', { timeout: 60000 });
  });

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('get started link', async ({ page }) => {
    // Click the get started link.
    await page.getByRole('link', { name: 'Get started' }).click();
    
    // Expects page to have a heading with the name of Installation.
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });
  
  test('has correct API link', async ({ page }) => {
    // Click the API link.
    await page.getByRole('link', { name: 'API', exact: true }).click();
    
    // Expect the URL to contain api.
    await expect(page).toHaveURL(/.*api/);
  });
  
  test('has proper documentation structure', async ({ page }) => {
    // Go directly to the docs page instead of clicking
    await page.goto('https://playwright.dev/docs/intro', { timeout: 60000 });
    
    // Check that the sidebar is visible - updated selector for new Playwright docs
    await expect(page.locator('.theme-doc-sidebar-container')).toBeVisible();
    
    // Check that the search button is available instead of direct search box
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });
});