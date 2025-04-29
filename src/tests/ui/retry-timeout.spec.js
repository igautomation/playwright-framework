// src/tests/ui/retry-timeout.spec.js
import { test, expect } from '../../../fixtures/combined.js';
// Configure timeout for all tests
test.describe.configure({ timeout: 30000 });

test('@retry Demo: Retry test with navigation to products page', async ({ page }, testInfo) => {
  await page.goto('https://automationexercise.com/products');
  await expect(page.locator('h2.title.text-center')).toHaveText(/all products/i, { timeout: 10000 });

  console.log(`Retry attempt number: ${testInfo.retry}`);
});

test('@timeout Demo: Slow test with extended expect timeout', async ({ page }) => {
  test.slow();
  await page.goto('https://automationexercise.com/products');
  await expect(page.locator('h2.title.text-center')).toContainText(/all products/i, { timeout: 15000 });
});
