/**
 * Performance Testing Utilities
 * 
 * Provides utilities for performance testing
 */
const fs = require('fs');
const path = require('path');
const config = require('../../config');

// Default Chart.js URL from config or environment or CDN
const CHART_JS_URL = process.env.CHART_JS_CDN || 
  (config.externalResources?.cdn?.chartJs) || 
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';

/**
 * Measure page load performance
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Measurement options
 * @returns {Promise<Object>} Performance metrics
 */
async function measurePageLoad(page, options = {}) {
  // Start performance measurement
  await page.evaluate(() => window.performance.mark('start'));
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState(options.waitUntil || 'networkidle');
  
  // End performance measurement
  const metrics = await page.evaluate(() => {
    window.performance.mark('end');
    window.performance.measure('pageLoad', 'start', 'end');
    
    // Get all performance entries
    const performanceEntries = window.performance.getEntriesByType('navigation');
    const measureEntries = window.performance.getEntriesByName('pageLoad');
    
    // Get core web vitals if available
    let lcp = null;
    let fid = null;
    let cls = null;
    
    // Try to get LCP
    try {
      const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries && lcpEntries.length > 0) {
        lcp = lcpEntries[lcpEntries.length - 1];
      }
    } catch (e) {
      // LCP not available
    }
    
    // Try to get FID
    try {
      const fidEntries = window.performance.getEntriesByType('first-input');
      if (fidEntries && fidEntries.length > 0) {
        fid = fidEntries[0];
      }
    } catch (e) {
      // FID not available
    }
    
    // CLS needs to be calculated separately via PerformanceObserver
    
    return {
      navigationTiming: performanceEntries.length > 0 ? performanceEntries[0] : null,
      measureTiming: measureEntries.length > 0 ? measureEntries[0] : null,
      // Get other Web Vitals metrics
      firstPaint: window.performance.getEntriesByName('first-paint')[0],
      firstContentfulPaint: window.performance.getEntriesByName('first-contentful-paint')[0],
      largestContentfulPaint: lcp,
      firstInputDelay: fid,
      cumulativeLayoutShift: cls
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
        size: resource.transferSize || 0,
        protocol: resource.nextHopProtocol || 'unknown'
      });
      return acc;
    }, {});
    
    // Calculate total and average metrics
    const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    const totalDuration = resources.reduce((sum, resource) => sum + resource.duration, 0);
    const averageDuration = resources.length > 0 ? totalDuration / resources.length : 0;
    
    // Find slowest resources
    const slowestResources = [...resources]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0
      }));
    
    // Find largest resources
    const largestResources = [...resources]
      .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
      .slice(0, 5)
      .map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0
      }));
    
    return {
      resourceCount: resources.length,
      resourcesByType,
      totalSize,
      totalDuration,
      averageDuration,
      slowestResources,
      largestResources
    };
  });
  
  return resourceMetrics;
}

/**
 * Measure network performance
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Object>} Network metrics
 */
async function measureNetwork(page) {
  // Get network information using CDP
  const client = await page.context().newCDPSession(page);
  
  // Enable network monitoring
  await client.send('Network.enable');
  
  // Get network metrics
  const metrics = await client.send('Network.getMetrics');
  
  return metrics;
}

/**
 * Generate performance report
 * @param {Object} metrics - Performance metrics
 * @param {string} reportPath - Path to save report
 * @param {Object} options - Report options
 */
function generateReport(metrics, reportPath, options = {}) {
  // Create directory if it doesn't exist
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Format bytes to human-readable format
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Generate HTML report
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Performance Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .metric { margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .chart { height: 300px; margin-bottom: 30px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1, h2, h3 { color: #2c3e50; }
        h1 { border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .summary { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
        .summary-item { background-color: #f8f9fa; padding: 15px; border-radius: 5px; flex: 1; min-width: 200px; }
        .summary-item h3 { margin-top: 0; margin-bottom: 5px; }
        .summary-item .value { font-size: 24px; font-weight: bold; color: #3498db; }
        .good { color: #27ae60; }
        .warning { color: #f39c12; }
        .bad { color: #e74c3c; }
      </style>
      <script src="${options.chartJsUrl || CHART_JS_URL}"></script>
    </head>
    <body>
      <h1>Performance Report</h1>
      <p><strong>URL:</strong> ${metrics.url}</p>
      <p><strong>Date:</strong> ${new Date(metrics.timestamp).toLocaleString()}</p>
      
      <div class="summary">
        <div class="summary-item">
          <h3>Page Load Time</h3>
          <div class="value ${metrics.pageLoad?.measureTiming?.duration < 1000 ? 'good' : metrics.pageLoad?.measureTiming?.duration < 3000 ? 'warning' : 'bad'}">
            ${metrics.pageLoad?.measureTiming?.duration ? (metrics.pageLoad.measureTiming.duration / 1000).toFixed(2) + 's' : 'N/A'}
          </div>
        </div>
        <div class="summary-item">
          <h3>First Paint</h3>
          <div class="value ${metrics.pageLoad?.firstPaint?.startTime < 1000 ? 'good' : metrics.pageLoad?.firstPaint?.startTime < 2000 ? 'warning' : 'bad'}">
            ${metrics.pageLoad?.firstPaint?.startTime ? (metrics.pageLoad.firstPaint.startTime / 1000).toFixed(2) + 's' : 'N/A'}
          </div>
        </div>
        <div class="summary-item">
          <h3>First Contentful Paint</h3>
          <div class="value ${metrics.pageLoad?.firstContentfulPaint?.startTime < 1500 ? 'good' : metrics.pageLoad?.firstContentfulPaint?.startTime < 2500 ? 'warning' : 'bad'}">
            ${metrics.pageLoad?.firstContentfulPaint?.startTime ? (metrics.pageLoad.firstContentfulPaint.startTime / 1000).toFixed(2) + 's' : 'N/A'}
          </div>
        </div>
        <div class="summary-item">
          <h3>Resources</h3>
          <div class="value">
            ${metrics.resources?.resourceCount || 'N/A'}
          </div>
        </div>
        <div class="summary-item">
          <h3>Total Size</h3>
          <div class="value">
            ${metrics.resources?.totalSize ? formatBytes(metrics.resources.totalSize) : 'N/A'}
          </div>
        </div>
      </div>
      
      <div class="metric">
        <h2>Page Load Timing</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Total Load Time</td>
            <td>${metrics.pageLoad?.measureTiming?.duration ? (metrics.pageLoad.measureTiming.duration / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
          <tr>
            <td>First Paint</td>
            <td>${metrics.pageLoad?.firstPaint?.startTime ? (metrics.pageLoad.firstPaint.startTime / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
          <tr>
            <td>First Contentful Paint</td>
            <td>${metrics.pageLoad?.firstContentfulPaint?.startTime ? (metrics.pageLoad.firstContentfulPaint.startTime / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
          <tr>
            <td>DOM Content Loaded</td>
            <td>${metrics.pageLoad?.navigationTiming?.domContentLoadedEventEnd ? (metrics.pageLoad.navigationTiming.domContentLoadedEventEnd / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
          <tr>
            <td>Load Event</td>
            <td>${metrics.pageLoad?.navigationTiming?.loadEventEnd ? (metrics.pageLoad.navigationTiming.loadEventEnd / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
          <tr>
            <td>Largest Contentful Paint</td>
            <td>${metrics.pageLoad?.largestContentfulPaint?.startTime ? (metrics.pageLoad.largestContentfulPaint.startTime / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
          <tr>
            <td>First Input Delay</td>
            <td>${metrics.pageLoad?.firstInputDelay?.processingStart - metrics.pageLoad?.firstInputDelay?.startTime ? ((metrics.pageLoad.firstInputDelay.processingStart - metrics.pageLoad.firstInputDelay.startTime) / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
        </table>
      </div>
      
      <div class="metric">
        <h2>Resource Metrics</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Total Resources</td>
            <td>${metrics.resources?.resourceCount || 'N/A'}</td>
          </tr>
          <tr>
            <td>Total Size</td>
            <td>${metrics.resources?.totalSize ? formatBytes(metrics.resources.totalSize) : 'N/A'}</td>
          </tr>
          <tr>
            <td>Total Duration</td>
            <td>${metrics.resources?.totalDuration ? (metrics.resources.totalDuration / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
          <tr>
            <td>Average Duration</td>
            <td>${metrics.resources?.averageDuration ? (metrics.resources.averageDuration / 1000).toFixed(2) + 's' : 'N/A'}</td>
          </tr>
        </table>
      </div>
      
      <div class="chart">
        <h2>Resources by Type</h2>
        <canvas id="resourcesChart"></canvas>
      </div>
      
      <div class="metric">
        <h2>Slowest Resources</h2>
        <table>
          <tr>
            <th>Resource</th>
            <th>Duration</th>
            <th>Size</th>
          </tr>
          ${metrics.resources?.slowestResources?.map(resource => `
            <tr>
              <td>${resource.name}</td>
              <td>${(resource.duration / 1000).toFixed(2)}s</td>
              <td>${formatBytes(resource.size)}</td>
            </tr>
          `).join('') || '<tr><td colspan="3">No data available</td></tr>'}
        </table>
      </div>
      
      <div class="metric">
        <h2>Largest Resources</h2>
        <table>
          <tr>
            <th>Resource</th>
            <th>Size</th>
            <th>Duration</th>
          </tr>
          ${metrics.resources?.largestResources?.map(resource => `
            <tr>
              <td>${resource.name}</td>
              <td>${formatBytes(resource.size)}</td>
              <td>${(resource.duration / 1000).toFixed(2)}s</td>
            </tr>
          `).join('') || '<tr><td colspan="3">No data available</td></tr>'}
        </table>
      </div>
      
      <script>
        // Create chart for resources by type
        const ctx = document.getElementById('resourcesChart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(metrics.resources?.resourcesByType || {}))},
            datasets: [
              {
                label: 'Count',
                data: ${JSON.stringify(Object.keys(metrics.resources?.resourcesByType || {}).map(
                  type => metrics.resources?.resourcesByType[type].length
                ))},
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y'
              },
              {
                label: 'Size (KB)',
                data: ${JSON.stringify(Object.keys(metrics.resources?.resourcesByType || {}).map(
                  type => metrics.resources?.resourcesByType[type].reduce((sum, resource) => sum + (resource.size || 0), 0) / 1024
                ))},
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Count'
                }
              },
              y1: {
                beginAtZero: true,
                position: 'right',
                grid: {
                  drawOnChartArea: false
                },
                title: {
                  display: true,
                  text: 'Size (KB)'
                }
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
  
  // Also save raw data as JSON if requested
  if (options.saveRawData) {
    const jsonPath = reportPath.replace(/\.html$/, '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2));
  }
  
  return reportPath;
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
  await page.goto(url, {
    waitUntil: options.waitUntil || 'networkidle',
    timeout: options.timeout || 30000
  });
  
  // Measure page load performance
  const pageLoad = await measurePageLoad(page, options);
  
  // Measure resource loading performance
  const resources = await measureResources(page);
  
  // Measure network performance if requested
  let network = null;
  if (options.measureNetwork) {
    network = await measureNetwork(page);
  }
  
  // Combine results
  const results = {
    url,
    timestamp: new Date().toISOString(),
    pageLoad,
    resources,
    network
  };
  
  // Generate report if path is provided
  if (options.reportPath) {
    generateReport(results, options.reportPath, options);
  }
  
  return results;
}

/**
 * Measure Core Web Vitals
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Object>} Core Web Vitals metrics
 */
async function measureCoreWebVitals(page) {
  // Inject web-vitals library
  await page.addScriptTag({
    url: 'https://unpkg.com/web-vitals@3.0.0/dist/web-vitals.iife.js'
  });
  
  // Measure Core Web Vitals
  const metrics = await page.evaluate(() => {
    return new Promise(resolve => {
      const metrics = {};
      
      // Measure LCP
      webVitals.getLCP(lcp => {
        metrics.LCP = lcp;
        checkComplete();
      });
      
      // Measure FID
      webVitals.getFID(fid => {
        metrics.FID = fid;
        checkComplete();
      });
      
      // Measure CLS
      webVitals.getCLS(cls => {
        metrics.CLS = cls;
        checkComplete();
      });
      
      // Measure TTFB
      webVitals.getTTFB(ttfb => {
        metrics.TTFB = ttfb;
        checkComplete();
      });
      
      // Measure FCP
      webVitals.getFCP(fcp => {
        metrics.FCP = fcp;
        checkComplete();
      });
      
      // Check if all metrics are collected
      function checkComplete() {
        if (metrics.LCP && metrics.FID && metrics.CLS && metrics.TTFB && metrics.FCP) {
          resolve(metrics);
        }
      }
      
      // Resolve after a timeout in case some metrics don't fire
      setTimeout(() => {
        resolve(metrics);
      }, 10000);
    });
  });
  
  return metrics;
}

module.exports = {
  measurePageLoad,
  measureResources,
  measureNetwork,
  measureCoreWebVitals,
  generateReport,
  runPerformanceTest
};