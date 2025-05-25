/**
 * Tests for performance utilities
 */
const { test, expect } = require('@playwright/test');
const { 
  measurePageLoad, 
  measureResources, 
  generateReport 
} = require('../../src/utils/performance/performanceUtils');
const fs = require('fs');
const path = require('path');

test.describe('Performance Utilities', () => {
  test('should measure page load performance', async ({ page }) => {
    // Navigate to a test page
    await page.goto('https://playwright.dev', { waitUntil: 'networkidle' });
    
    // Measure page load performance
    const metrics = await measurePageLoad(page);
    
    // Verify metrics structure
    expect(metrics).toBeDefined();
    expect(metrics.navigationTiming).toBeDefined();
    expect(metrics.measureTiming).toBeDefined();
    expect(metrics.measureTiming.duration).toBeGreaterThan(0);
  });
  
  test('should measure resource performance', async ({ page }) => {
    // Navigate to a test page
    await page.goto('https://playwright.dev', { waitUntil: 'networkidle' });
    
    // Measure resource performance
    const metrics = await measureResources(page);
    
    // Verify metrics structure
    expect(metrics).toBeDefined();
    expect(metrics.resourceCount).toBeGreaterThan(0);
    expect(metrics.totalSize).toBeGreaterThan(0);
    expect(metrics.resourcesByType).toBeDefined();
  });
  
  test('should generate performance report', async ({ page }) => {
    // Navigate to a test page
    await page.goto('https://playwright.dev', { waitUntil: 'networkidle' });
    
    // Create test data
    const pageLoad = await measurePageLoad(page);
    const resources = await measureResources(page);
    
    const metrics = {
      url: page.url(),
      timestamp: new Date().toISOString(),
      pageLoad,
      resources
    };
    
    // Generate report
    const reportDir = path.join(process.cwd(), 'reports/test');
    const reportPath = path.join(reportDir, 'test-report.html');
    
    // Ensure directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Generate report
    generateReport(metrics, reportPath);
    
    // Verify report was created
    expect(fs.existsSync(reportPath)).toBe(true);
    
    // Clean up
    fs.unlinkSync(reportPath);
  });
});