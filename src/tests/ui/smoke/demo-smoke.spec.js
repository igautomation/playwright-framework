// src/tests/ui/smoke/xpath-practice.spec.js

const { test, expect } = require('../../../fixtures/combined.js');

test.describe('@ui @smoke XPath Practice Page UI Tests', () => {
  // Smoke Test: Validate error shown for invalid email submission
  test('Should show validation message when email is missing', async ({
    authenticatedPage,
    retryDiagnostics
  }) => {
    try {
      const baseURL = process.env.BASE_URL || process.env.SELECTORS_HUB_URL;
});

      await authenticatedPage.goto(baseURL);

      await authenticatedPage.fill('input[name="name"]', 'John Doe');
      await authenticatedPage.click('#inp_submit');

      const emailError = await authenticatedPage.textContent('#validation-message');
      expect(emailError).toContain('Please fill out this field');
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Validation message test failed: ' + error.message);
    }
  });

  // Smoke Test: Verify form submission works with valid data
  test('Should submit form successfully with valid inputs', async ({
    authenticatedPage,
    retryDiagnostics
  }) => {
    try {
      const baseURL = process.env.BASE_URL || process.env.SELECTORS_HUB_URL;
      await authenticatedPage.goto(baseURL);

      await authenticatedPage.fill('input[name="name"]', 'John Test');
      await authenticatedPage.fill('input[name="email"]', 'john@example.com');
      await authenticatedPage.fill('input[name=process.env.PASSWORD]', 'Password123');
      await authenticatedPage.fill('input[name="company"]', 'Test Corp');
      await authenticatedPage.click('#inp_submit');

      const confirmation = await authenticatedPage.textContent('.success-msg');
      expect(confirmation).toContain('Thanks');
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Successful form submission test failed: ' + error.message);
    }
  });
});
