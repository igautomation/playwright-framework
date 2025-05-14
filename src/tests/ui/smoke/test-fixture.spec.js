// src/tests/ui/smoke/test-fixture.spec.js

const { test, expect } = require('../../../fixtures/combined.js');

test.describe('@ui @smoke Test Fixture Verification', () => {
  test('Should verify authenticatedPage fixture is working', async ({
    authenticatedPage,
    retryDiagnostics
  }) => {
    try {
      // Navigate to a page
      await authenticatedPage.goto('https://automationexercise.com/products');
      
      // Verify the page title
      const title = await authenticatedPage.title();
      expect(title).toContain('Automation Exercise');
      
      console.log('Test passed: authenticatedPage fixture is working');
    } catch (error) {
      await retryDiagnostics(error);
      throw error;
    }
  });
});