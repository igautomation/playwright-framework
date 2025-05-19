// @ts-check
const { test, expect } = require('@playwright/test');
const { checkAccessibility, generateAccessibilityReport } = require('../../utils/accessibility/accessibilityUtils');

/**
 * Accessibility Test Suite
 * 
 * Tests for accessibility compliance
 */
test.describe('Accessibility Tests', () => {
  test('homepage should not have critical accessibility violations', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://playwright.dev/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check accessibility
    const result = await checkAccessibility(page, {
      includedImpacts: ['critical', 'serious']
    });
    
    // Generate report for reference
    await generateAccessibilityReport(page, 'reports/accessibility/homepage.json');
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'reports/accessibility/homepage.png' });
    
    // Verify no critical violations
    expect(result.passes).toBeTruthy();
    
    // If there are violations, log them for debugging
    if (!result.passes) {
      console.log('Accessibility violations:', JSON.stringify(result.violations, null, 2));
    }
  });
  
  test('docs page should not have critical accessibility violations', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://playwright.dev/docs/intro');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check accessibility
    const result = await checkAccessibility(page, {
      includedImpacts: ['critical', 'serious']
    });
    
    // Generate report for reference
    await generateAccessibilityReport(page, 'reports/accessibility/docs.json');
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'reports/accessibility/docs.png' });
    
    // Verify no critical violations
    expect(result.passes).toBeTruthy();
    
    // If there are violations, log them for debugging
    if (!result.passes) {
      console.log('Accessibility violations:', JSON.stringify(result.violations, null, 2));
    }
  });
  
  test('form elements should be accessible', async ({ page }) => {
    // Navigate to a page with forms
    await page.goto('https://demo.playwright.dev/todomvc/#/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Add a todo to create form interaction
    await page.getByPlaceholder('What needs to be done?').fill('Test accessibility');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // Check accessibility
    const result = await checkAccessibility(page, {
      includedImpacts: ['critical', 'serious']
    });
    
    // Generate report for reference
    await generateAccessibilityReport(page, 'reports/accessibility/form.json');
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'reports/accessibility/form.png' });
    
    // Verify no critical violations
    expect(result.passes).toBeTruthy();
    
    // If there are violations, log them for debugging
    if (!result.passes) {
      console.log('Accessibility violations:', JSON.stringify(result.violations, null, 2));
    }
  });
});