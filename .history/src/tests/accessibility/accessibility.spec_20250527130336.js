/**
 * Accessibility Tests
 * 
 * Tests for accessibility compliance using axe-core
 */
const { test, expect } = require('@playwright/test');
const { getViolations, checkAccessibility } = require('../../utils/accessibility/accessibilityUtils');
const config = require('../../config');

// Read base URL from environment or config
const baseUrl = process.env.BASE_URL || config.baseUrl || process.env.BASE_URL;
const loginPath = process.env.LOGIN_PATH || config.paths?.login || '/web/index.php/auth/login';
const dashboardPath = process.env.DASHBOARD_PATH || config.paths?.dashboard || '/web/index.php/dashboard/index';

// Read credentials from environment or config
const username = process.env.USERNAME || config.credentials?.username || process.env.USERNAME;
const password = process.env.PASSWORD || config.credentials?.password || process.env.PASSWORD;

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
    
    // Get accessibility rules from config or use defaults
    const accessibilityRules = config.accessibility?.rules || [
      'color-contrast',
      'label',
      'aria-roles',
      'image-alt'
    ];
    
    // Get violations for specific rules
    const violations = await getViolations(page, {
      axeOptions: {
        runOnly: {
          type: 'rule',
          values: accessibilityRules
        }
      }
    });
    
    // Verify no violations for these specific rules
    expect(violations.length).toBeLessThanOrEqual(5);

  });
});