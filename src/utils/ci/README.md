# CI Utilities

This directory contains utilities for CI/CD integration with the Playwright framework.

## Core Files

- `ciUtils.js` - Main CI utilities for GitHub Actions, Jenkins, and GitLab
- `testCoverageAnalyzer.js` - Analyzes test coverage and identifies gaps
- `testQualityDashboard.js` - Generates a dashboard with test quality metrics
- `testSelector.js` - Selects tests based on Git diffs for smart test selection
- `index.js` - Exports all CI utilities

## Usage

```javascript
// Import all utilities
const ci = require('../src/utils/ci');

// Or import specific utilities
const { CIUtils, TestCoverageAnalyzer } = require('../src/utils/ci');

// Create CI utilities
const ciUtils = new CIUtils();

// Generate GitHub Actions workflow
const workflowPath = ciUtils.generateGitHubWorkflow({
  name: 'Playwright Tests',
  browsers: ['chromium', 'firefox', 'webkit']
});

// Analyze test coverage
const coverageAnalyzer = new TestCoverageAnalyzer();
const coverage = await coverageAnalyzer.analyzeCoverage();
await coverageAnalyzer.generateHtmlReport(coverage, 'reports/coverage.html');

// Generate test quality dashboard
const dashboard = new TestQualityDashboard();
await dashboard.addTestRun({
  summary: {
    total: 100,
    passed: 95,
    failed: 3,
    skipped: 2,
    duration: 60000,
    passRate: 95
  }
});
await dashboard.generateDashboard('reports/dashboard.html');

// Select tests based on Git diffs
const testSelector = new TestSelector();
const changedTests = testSelector.selectTestsByDiff('main', 'HEAD');
```