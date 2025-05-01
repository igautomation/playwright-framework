// src/tests/ui/regression/demo-regression.spec.js

import { test, expect } from '@fixtures/combined.js';

// UI Regression Tests: Simulates a basic product search flow
test.describe('@ui @regression Product Search Regression Suite', () => {
  test('@ui @regression Product Search should return results for query', async ({
    authenticatedPage,
    retryDiagnostics
  }) => {
    try {
      // Resolve base URL from environment or fallback default
      const baseURL = process.env.BASE_URL || 'https://automationexercise.com';

      // Navigate to the product listing page
      await authenticatedPage.goto(`${baseURL}/products`);

      // Fill in the product search box
      await authenticatedPage.fill('input#search_product', 'T-shirt');

      // Trigger the search
      await authenticatedPage.click('button#submit_search');

      // Assert that results contain the search keyword
      await expect(authenticatedPage.locator('.features_items')).toContainText(/T-shirt/i);
    } catch (error) {
      // Capture screenshot and trace for retry diagnostics
      await retryDiagnostics(error);
      throw new Error('Product Search failed: ' + error.message);
    }
  });
});
