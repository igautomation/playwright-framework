/**
 * Performance Testing Utilities
 * 
 * Provides utilities for performance testing
 */
const fs = require('fs');
const path = require('path');
const externalResources = require('../../config/external-resources');

/**
 * Measure page load performance
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Object>} Performance metrics
 */
async function measurePageLoad(page) {
  // Start performance measurement
  await page.evaluate(() => window.performance.mark('start'));
  
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
  
  return metrics;
}

/**
 * Measure resource loading performance
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Object>} Resource metrics
 */
async function measureResources(page) {
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
  
  return resourceMetrics;
}

/**
 * Generate performance report
 * @param {Object} metrics - Performance metrics
 * @param {string} reportPath - Path to save report
 */
function generateReport(metrics, reportPath) {
  // Create directory if it doesn't exist
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Generate HTML report
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Performance Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin-bottom: 20px; }
        .chart { height: 300px; margin-bottom: 30px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
      <script src="${externalResources.cdn.chartJs}"></script>
    </head>
    <body>
      <h1>Performance Report</h1>
      
      <div class="metric">
        <h2>Page Load Timing</h2>
        <p>Total Load Time: ${metrics.pageLoad?.measureTiming?.duration.toFixed(2)} ms</p>
        <p>First Paint: ${metrics.pageLoad?.firstPaint?.startTime.toFixed(2)} ms</p>
        <p>First Contentful Paint: ${metrics.pageLoad?.firstContentfulPaint?.startTime.toFixed(2)} ms</p>
      </div>
      
      <div class="metric">
        <h2>Resource Metrics</h2>
        <p>Total Resources: ${metrics.resources?.resourceCount}</p>
        <p>Total Size: ${(metrics.resources?.totalSize / 1024).toFixed(2)} KB</p>
        <p>Average Duration: ${metrics.resources?.averageDuration.toFixed(2)} ms</p>
      </div>
      
      <div class="chart">
        <h2>Resources by Type</h2>
        <canvas id="resourcesChart"></canvas>
      </div>
      
      <script>
        // Create chart for resources by type
        const ctx = document.getElementById('resourcesChart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(metrics.resources?.resourcesByType || {}))},
            datasets: [{
              label: 'Count',
              data: ${JSON.stringify(Object.keys(metrics.resources?.resourcesByType || {}).map(
                type => metrics.resources?.resourcesByType[type].length
              ))},
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      </script>
    </body>
    </html>
  `;
  
  // Write report to file
  fs.writeFileSync(reportPath, html);
}

/**
 * Run performance test
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} url - URL to test
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Test results
 */
async function runPerformanceTest(page, url, options = {}) {
  // Navigate to the page
  await page.goto(url);
  
  // Measure page load performance
  const pageLoad = await measurePageLoad(page);
  
  // Measure resource loading performance
  const resources = await measureResources(page);
  
  // Combine results
  const results = {
    url,
    timestamp: new Date().toISOString(),
    pageLoad,
    resources
  };
  
  // Generate report if path is provided
  if (options.reportPath) {
    generateReport(results, options.reportPath);
  }
  
  return results;
}

module.exports = {
  measurePageLoad,
  measureResources,
  generateReport,
  runPerformanceTest
};