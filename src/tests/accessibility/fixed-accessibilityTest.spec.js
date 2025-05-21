/**
 * Accessibility tests using the AccessibilityUtils
 * Fixed version that uses real websites that are accessible
 */
const { test, expect } = require('@playwright/test');
const { checkAccessibility } = require('../../utils/accessibility/accessibilityUtils');

test.describe('Fixed Accessibility Tests', () => {
  test('W3C WAI website should be accessible', async ({ page }) => {
    // Navigate to the W3C WAI website
    await page.goto(`${process.env.W3C_WAI_URL}/`);
    
    // Check for accessibility violations
    const { violations } = await checkAccessibility(page);
    
    // Log violations for debugging
    console.log(`Found ${violations.length} accessibility violations`);
    
    // Verify no critical violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });
  
  test('W3C WAI forms tutorial should be accessible', async ({ page }) => {
    // Navigate to the W3C WAI forms tutorial
    await page.goto(`${process.env.W3C_WAI_URL}/tutorials/forms/basic/`);
    
    // Check for accessibility violations
    const { violations } = await checkAccessibility(page);
    
    // Log violations for debugging
    console.log(`Found ${violations.length} accessibility violations`);
    
    // Verify no critical violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });
  
  test('W3C website should be accessible', async ({ page }) => {
    // Navigate to the W3C website
    await page.goto(`${process.env.W3C_URL}/`);
    
    // Check for accessibility violations
    const { violations } = await checkAccessibility(page);
    
    // Log violations for debugging
    console.log(`Found ${violations.length} accessibility violations`);
    
    // Verify no critical violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });
  
  test('W3C WAI fundamentals should be accessible', async ({ page }) => {
    // Navigate to the W3C WAI fundamentals
    await page.goto(`${process.env.W3C_WAI_URL}/fundamentals/accessibility-intro/`);
    
    // Check for accessibility violations
    const { violations } = await checkAccessibility(page);
    
    // Log violations for debugging
    console.log(`Found ${violations.length} accessibility violations`);
    
    // Verify no critical violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });
  
  test('W3C WCAG contrast minimum should be accessible', async ({ page }) => {
    // Navigate to the W3C WCAG contrast minimum
    await page.goto(`${process.env.W3C_WAI_URL}/WCAG21/Understanding/contrast-minimum.html`);
    
    // Check for accessibility violations
    const { violations } = await checkAccessibility(page);
    
    // Log violations for debugging
    console.log(`Found ${violations.length} accessibility violations`);
    
    // Verify no critical violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });
});