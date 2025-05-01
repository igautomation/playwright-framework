// src/tests/ui/smoke/xpath-practice.spec.js

// Import Playwright test object and expect from custom fixtures
import { test, expect } from '../../../../fixtures/combined.js';

// Define the smoke test for the XPath Practice Page
test.describe('XPath Practice Page UI Smoke Tests', () => {
  // Test: Verify form field interaction and validation messages
  test('Submit form with invalid email and verify validation', async ({
    authenticatedPage,
    retryDiagnostics
  }, testInfo) => {
    try {
      // Navigate to the practice page
      await authenticatedPage.goto('https://selectorshub.com/xpath-practice-page/');

      // Fill in 'Name' field with dummy data
      await authenticatedPage.fill('input[name="name"]', 'John Doe');

      // Leave email field blank and submit
      await authenticatedPage.click('#inp_submit');

      // Verify validation message is shown for email
      const emailError = await authenticatedPage.textContent('#validation-message');
      expect(emailError).toContain('Please fill out this field');
    } catch (error) {
      // Handle failure with retry logic
      await retryDiagnostics(error);
      throw new Error('XPath Practice Page form validation test failed: ' + error.message);
    }
  });

  // Test: Fill form and submit with valid data
  test('Fill all fields and submit the form successfully', async ({
    authenticatedPage,
    retryDiagnostics
  }, testInfo) => {
    try {
      // Go to the XPath practice page
      await authenticatedPage.goto('https://selectorshub.com/xpath-practice-page/');

      // Fill in the form fields with valid test data
      await authenticatedPage.fill('input[name="name"]', 'John Test');
      await authenticatedPage.fill('input[name="email"]', 'john@example.com');
      await authenticatedPage.fill('input[name="password"]', 'Password123');
      await authenticatedPage.fill('input[name="company"]', 'Test Corp');

      // Submit the form
      await authenticatedPage.click('#inp_submit');

      // Optional: Wait for a response or confirmation message
      const confirmation = await authenticatedPage.textContent('.success-msg');
      expect(confirmation).toContain('Thanks');
    } catch (error) {
      // Retry and report on failure
      await retryDiagnostics(error);
      throw new Error('XPath Practice Page valid submission failed: ' + error.message);
    }
  });
});
