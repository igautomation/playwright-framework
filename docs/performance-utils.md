# Performance Utilities

This document provides an overview of the performance testing utilities available in the Playwright framework.

## Overview

The performance utilities provide tools for measuring and analyzing web page performance metrics. These utilities can help you:

- Measure page load performance
- Analyze resource loading
- Collect Core Web Vitals
- Generate detailed performance reports

## Installation

The performance utilities are included in the Playwright framework. No additional installation is required.

## Basic Usage

```javascript
const { chromium } = require('@playwright/test');
const { runPerformanceTest } = require('../src/utils/performance/performanceUtils');

async function runTest() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Run a complete performance test
  const results = await runPerformanceTest(page, 'https://example.com', {
    reportPath: './reports/performance/example-report.html'
  });
  
  console.log('Test completed. Report saved to:', results.reportPath);
  
  await browser.close();
}

runTest();
```

## API Reference

### measurePageLoad(page, options)

Measures page load performance metrics.

- `page`: Playwright page object
- `options`: Measurement options
  - `waitUntil`: Page load state to wait for (default: 'networkidle')

Returns: Performance metrics object

### measureResources(page)

Measures resource loading performance.

- `page`: Playwright page object

Returns: Resource metrics object

### measureNetwork(page)

Measures network performance using CDP.

- `page`: Playwright page object

Returns: Network metrics object

### measureCoreWebVitals(page)

Measures Core Web Vitals metrics.

- `page`: Playwright page object

Returns: Core Web Vitals metrics object

### generateReport(metrics, reportPath, options)

Generates a performance report.

- `metrics`: Performance metrics object
- `reportPath`: Path to save the report
- `options`: Report options
  - `chartJsUrl`: URL to Chart.js library (default: CDN URL)
  - `saveRawData`: Whether to save raw data as JSON (default: false)

Returns: Path to the generated report

### runPerformanceTest(page, url, options)

Runs a complete performance test.

- `page`: Playwright page object
- `url`: URL to test
- `options`: Test options
  - `waitUntil`: Page load state to wait for (default: 'networkidle')
  - `timeout`: Navigation timeout in ms (default: 30000)
  - `reportPath`: Path to save the report
  - `measureNetwork`: Whether to measure network performance (default: false)
  - `saveRawData`: Whether to save raw data as JSON (default: false)

Returns: Test results object

## Interpreting Results

The performance reports include:

- **Page Load Timing**: Time to load the page, including first paint, first contentful paint, DOM content loaded, and load event.
- **Resource Metrics**: Number of resources, total size, and loading duration.
- **Slowest Resources**: The resources that took the longest to load.
- **Largest Resources**: The resources with the largest file size.
- **Resources by Type**: Breakdown of resources by type (script, stylesheet, image, etc.).

## Example

See the [performance-test-example.js](../examples/performance-test-example.js) file for a complete example of how to use these utilities.