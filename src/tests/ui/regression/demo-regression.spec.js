// src/tests/ui/regression/demo-regression.spec.js
import { test, expect } from '../../fixtures/combined.js';

test('@regression Demo Regression: Product Search', async ({ page }) => {
  await page.goto('https://automationexercise.com/products');
  await page.fill('input#search_product', 'T-shirt');
  await page.click('button#submit_search');

  await expect(page.locator('.features_items')).toContainText(/T-shirt/i);
});
