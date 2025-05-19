// @ts-check
const { test, expect } = require('@playwright/test');
const { getViolations } = require('../../utils/accessibility/accessibilityUtils');

/**
 * Core Test: Accessibility
 * Demonstrates accessibility testing capabilities
 */
test('page accessibility validation', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://playwright.dev/');
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Inject axe-core (assuming accessibilityUtils handles this)
  const violations = await getViolations(page);
  
  // Log violations for reporting
  console.log(`Found ${violations.length} accessibility violations`);
  
  // Optional: Take a screenshot for the report
  await page.screenshot({ path: 'accessibility-test.png' });
  
  // Verify no critical accessibility issues
  const criticalViolations = violations.filter(v => v.impact === 'critical');
  expect(criticalViolations.length).toBe(0);
});