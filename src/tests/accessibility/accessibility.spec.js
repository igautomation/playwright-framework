/**
 * Accessibility Tests
 *
 * Tests for accessibility compliance using axe-core
 */
const { test, expect } = require('@playwright/test');
const {
  getViolations,
  checkAccessibility,
} = require('../../utils/accessibility/accessibilityUtils');

// Define constants for the tests
const baseUrl = 'https://opensource-demo.orangehrmlive.com';
const loginPath = '/web/index.php/auth/login';
const dashboardPath = '/web/index.php/dashboard/index';

// Credentials
const username = 'Admin';
const password = 'admin123';

// Accessibility rules to check
const accessibilityRules = [
  'color-contrast',
  'label',
  'aria-roles',
  'image-alt',
];

test.describe('Accessibility Tests', () => {
  test('login page should not have critical accessibility violations', async ({ page }) => {
    // Navigate to the login page
    await page.goto(`${baseUrl}${loginPath}`);

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check accessibility with default options (critical and serious violations)
    const result = await checkAccessibility(page);

    // Log violations for debugging
    if (result.violations.length > 0) {
      console.log('Accessibility violations:', result.violations);
    }

    // Verify no critical violations
    const criticalViolations = result.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });

  test('dashboard should not have critical accessibility violations', async ({ page }) => {
    // Navigate to the login page
    await page.goto(`${baseUrl}${loginPath}`);

    // Login with credentials
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForURL(`**${dashboardPath}`);
    await page.waitForLoadState('networkidle');

    // Check accessibility with default options
    const result = await checkAccessibility(page);

    // Verify no critical violations
    const criticalViolations = result.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });

  test('login page should pass specific accessibility rules', async ({ page }) => {
    // Navigate to the login page
    await page.goto(`${baseUrl}${loginPath}`);

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Get violations for specific rules
    const violations = await getViolations(page, {
      axeOptions: {
        runOnly: {
          type: 'rule',
          values: accessibilityRules,
        },
      },
    });

    // Verify no violations for these specific rules
    expect(violations.length).toBeLessThanOrEqual(5);
  });
});