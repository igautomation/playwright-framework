# Reporting Utilities

This document provides an overview of the reporting utilities available in the Playwright framework.

## Overview

The reporting utilities provide tools for generating various types of test reports. These utilities can help you:

- Generate HTML reports from test results
- Generate Allure reports
- Generate JUnit XML reports
- Generate Markdown reports
- Send report notifications

## Installation

The reporting utilities are included in the Playwright framework. No additional installation is required.

## Basic Usage

```javascript
const { generateHtmlReport } = require('../src/utils/reporting/reportingUtils');

// Generate HTML report
const reportPath = await generateHtmlReport({
  results: testResults,
  outputDir: './reports/html',
  title: 'Test Report'
});

console.log(`Report generated at: ${reportPath}`);
```

## API Reference

### HTML Reports

#### generateHtmlReport(options)

Generates an HTML report from test results.

```javascript
const reportPath = await generateHtmlReport({
  results: testResults,
  outputDir: './reports/html',
  outputFile: 'report.html',
  title: 'Test Report',
  includeScreenshots: true,
  includeVideos: true,
  includeTraces: true,
  includeLogs: true,
  customData: { environment: 'staging' }
});
```

### Allure Reports

#### generateAllureReport(options)

Generates an Allure report from test results.

```javascript
const reportPath = await generateAllureReport({
  resultsDir: './allure-results',
  outputDir: './reports/allure'
});
```

#### openAllureReport(reportDir)

Opens an Allure report in the default browser.

```javascript
await openAllureReport('./reports/allure');
```

### JUnit XML Reports

#### generateJUnitReport(options)

Generates a JUnit XML report from test results.

```javascript
const reportPath = await generateJUnitReport({
  resultsDir: './test-results',
  reportPath: './reports/junit/junit.xml'
});
```

### Markdown Reports

#### generateMarkdownReport(options)

Generates a Markdown report from test results.

```javascript
const reportPath = await generateMarkdownReport({
  resultsDir: './test-results',
  reportPath: './reports/markdown/report.md'
});
```

### Processing Results

#### processPlaywrightResults(results)

Processes Playwright test results into a format suitable for reporting.

```javascript
const processedResults = processPlaywrightResults(playwrightResults);
```

### Notifications

#### sendReportNotification(options)

Sends a notification about a report.

```javascript
await sendReportNotification({
  type: 'slack',
  reportUrl: 'https://example.com/report',
  stats: {
    passed: 10,
    failed: 2,
    skipped: 1
  },
  recipients: ['#test-channel']
});
```

## CLI Integration

The reporting utilities are integrated with the CLI commands:

### test-report

Generates test reports from test results.

```bash
npx playwright-framework test-report --types html,markdown,junit --output-dir ./reports
```

### generate-report

Generates an Allure report from test results.

```bash
npx playwright-framework generate-report
```

## Migration Guide

If you're using the older reporting utilities (`generateReport.js` or `reportUtils.js`), you should migrate to the new unified reporting utilities (`reportingUtils.js`).

### From generateReport.js

```javascript
// Old
const { generateReport } = require('../src/utils/reporting/generateReport');

// New
const { generateHtmlReport } = require('../src/utils/reporting/reportingUtils');
```

### From reportUtils.js

```javascript
// Old
const ReportUtils = require('../src/utils/reporting/reportUtils');
ReportUtils.generateHtmlReport(options);

// New
const { generateHtmlReport } = require('../src/utils/reporting/reportingUtils');
generateHtmlReport(options);
```

## Examples

See the [test-report.js](../src/cli/commands/test-report.js) and [generate-report.js](../src/cli/commands/generate-report.js) files for complete examples of how to use these utilities.