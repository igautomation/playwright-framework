<!-- Source: /Users/mzahirudeen/playwright-framework/docs/docusaurus/docs/advanced/test-coverage-analysis.md -->

---
sidebar_position: 3
---

# Test Coverage Analysis

The Playwright Framework includes a test coverage analyzer that examines the relationship between your tests and source code without requiring instrumentation.

## Overview

Traditional code coverage tools require code instrumentation, which can be slow and may affect runtime behavior. The Playwright Framework's test coverage analyzer takes a different approach:

1. Analyzes test files to identify imports and dependencies
2. Maps tests to source files based on imports
3. Calculates coverage metrics
4. Identifies gaps in coverage
5. Generates reports with recommendations

## Running the Coverage Analysis

You can run the coverage analysis using the CLI:

```bash
npm run coverage
# or
npx playwright-framework test-coverage-analyze --test-dir src/tests --source-dir src --threshold 80
```

### Options

```bash
npx playwright-framework test-coverage-analyze [options]

Options:
  --test-dir <directory>        Test directory
  --source-dir <directory>      Source directory to analyze
  -o, --output-dir <directory>  Output directory for coverage reports
  -t, --threshold <percentage>  Coverage threshold percentage
  --exclude <patterns>          Comma-separated patterns to exclude
  --ignore-threshold            Continue even if coverage is below threshold
  --open                        Open coverage report after generation
```

## How It Works

### 1. Test File Analysis

The analyzer scans test files to identify:

- Imported modules
- Required files
- Referenced classes and functions

```javascript
// Example test file
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ApiUtils } = require('../utils/api/apiUtils');

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('username', 'password');
  // ...
});
```

In this example, the analyzer identifies dependencies on `LoginPage` and `ApiUtils`.

### 2. Source File Mapping

The analyzer maps test files to source files based on imports:

```
Test File: src/tests/login.spec.js
  ↳ Source File: src/pages/LoginPage.js
  ↳ Source File: src/utils/api/apiUtils.js
```

### 3. Coverage Calculation

The analyzer calculates coverage metrics:

- **File Coverage**: Percentage of source files covered by tests
- **Test Density**: Average number of tests per covered file
- **Coverage Distribution**: How evenly tests cover the codebase

### 4. Gap Identification

The analyzer identifies gaps in coverage:

- **Untested Files**: Source files with no associated tests
- **Low Coverage Files**: Source files with minimal test coverage
- **Important Untested Files**: Critical files that lack tests

### 5. Report Generation

The analyzer generates reports in multiple formats:

- **JSON Report**: Machine-readable coverage data
- **HTML Report**: Interactive visual report
- **Console Summary**: Quick overview in the terminal

## Understanding the Reports

### Console Summary

The console summary provides a quick overview of coverage metrics:

```
📊 Test Coverage Summary
File coverage: 78.5%
Total files: 120
Covered files: 94
Uncovered files: 26

📋 Recommendations:
  ❗ File coverage (78.5%) is below threshold (80%)
  ❗ 5 important files have no tests
  ⚠️ 12 files have minimal test coverage (only one test)

❌ 26 files have no tests
  - src/utils/api/apiUtils.js
  - src/utils/reporting/reportUtils.js
  ...
```

### HTML Report

The HTML report provides an interactive visualization of coverage:

![HTML Report](../assets/coverage-report.png)

Features include:
- Coverage metrics with visual indicators
- List of untested files
- List of files with low coverage
- Recommendations for improvement
- File-level details

### JSON Report

The JSON report provides machine-readable coverage data:

```json
{
  "timestamp": "2023-06-15T10:30:45.123Z",
  "metrics": {
    "totalFiles": 120,
    "coveredFiles": 94,
    "uncoveredFiles": 26,
    "fileCoverage": 78.5,
    "testDensity": 2.3,
    "meetsCoverageThreshold": false
  },
  "gaps": {
    "untestedCount": 26,
    "lowCoverageCount": 12,
    "recommendations": [
      {
        "type": "coverage",
        "message": "File coverage (78.5%) is below threshold (80%)",
        "priority": "high"
      },
      {
        "type": "important",
        "message": "5 important files have no tests",
        "files": ["src/utils/api/apiUtils.js", "..."],
        "priority": "high"
      }
    ]
  },
  "details": {
    "untested": ["src/utils/api/apiUtils.js", "..."],
    "lowCoverage": ["src/utils/web/webInteractions.js", "..."]
  }
}
```

## Integrating with CI/CD

You can integrate the coverage analysis with your CI/CD pipeline:

### GitHub Actions

```yaml
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run coverage -- --threshold 80
      - name: Upload coverage report
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: reports/coverage
```

### Jenkins

```groovy
stage('Coverage') {
    steps {
        sh 'npm run coverage -- --threshold 80'
    }
    post {
        always {
            archiveArtifacts artifacts: 'reports/coverage/**/*', allowEmptyArchive: true
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/coverage',
                reportFiles: 'coverage-report.html',
                reportName: 'Coverage Report'
            ])
        }
    }
}
```

## Best Practices

### Setting Appropriate Thresholds

- Start with a realistic threshold based on your current coverage
- Gradually increase the threshold as you add more tests
- Consider different thresholds for different parts of the codebase

### Prioritizing Test Coverage

- Focus on critical business logic first
- Prioritize code that changes frequently
- Address important untested files before low-coverage files

### Regular Analysis

- Run coverage analysis regularly, not just in CI/CD
- Track coverage trends over time
- Use the dashboard to visualize coverage trends

### Excluding Files

You can exclude files from the analysis:

```bash
npx playwright-framework test-coverage-analyze --exclude "node_modules,dist,build,coverage"
```

## Troubleshooting

### Common Issues

1. **Missing Dependencies**

   Solution: Ensure all dependencies are installed:
   ```bash
   npm install --save glob
   ```

2. **Incorrect Mapping**

   Solution: Check import paths in test files and ensure they match source files.

3. **Low Coverage Despite Tests**

   Solutions:
   - Check that tests are importing the correct modules
   - Ensure tests are actually using the imported modules
   - Verify that test files have the correct naming pattern (e.g., `.spec.js`)

4. **Report Generation Fails**

   Solution: Check that the output directory exists and is writable:
   ```bash
   mkdir -p reports/coverage
   npx playwright-framework test-coverage-analyze --output-dir reports/coverage
   ```