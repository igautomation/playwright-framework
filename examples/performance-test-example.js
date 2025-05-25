/**
 * Example script demonstrating how to use the performance utilities
 */
const { chromium } = require('@playwright/test');
const { 
  measurePageLoad, 
  measureResources, 
  generateReport, 
  runPerformanceTest 
} = require('../src/utils/performance/performanceUtils');

async function runExample() {
  console.log('Starting performance test example...');
  
  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Example 1: Basic performance test with all metrics
    console.log('\nExample 1: Running complete performance test');
    const results = await runPerformanceTest(page, 'https://playwright.dev', {
      reportPath: './reports/performance/playwright-site-report.html',
      saveRawData: true
    });
    console.log('Test completed. Report saved to:', results.reportPath);
    
    // Example 2: Measure just page load metrics
    console.log('\nExample 2: Measuring page load metrics only');
    await page.goto('https://github.com', { waitUntil: 'networkidle' });
    const pageLoadMetrics = await measurePageLoad(page);
    console.log('Page load time:', pageLoadMetrics.measureTiming?.duration, 'ms');
    
    // Example 3: Measure resource metrics
    console.log('\nExample 3: Measuring resource metrics');
    const resourceMetrics = await measureResources(page);
    console.log('Total resources:', resourceMetrics.resourceCount);
    console.log('Total size:', resourceMetrics.totalSize, 'bytes');
    
    console.log('\nPerformance test examples completed successfully!');
  } catch (error) {
    console.error('Error running performance test examples:', error);
  } finally {
    await browser.close();
  }
}

// Run the example if this script is executed directly
if (require.main === module) {
  runExample().catch(console.error);
}

module.exports = { runExample };