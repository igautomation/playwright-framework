// src/tests/ui/regression/demo-regression.spec.js
require('module-alias/register');
const { test, expect } = require('@fixtures/combined');

test('@regression Demo Regression: Product Search', async ({ page }) => {
  await page.goto('https://automationexercise.com/products');
  await page.fill('input#search_product', 'T-shirt');
  await page.click('button#submit_search');

  await expect(page.locator('.productinfo.text-center')).toContainText(/T-shirt/i);
});
