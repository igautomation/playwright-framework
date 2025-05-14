# Performance Tests

This document explains how to run the performance tests in this project.

## Overview

The performance tests are designed to measure and validate the performance characteristics of web applications. These tests use Playwright's capabilities along with custom utilities to measure metrics such as:

- Page load time
- Time to first byte (TTFB)
- DOM content loaded time
- Resource loading performance
- User interaction performance
- Code coverage

## Running Performance Tests

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Playwright installed (`npm install`)

### Make the Script Executable

Before running the tests, make sure the script is executable:

```bash
chmod +x run-performance-tests.sh
```

### Run All Performance Tests

To run all performance tests:

```bash
npm run test:performance
```

Or directly:

```bash
./run-performance-tests.sh
```

### Run Specific Performance Tests

To run specific performance tests, you can use the Playwright test runner with the `@performance` tag:

```bash
npx playwright test --grep="@performance" --project=chromium
```

## Test Reports

Performance test reports are generated in the following locations:

- HTML report: `playwright-report/index.html`
- Performance metrics: `reports/performance/`
- Traces: `traces/`

## Performance Test Structure

The performance tests are located in the `src/tests/performance` directory. The main test file is `performanceTest.spec.js`, which contains tests for:

1. Page load performance
2. User interaction performance
3. Performance test suite execution
4. Code coverage measurement

## Performance Utilities

The tests use two utility classes:

1. `PerformanceUtils` (in `src/utils/performance/performanceUtils.js`) - Main utility for measuring performance metrics
2. `WebPerformanceUtils` (in `src/utils/web/performanceUtils.js`) - Simplified utility for basic web performance measurements

## Customizing Tests

You can customize the performance tests by:

1. Modifying the thresholds in the test assertions
2. Adding new test scenarios
3. Changing the test URLs
4. Adjusting the performance measurement options

## Troubleshooting

If you encounter issues running the performance tests:

1. Make sure all dependencies are installed
2. Check that the script is executable
3. Verify that the directories for reports exist
4. Check the browser installation with `npx playwright install`

For more information, refer to the Playwright documentation on performance testing.