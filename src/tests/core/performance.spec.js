// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Core Test: Performance Benchmarking
 * Demonstrates performance testing capabilities
 */
test('page load performance', async ({ page }) => {
  // Start performance measurement
  await page.evaluate(() => window.performance.mark('start'));
  
  // Navigate to the page
  await page.goto('https://playwright.dev/');
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // End performance measurement
  const metrics = await page.evaluate(() => {
    window.performance.mark('end');
    window.performance.measure('pageLoad', 'start', 'end');
    
    // Get all performance entries
    const performanceEntries = window.performance.getEntriesByType('navigation');
    const measureEntries = window.performance.getEntriesByName('pageLoad');
    
    return {
      navigationTiming: performanceEntries.length > 0 ? performanceEntries[0] : null,
      measureTiming: measureEntries.length > 0 ? measureEntries[0] : null,
      // Get other Web Vitals metrics
      firstPaint: window.performance.getEntriesByName('first-paint')[0],
      firstContentfulPaint: window.performance.getEntriesByName('first-contentful-paint')[0]
    };
  });
  
  // Log performance metrics
  console.log('Page Load Time:', metrics.measureTiming?.duration, 'ms');
  console.log('First Paint:', metrics.firstPaint?.startTime, 'ms');
  console.log('First Contentful Paint:', metrics.firstContentfulPaint?.startTime, 'ms');
  
  // Verify performance is within acceptable thresholds
  expect(metrics.measureTiming?.duration).toBeLessThan(5000); // Page load under 5 seconds
  
  // Capture a trace for performance analysis
  await page.context().tracing.start({ screenshots: true, snapshots: true });
  
  // Perform some actions to measure
  await page.getByRole('link', { name: 'Docs' }).click();
  await page.waitForLoadState('networkidle');
  
  // Stop tracing and save to file
  await page.context().tracing.stop({ path: 'performance-trace.zip' });
});