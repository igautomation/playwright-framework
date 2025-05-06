/**
 * Accessibility tests using the AccessibilityUtils
 */
const { test, expect } = require('@playwright/test');
const AccessibilityUtils = require('../../utils/accessibility/accessibilityUtils');

test.describe('Accessibility Tests @accessibility', () => {
  let accessibilityUtils;
  
  test.beforeEach(async ({ page }) => {
    accessibilityUtils = new AccessibilityUtils(page, {
      outputDir: './reports/accessibility'
    });
  });
  
  test('Homepage accessibility audit', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Run accessibility audit
    const result = await accessibilityUtils.audit({
      screenshot: true,
      reportPath: './reports/accessibility/homepage-audit.html'
    });
    
    // Log the results
    console.log(`Accessibility issues found: ${result.issues.length}`);
    console.log(`Critical issues: ${result.severityCounts.critical}`);
    console.log(`Serious issues: ${result.severityCounts.serious}`);
    
    // Assert on accessibility issues
    expect(result.severityCounts.critical).toBe(0, 'Should have no critical accessibility issues');
    expect(result.severityCounts.serious).toBe(0, 'Should have no serious accessibility issues');
  });
  
  test('Form accessibility audit', async ({ page }) => {
    // Navigate to a page with a form
    await page.goto('https://example.com/contact');
    
    // Wait for the form to be visible
    await page.waitForSelector('form', { state: 'visible' });
    
    // Run accessibility audit on the form
    const result = await accessibilityUtils.checkElement('form', {
      screenshot: true
    });
    
    // Log the results
    console.log(`Form accessibility issues found: ${result.issues.length}`);
    
    // Assert on accessibility issues
    expect(result.issues.length).toBe(0, 'Form should have no accessibility issues');
  });
  
  test('Navigation accessibility audit', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the navigation to be visible
    await page.waitForSelector('nav', { state: 'visible' });
    
    // Run accessibility audit on the navigation
    const result = await accessibilityUtils.checkElement('nav', {
      screenshot: true
    });
    
    // Log the results
    console.log(`Navigation accessibility issues found: ${result.issues.length}`);
    
    // Check for specific issues
    const missingAriaLabels = result.issues.filter(issue => 
      issue.type === 'link-name' || issue.type === 'button-name'
    );
    
    // Assert on accessibility issues
    expect(missingAriaLabels.length).toBe(0, 'Navigation links and buttons should have accessible names');
  });
  
  test('Image accessibility audit', async ({ page }) => {
    // Navigate to a page with images
    await page.goto('https://example.com/gallery');
    
    // Wait for images to be visible
    await page.waitForSelector('img', { state: 'visible' });
    
    // Run accessibility audit
    const result = await accessibilityUtils.audit({
      screenshot: true
    });
    
    // Filter for image-related issues
    const imageIssues = result.issues.filter(issue => issue.type === 'image-alt');
    
    // Log the results
    console.log(`Image accessibility issues found: ${imageIssues.length}`);
    
    // Assert on accessibility issues
    expect(imageIssues.length).toBe(0, 'All images should have alt text');
  });
  
  test('Color contrast accessibility audit', async ({ page }) => {
    // Navigate to the page
    await page.goto('https://example.com');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Run accessibility audit
    const result = await accessibilityUtils.audit({
      screenshot: true
    });
    
    // Filter for contrast-related issues
    const contrastIssues = result.issues.filter(issue => issue.type === 'low-contrast');
    
    // Log the results
    console.log(`Contrast accessibility issues found: ${contrastIssues.length}`);
    
    // Assert on accessibility issues
    expect(contrastIssues.length).toBe(0, 'All text should have sufficient color contrast');
  });
});