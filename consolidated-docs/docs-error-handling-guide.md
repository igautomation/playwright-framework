<!-- Source: /Users/mzahirudeen/playwright-framework/docs/error-handling-guide.md -->

# Error Handling Guide

This guide explains the error handling techniques and best practices used in the Playwright Framework.

## Overview

Robust error handling is essential for creating reliable, maintainable software. The Playwright Framework implements comprehensive error handling strategies to ensure that:

1. Errors are properly caught and logged
2. Appropriate fallback behaviors are provided
3. Detailed error information is available for debugging
4. The system can recover from transient failures
5. Users receive meaningful error messages

## PlaywrightErrorHandler

The core of our error handling strategy is the `PlaywrightErrorHandler` class, which provides utilities for handling errors in Playwright operations.

### Key Features

#### Enhanced Error Information

The `handleError` method enriches error objects with additional context:

```javascript
try {
  await page.click('#non-existent-element');
} catch (error) {
  throw PlaywrightErrorHandler.handleError(error, {
    action: 'clicking button',
    selector: '#non-existent-element',
    page: 'login page'
  });
}
```

This produces errors with:
- Descriptive messages
- Error codes
- Context information
- Original error preservation

#### Retry Mechanism

The `withRetry` method wraps functions with automatic retry logic:

```javascript
const retryableFunction = PlaywrightErrorHandler.withRetry(
  async () => {
    // Operation that might fail intermittently
    await page.click('#flaky-button');
  },
  {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: error => error.name !== 'SecurityError',
    context: { action: 'clicking flaky button' }
  }
);

await retryableFunction();
```

This is particularly useful for:
- Network operations
- UI interactions that might be affected by animations
- Operations that depend on external services

#### Timeout Handling

The `withTimeout` method adds custom timeouts to operations:

```javascript
const result = await PlaywrightErrorHandler.withTimeout(
  async () => {
    // Potentially slow operation
    return await page.evaluate(() => performHeavyCalculation());
  },
  5000, // 5 second timeout
  { action: 'performing calculation' }
);
```

This ensures that operations don't hang indefinitely and provides clear timeout errors.

#### Graceful Degradation

The `withGracefulDegradation` method allows specifying fallback behavior:

```javascript
const result = await PlaywrightErrorHandler.withGracefulDegradation(
  // Primary function
  async () => await page.screenshot({ path: 'element.png' }),
  
  // Fallback function
  async (args, error) => {
    console.warn('Element screenshot failed, using full page screenshot instead');
    return await page.screenshot({ path: 'fallback.png', fullPage: true });
  },
  { action: 'capturing screenshot' }
);
```

This ensures that the system can continue operating even when non-critical operations fail.

## Error Handling Patterns

### Try-Catch-Finally Pattern

All operations that might fail are wrapped in try-catch-finally blocks:

```javascript
async function performOperation() {
  let browser = null;
  
  try {
    browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    
    // Operation code...
    
    return result;
  } catch (error) {
    // Handle error
    throw PlaywrightErrorHandler.handleError(error, { action: 'performing operation' });
  } finally {
    // Clean up resources
    if (browser) {
      await browser.close();
    }
  }
}
```

This ensures that:
- Errors are properly caught and handled
- Resources are always cleaned up
- Enhanced error information is provided

### Error Categorization

Errors are categorized by type to enable specific handling:

```javascript
try {
  // Operation code...
} catch (error) {
  if (error.code === 'PLAYWRIGHT_TIMEOUT') {
    // Handle timeout specifically
  } else if (error.code === 'PLAYWRIGHT_SELECTOR') {
    // Handle selector error specifically
  } else {
    // Handle other errors
  }
}
```

Common error categories include:
- `PLAYWRIGHT_TIMEOUT`: Operation took too long
- `PLAYWRIGHT_SELECTOR`: Element not found or selector issue
- `PLAYWRIGHT_NAVIGATION`: Page navigation failed
- `PLAYWRIGHT_ERROR`: Generic Playwright error

### Centralized Logging

All errors are logged through the centralized logger:

```javascript
try {
  // Operation code...
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: { /* additional context */ }
  });
  
  throw error; // Re-throw or handle
}
```

This ensures that:
- All errors are consistently logged
- Error logs include context information
- Error logs are properly formatted

### Progressive Enhancement

Non-critical features use progressive enhancement:

```javascript
async function generateReport() {
  // Core functionality
  const report = await generateBasicReport();
  
  // Enhanced features with graceful degradation
  try {
    report.charts = await generateCharts();
  } catch (error) {
    logger.warn('Failed to generate charts, continuing with text-only report', error);
    report.charts = [];
  }
  
  return report;
}
```

This ensures that:
- Core functionality is always available
- Enhanced features are used when possible
- The system degrades gracefully when features fail

## Best Practices

### 1. Be Specific About What Failed

Error messages should clearly indicate what operation failed:

```javascript
// ❌ Bad
throw new Error('Failed');

// ✅ Good
throw new Error('Failed to capture screenshot of product details');
```

### 2. Include Relevant Context

Error objects should include context that helps with debugging:

```javascript
// ❌ Bad
throw new Error('Element not found');

// ✅ Good
throw PlaywrightErrorHandler.handleError(error, {
  action: 'clicking add to cart button',
  selector: '#add-to-cart',
  productId: '12345'
});
```

### 3. Clean Up Resources

Always clean up resources in finally blocks:

```javascript
// ❌ Bad
async function captureScreenshot() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
}

// ✅ Good
async function captureScreenshot() {
  let browser = null;
  try {
    browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({ path: 'screenshot.png' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
```

### 4. Use Appropriate Error Types

Use specific error types or codes for different error categories:

```javascript
// ❌ Bad
throw new Error('Something went wrong');

// ✅ Good
const error = new Error('Navigation timed out after 30 seconds');
error.code = 'PLAYWRIGHT_TIMEOUT';
error.context = { url, timeout: 30000 };
throw error;
```

### 5. Implement Retry for Transient Failures

Retry operations that might fail due to transient issues:

```javascript
// ❌ Bad
await page.click('#submit-button');

// ✅ Good
await PlaywrightErrorHandler.withRetry(
  async () => await page.click('#submit-button'),
  { maxRetries: 3, retryDelay: 500 }
)();
```

### 6. Provide Fallbacks for Non-Critical Features

Use graceful degradation for enhanced features:

```javascript
// ❌ Bad
const chart = await generateInteractiveChart();
report.addChart(chart);

// ✅ Good
try {
  const chart = await generateInteractiveChart();
  report.addChart(chart);
} catch (error) {
  logger.warn('Failed to generate interactive chart, using static chart instead', error);
  const staticChart = generateStaticChart();
  report.addChart(staticChart);
}
```

### 7. Validate Inputs Early

Validate inputs before performing operations:

```javascript
// ❌ Bad
async function captureScreenshot(url) {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);
  // ...
}

// ✅ Good
async function captureScreenshot(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('URL must start with http:// or https://');
  }
  
  const browser = await playwright.chromium.launch();
  // ...
}
```

### 8. Use Explicit Waiting

Use explicit waiting instead of fixed timeouts:

```javascript
// ❌ Bad
await page.goto('https://example.com');
await page.waitForTimeout(2000); // Arbitrary wait
await page.click('#submit');

// ✅ Good
await page.goto('https://example.com');
await page.waitForSelector('#submit', { state: 'visible' });
await page.click('#submit');
```

## Error Handling in Different Components

### PlaywrightService

The `PlaywrightService` class uses comprehensive error handling:

```javascript
async captureScreenshot(url, options = {}) {
  let browser = null;
  
  try {
    browser = await this.launchBrowser();
    const page = await browser.newPage();
    
    // Set viewport size if provided
    if (options.viewport) {
      await page.setViewportSize(options.viewport);
    }
    
    // Navigate to URL with timeout
    await page.goto(url, { 
      timeout: options.timeout || 30000,
      waitUntil: options.waitUntil || 'networkidle'
    });
    
    // Wait for selector if provided
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { 
        state: 'visible',
        timeout: options.selectorTimeout || 10000
      });
    }
    
    // Generate screenshot path if not provided
    const screenshotPath = options.path || path.join(
      this.outputDir,
      `screenshot-${Date.now()}.png`
    );
    
    // Take screenshot
    const screenshot = await page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage !== false
    });
    
    return screenshot;
  } catch (error) {
    throw PlaywrightErrorHandler.handleError(error, {
      action: 'capturing screenshot',
      url,
      options
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
```

### ChartGenerator

The `ChartGenerator` class uses graceful degradation:

```javascript
async generateReport(charts, title) {
  try {
    // Create report directory
    const reportDir = path.join(this.outputDir, title || `report-${Date.now()}`);
    this._ensureDirectoryExists(reportDir);
    
    // Generate each chart with retry and fallback
    const chartPaths = [];
    
    for (let i = 0; i < charts.length; i++) {
      const chart = charts[i];
      const chartFilename = `chart-${i + 1}`;
      
      try {
        let chartPath;
        
        // Use retry for chart generation
        const generateWithRetry = PlaywrightErrorHandler.withRetry(
          async () => {
            if (chart.type === 'bar') {
              return await this.generateBarChart(chart.config, chartFilename);
            } else if (chart.type === 'line') {
              return await this.generateLineChart(chart.config, chartFilename);
            } else if (chart.type === 'pie') {
              return await this.generatePieChart(chart.config, chartFilename);
            } else if (chart.type === 'table') {
              return await this.generateTableImage(chart.data, chart.options, chartFilename);
            } else {
              throw new Error(`Unsupported chart type: ${chart.type}`);
            }
          },
          { maxRetries: 2, retryDelay: 1000 }
        );
        
        chartPath = await generateWithRetry();
        
        // Copy chart to report directory
        const chartFilename2 = path.basename(chartPath);
        const reportChartPath = path.join(reportDir, chartFilename2);
        fs.copyFileSync(chartPath, reportChartPath);
        
        chartPaths.push({
          path: chartFilename2,
          title: chart.title || `Chart ${i + 1}`,
          type: chart.type
        });
      } catch (chartError) {
        // Fallback to error placeholder
        logger.error(`Failed to generate chart ${i + 1}`, chartError);
        
        // Create error placeholder
        const errorPath = await this._createErrorPlaceholder(
          chart.title || `Chart ${i + 1}`,
          chartError.message,
          path.join(reportDir, `chart-${i + 1}-error.png`)
        );
        
        chartPaths.push({
          path: path.basename(errorPath),
          title: chart.title || `Chart ${i + 1}`,
          type: 'error',
          error: chartError.message
        });
      }
    }
    
    // Generate HTML report
    const reportHtml = this._generateReportHtml(chartPaths, title);
    fs.writeFileSync(path.join(reportDir, 'index.html'), reportHtml);
    
    return reportDir;
  } catch (error) {
    logger.error('Failed to generate report', error);
    throw PlaywrightErrorHandler.handleError(error, {
      action: 'generating report',
      title,
      chartCount: charts.length
    });
  }
}
```

## Conclusion

Effective error handling is a critical aspect of the Playwright Framework. By following these patterns and best practices, we ensure that:

1. Errors are properly caught, logged, and handled
2. Resources are always cleaned up
3. The system can recover from transient failures
4. Users receive meaningful error messages
5. Debugging is easier with detailed error information

These practices contribute to a more robust, maintainable, and user-friendly system.