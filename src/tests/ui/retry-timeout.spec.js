// src/tests/ui/retry-timeout.spec.js
import { test, expect } from '../../fixtures/combined.js';

// Configure timeout for all tests
test.describe.configure({ timeout: 30000 });

test.describe('Retry and Timeout Tests', () => {
  test.describe('Retry Tests', () => {
    test('@retry Demo: Retry test with navigation to products page', async ({
      authenticatedPage,
      retryDiagnostics,
    }, testInfo) => {
      try {
        const baseURL = process.env.BASE_URL || 'https://automationexercise.com';
        await authenticatedPage.goto(`${baseURL}/products`);
        await expect(authenticatedPage.locator('h2.title.text-center')).toHaveText(
          /all products/i,
          { timeout: 10000 }
        );
        await retryDiagnostics(`Retry attempt number: ${testInfo.retry}`);
      } catch (error) {
        await retryDiagnostics(error);
        throw error;
      }
    });
  });

  test.describe('Timeout Tests', () => {
    test('@timeout Demo: Slow test with extended expect timeout', async ({
      authenticatedPage,
      retryDiagnostics,
    }) => {
      try {
        test.slow();
        const baseURL = process.env.BASE_URL || 'https://automationexercise.com';
        await authenticatedPage.goto(`${baseURL}/products`);
        await expect(authenticatedPage.locator('h2.title.text-center')).toContainText(
          /all products/i,
          { timeout: 15000 }
        );
      } catch (error) {
        await retryDiagnostics(error);
        throw error;
      }
    });
  });
});
