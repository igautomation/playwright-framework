<!-- Source: /Users/mzahirudeen/playwright-framework/docs/playwright-integration-guide.md -->

# Playwright Integration Guide

This guide explains how the Playwright Framework integrates Playwright for enhanced browser automation, testing, and reporting capabilities.

## Overview

[Playwright](https://playwright.dev/) is a powerful browser automation library that enables reliable end-to-end testing for modern web apps. Our framework integrates Playwright to enhance various aspects of the reporting system, including:

- Screenshot capture
- PDF generation
- Accessibility testing
- Responsive design testing
- Network mocking
- Debugging with traces

## PlaywrightService

The core of our Playwright integration is the `PlaywrightService` class, which provides a unified interface for browser automation tasks.

### Key Features

#### Screenshot Capture

Capture high-quality screenshots of entire pages or specific elements:

```javascript
const playwrightService = new PlaywrightService();

// Capture full page screenshot
const screenshot = await playwrightService.captureScreenshot('https://example.com', {
  path: 'screenshot.png',
  fullPage: true
});

// Capture element screenshot
const elementScreenshot = await playwrightService.captureElementScreenshot(
  'https://example.com',
  '.chart-container',
  { path: 'chart.png' }
);
```

#### PDF Generation

Generate PDF documents from web pages with advanced formatting options:

```javascript
const pdfPath = await playwrightService.generatePdf('https://example.com/report', {
  path: 'report.pdf',
  format: 'A4',
  margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div style="text-align: center">Report Header</div>',
  footerTemplate: '<div style="text-align: center">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
});
```

#### Accessibility Testing

Run accessibility audits on reports and templates:

```javascript
const accessibilityResults = await playwrightService.runAccessibilityAudit(
  'https://example.com/report',
  {
    reportPath: 'accessibility-report.json'
  }
);

if (accessibilityResults.issues.length > 0) {
  console.log('Accessibility issues found:', accessibilityResults.issues);
}
```

#### Responsive Design Testing

Test how reports and templates look across different device viewports:

```javascript
const responsiveResults = await playwrightService.testResponsiveness(
  'https://example.com/report',
  [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ]
);

responsiveResults.forEach(result => {
  console.log(`Device: ${result.device}`);
  console.log(`Layout issues: ${result.layoutIssues.length}`);
  console.log(`Screenshot: ${result.screenshotPath}`);
});
```

#### Network Mocking

Test reports with mock data by intercepting network requests:

```javascript
const results = await playwrightService.withNetworkMocks(
  'https://example.com/dashboard',
  [
    {
      url: '**/api/data',
      body: { data: mockData },
      contentType: 'application/json'
    }
  ],
  async (page) => {
    // Interact with the page
    await page.click('#generate-report-btn');
    await page.waitForSelector('.report-container');
    return page.title();
  },
  { screenshot: true }
);

console.log('Page title:', results.result);
console.log('Screenshot:', results.screenshotPath);
```

#### Debugging with Traces

Capture detailed traces for debugging report generation issues:

```javascript
const tracePath = await playwrightService.captureTrace(
  async (page) => {
    await page.goto('https://example.com/report-generator');
    await page.fill('#data-source', 'sales-data.json');
    await page.click('#generate-btn');
    await page.waitForSelector('.report-ready');
  },
  {
    path: 'debug-trace.zip',
    screenshots: true,
    snapshots: true
  }
);

console.log(`Trace saved to: ${tracePath}`);
console.log('View the trace with: npx playwright show-trace debug-trace.zip');
```

## Integration with Framework Components

### ChartGenerator

The `ChartGenerator` class uses Playwright to:

- Capture high-quality screenshots of charts and tables
- Generate PDF versions of reports
- Test report accessibility and responsiveness

```javascript
const chartGenerator = new ChartGenerator();

// Generate a report
const reportPath = await chartGenerator.generateReport(charts, 'Sales Report');

// Test report accessibility
const accessibilityResults = await chartGenerator.testReportAccessibility(reportPath);

// Test report responsiveness
const responsiveResults = await chartGenerator.testReportResponsiveness(reportPath);
```

### ReportTemplate

The `ReportTemplate` class uses Playwright to:

- Validate template accessibility
- Test template responsiveness
- Preview templates with mock data

```javascript
const reportTemplate = new ReportTemplate();

// Validate template accessibility
const accessibilityResults = await reportTemplate.validateAccessibility('template-123');

// Test template responsiveness
const responsiveResults = await reportTemplate.testResponsiveness('template-123');

// Preview template with mock data
const previewPath = await reportTemplate.previewWithMockData('template-123', mockData);
```

### ReportScheduler

The `ReportScheduler` class uses Playwright to:

- Capture traces during report generation for debugging
- Generate PDF versions of reports for email attachments
- Test report accessibility and responsiveness

```javascript
const reportScheduler = new ReportScheduler();

// Run a schedule immediately
const reportPath = await reportScheduler.runScheduleNow('schedule-123');
```

## Error Handling

The Playwright integration includes robust error handling:

- Detailed error logging with context information
- Specific error types for different Playwright operations
- Graceful degradation when Playwright operations fail
- Trace capture for debugging complex issues

Example error handling:

```javascript
try {
  await playwrightService.captureScreenshot('https://example.com');
} catch (error) {
  if (error.name === 'TimeoutError') {
    logger.error('Screenshot capture timed out', {
      url: 'https://example.com',
      timeout: error.timeout
    });
    // Handle timeout specifically
  } else {
    logger.error('Screenshot capture failed', error);
    // Handle other errors
  }
}
```

## Best Practices

### Performance Optimization

- **Reuse browser instances** when performing multiple operations
- **Minimize page loads** by combining operations
- **Use appropriate timeouts** for different operations
- **Limit trace capture** to debugging scenarios only

### Reliability

- **Handle timeouts gracefully** with appropriate fallbacks
- **Implement retry mechanisms** for flaky operations
- **Use explicit waiting** instead of fixed timeouts
- **Check element visibility** before interacting with elements

### Security

- **Run in headless mode** in production environments
- **Sanitize user input** before passing to Playwright
- **Limit file system access** to designated directories
- **Validate URLs** before navigation

## Troubleshooting

### Common Issues

1. **Timeouts during screenshot capture**
   - Increase timeout values
   - Check if elements are actually visible
   - Verify network connectivity

2. **PDF generation fails**
   - Check if the page is fully loaded
   - Verify that all resources are accessible
   - Try with simpler content first

3. **Accessibility tests report false positives**
   - Review the specific issues reported
   - Consider adding exceptions for known issues
   - Verify with manual testing

### Debugging Tools

- **Trace Viewer**: Use `npx playwright show-trace trace.zip` to view captured traces
- **Screenshots**: Examine screenshots to see what the browser was seeing
- **Console Logs**: Check browser console logs captured in traces
- **Network Requests**: Review network requests in traces to identify issues

## Advanced Usage

### Custom Browser Configuration

```javascript
const playwrightService = new PlaywrightService({
  browserOptions: {
    headless: false,
    slowMo: 100,
    args: ['--disable-gpu', '--no-sandbox']
  }
});
```

### Custom Layout Checks

```javascript
const results = await playwrightService.testResponsiveness('https://example.com', [], {
  customChecks: [
    async (page) => {
      // Check for text overflow
      const overflowingText = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));
        return elements
          .filter(el => {
            const style = window.getComputedStyle(el);
            return el.scrollWidth > el.clientWidth && style.overflow === 'hidden';
          })
          .map(el => ({
            text: el.textContent.substring(0, 50),
            tagName: el.tagName
          }));
      });
      
      if (overflowingText.length > 0) {
        return [{
          type: 'text-overflow',
          message: `Found ${overflowingText.length} elements with text overflow`,
          elements: overflowingText
        }];
      }
      
      return [];
    }
  ]
});
```

### Visual Regression Testing

While not directly implemented, you can use Playwright for visual regression testing:

```javascript
const { createHash } = require('crypto');
const fs = require('fs');

async function compareScreenshots(page, name) {
  const screenshot = await page.screenshot();
  const hash = createHash('md5').update(screenshot).digest('hex');
  
  const baselinePath = `./baselines/${name}.png`;
  
  if (fs.existsSync(baselinePath)) {
    const baseline = fs.readFileSync(baselinePath);
    const baselineHash = createHash('md5').update(baseline).digest('hex');
    
    if (hash !== baselineHash) {
      fs.writeFileSync(`./diffs/${name}.png`, screenshot);
      return false;
    }
    
    return true;
  } else {
    fs.writeFileSync(baselinePath, screenshot);
    return true;
  }
}
```

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Accessibility Testing with Playwright](https://playwright.dev/docs/accessibility-testing)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [PDF Generation](https://playwright.dev/docs/api/class-page#page-pdf)
- [Network Interception](https://playwright.dev/docs/network)