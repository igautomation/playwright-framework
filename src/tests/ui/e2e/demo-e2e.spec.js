// src/tests/ui/e2e/demo-e2e.spec.js
require('module-alias/register');
const { test, expect } = require('@fixtures/combined');

test('@e2e Demo E2E: Navigate and verify', async ({ page }) => {
  await page.goto('https://automationexercise.com/');
  await page.click('a[href="/products"]');
  await expect(page).toHaveURL(/.*products/);
  await expect(page.locator('h2.title.text-center')).toContainText('All Products');
});
