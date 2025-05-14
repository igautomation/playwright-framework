// src/tests/ui/retry-timeout.spec.js

const { test, expect } = require('../../../fixtures/combined.js');

// Configure test suite-level timeout for all tests (30s)
test.describe.configure({ timeout: 30000 });

test.describe('@ui Retry and Timeout Demo Tests', () => {
  // Retry logic test with conditional assertion and retry annotation logging
  test('@retry Should retry on product page header text mismatch', async ({
    authenticatedPage,
    retryDiagnostics
  }, testInfo) => {
    try {
      const baseURL = process.env.BASE_URL || 'https://automationexercise.com';
      await authenticatedPage.goto(`${baseURL}/products`);

      await expect(authenticatedPage.locator('h2.title.text-center')).toHaveText(/all products/i, {
        timeout: 10000
      });

      // Log retry attempt as annotation
      await retryDiagnostics(`Retry attempt: ${testInfo.retry}`);
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error(`Retry test failed: ${error.message}`);
    }
  });

  // Timeout test with `test.slow()` and extended expect wait
  test('@timeout Should handle slow UI interaction with extended timeout', async ({
    authenticatedPage,
    retryDiagnostics
  }) => {
    try {
      test.slow(); // Marks the test as intentionally slow for reporting

      const baseURL = process.env.BASE_URL || 'https://automationexercise.com';
      await authenticatedPage.goto(`${baseURL}/products`);

      // Simulate a slow verification to test extended timeout
      await expect(authenticatedPage.locator('h2.title.text-center')).toContainText(
        /all products/i,
        { timeout: 15000 }
      );
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error(`Timeout test failed: ${error.message}`);
    }
  });
});
