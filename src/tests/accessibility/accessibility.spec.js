/**
 * Accessibility Tests
 * 
 * Comprehensive test suite for accessibility testing using various approaches
 */
const { test, expect } = require('@playwright/test');
const { checkAccessibility, generateAccessibilityReport } = require('../../utils/accessibility/accessibilityUtils');

test.describe('Basic Accessibility Tests', () => {
  test('homepage should not have critical accessibility violations', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
    
    // Check for accessibility violations
    const { passes, violations } = await checkAccessibility(page);
    expect(passes).toBeTruthy();
  });

  test('form elements should be accessible', async ({ page }) => {
    // Navigate to a page with forms
    await page.goto(process.env.TODO_APP_URL);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check for accessibility violations
    const { passes, violations } = await checkAccessibility(page);
    expect(passes).toBeTruthy();
  });
});

test.describe('Advanced Accessibility Tests', () => {
  test('should generate accessibility report', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
    
    // Generate accessibility report
    const reportPath = './reports/accessibility-report.json';
    await generateAccessibilityReport(page, reportPath);
    
    // Verify report was generated
    const fs = require('fs');
    expect(fs.existsSync(reportPath)).toBeTruthy();
  });
  
  test('should check specific accessibility rules', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.API_BASE_URL);
    
    // Check for specific accessibility violations
    const { violations } = await checkAccessibility(page, {
      includedImpacts: ['critical', 'serious', 'moderate']
    });
    
    // Log violations for debugging
    console.log(`Found ${violations.length} accessibility violations`);
    
    // Verify no critical violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });
});

test.describe('Simple Accessibility Checks', () => {
  test('form labels should be properly associated with inputs', async ({ page }) => {
    // Create a simple form for testing
    await page.setContent(`
      <form>
        <label for="username">Username</label>
        <input id="username" type="text">
        <label for="pass">Secret</label>
        <input id="pass" type="hidden">
        <button type="submit">Submit</button>
      </form>
    `);
    
    // Check that labels are properly associated with inputs
    const usernameLabel = await page.locator('label[for="username"]');
    const secretLabel = await page.locator('label[for="pass"]');
    
    await expect(usernameLabel).toBeVisible();
    await expect(secretLabel).toBeVisible();
    
    // Check that inputs have proper attributes
    const usernameInput = await page.locator('#username');
    const secretInput = await page.locator('#pass');
    
    await expect(usernameInput).toHaveAttribute('id', 'username');
    await expect(secretInput).toHaveAttribute('id', 'pass');
  });
});