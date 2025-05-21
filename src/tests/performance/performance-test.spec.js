// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Performance Test Suite
 * 
 * Tests for performance metrics
 */
test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    // Start performance measurement
    await page.evaluate(() => window.performance.mark('start'));
});

    // Navigate to the page
    await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
    
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
    await page.context().tracing.stop({ path: 'reports/performance/performance-trace.zip' });
  });
  
  test('interaction performance', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.TODO_APP_URL);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Start performance measurement
    await page.evaluate(() => window.performance.mark('interaction-start'));
    
    // Perform interaction
    await page.getByPlaceholder('What needs to be done?').fill('Performance test');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // End performance measurement
    const interactionTime = await page.evaluate(() => {
      window.performance.mark('interaction-end');
      window.performance.measure('interaction', 'interaction-start', 'interaction-end');
      
      const measureEntries = window.performance.getEntriesByName('interaction');
      return measureEntries.length > 0 ? measureEntries[0].duration : null;
    });
    
    // Log interaction time
    console.log('Interaction Time:', interactionTime, 'ms');
    
    // Verify interaction time is within acceptable threshold
    expect(interactionTime).toBeLessThan(1000); // Interaction under 1 second
  });
  
  test('resource loading performance', async ({ page }) => {
    // Navigate to the page
    await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Get resource timing information
    const resourceMetrics = await page.evaluate(() => {
      const resources = window.performance.getEntriesByType('resource');
      
      // Group resources by type
      const resourcesByType = resources.reduce((acc, resource) => {
        const type = resource.initiatorType || 'other';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push({
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize || 0
        });
        return acc;
      }, {});
      
      // Calculate total and average metrics
      const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
      const totalDuration = resources.reduce((sum, resource) => sum + resource.duration, 0);
      const averageDuration = totalDuration / resources.length;
      
      return {
        resourceCount: resources.length,
        resourcesByType,
        totalSize,
        totalDuration,
        averageDuration
      };
    });
    
    // Log resource metrics
    console.log('Resource Count:', resourceMetrics.resourceCount);
    console.log('Total Size:', Math.round(resourceMetrics.totalSize / 1024), 'KB');
    console.log('Average Duration:', Math.round(resourceMetrics.averageDuration), 'ms');
    
    // Verify resource metrics are within acceptable thresholds
    expect(resourceMetrics.totalSize).toBeLessThan(5 * 1024 * 1024); // Total size under 5MB
    expect(resourceMetrics.averageDuration).toBeLessThan(1000); // Average duration under 1 second
  });
});