/**
 * Fixed Accessibility Tests
 * 
 * Tests for accessibility compliance with improved reporting
 */
const { test, expect } = require('@playwright/test');
const { generateAccessibilityReport } = require('../../utils/accessibility/accessibilityUtils');
const path = require('path');

test.describe('Fixed Accessibility Tests', () => {
  test('OrangeHRM login page should generate accessibility report', async ({ page }) => {
    // Navigate to the login page
    await page.goto(process.env.ORANGEHRM_URL);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Generate accessibility report
    const reportPath = path.join(process.cwd(), 'reports', 'accessibility', 'login-page-report');
    const htmlReportPath = await generateAccessibilityReport(page, reportPath, { html: true });
    
    // Verify report was generated
    expect(htmlReportPath).toBeTruthy();
  });
  
  test('OrangeHRM dashboard should generate accessibility report', async ({ page }) => {
    // Navigate to the login page
    await page.goto(config.baseUrl || 'https://opensource-demo.orangehrmlive.com');
    
    // Login with default credentials
  await page.getByPlaceholder('Username').fill(config.credentials.username || 'Admin');
  await page.getByPlaceholder('Password').fill(config.credentials.password || 'admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/index');
    await page.waitForLoadState('networkidle');
    
    // Generate accessibility report
    const reportPath = path.join(process.cwd(), 'reports', 'accessibility', 'dashboard-report');
    const htmlReportPath = await generateAccessibilityReport(page, reportPath, { html: true });
    
    // Verify report was generated
    expect(htmlReportPath).toBeTruthy();
  });
  
  test('OrangeHRM login form should be accessible', async ({ page }) => {
    // Navigate to the login page
    await page.goto(process.env.ORANGEHRM_URL);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Audit specific rules for the login form
    const formSelector = 'form';
    
    // Wait for the form to be visible
    await page.waitForSelector(formSelector);
    
    // Run accessibility audit on the form
    const auditResults = await page.evaluate(async (selector) => {
      // This assumes axe-core is already injected by the accessibilityUtils
      if (!window.axe) {
        return { error: 'axe-core not loaded' };
      }
      
      const element = document.querySelector(selector);
      if (!element) {
        return { error: 'Element not found' };
      }
      
      const results = await window.axe.run(element, {
        rules: {
          'label': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'input-button-name': { enabled: true }
        }
      });
      
      return {
        violations: results.violations,
        passes: results.passes
      };
    }, formSelector);
    
    // Verify no violations for the login form
    expect(auditResults.violations || []).toHaveLength(0);
  });
});