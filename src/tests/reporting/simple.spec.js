/**
 * Simple test to verify the test runner is working
 */
const { test, expect } = require('@playwright/test');

test.describe('Simple Test', () => {
  test('should pass', async () => {
    expect(1 + 1).toBe(2);
  });
});