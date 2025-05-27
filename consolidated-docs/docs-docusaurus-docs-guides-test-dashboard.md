<!-- Source: /Users/mzahirudeen/playwright-framework/docs/docusaurus/docs/guides/test-dashboard.md -->

---
sidebar_position: 7
---

# Test Quality Dashboard

The Playwright Framework includes a test quality dashboard that helps you track test metrics over time and identify areas for improvement.

## Overview

The test quality dashboard provides:

- **Historical Trends**: Track pass/fail rates over time
- **Test Execution Time**: Monitor test execution time trends
- **Flaky Tests**: Identify and track flaky tests
- **Coverage Trends**: Track coverage metrics over time
- **Visual Reports**: Interactive charts and graphs

## Generating the Dashboard

You can generate the test quality dashboard using the CLI:

```bash
npm run dashboard
# or
npx playwright-framework test-dashboard --add-run --open
```

### Options

```bash
npx playwright-framework test-dashboard [options]

Options:
  -d, --data-dir <directory>     Dashboard data directory
  -o, --output <path>            Output file path
  --add-run                      Add current test run to dashboard
  -r, --results-dir <directory>  Test results directory
  --run-id <id>                  Run ID
  --history-size <size>          Number of runs to keep in history
  --open                         Open dashboard after generation
```

## Dashboard Features

### Pass/Fail Trends

The dashboard shows pass/fail trends over time, allowing you to:

- Track overall test stability
- Identify periods of regression
- Monitor the impact of code changes on test stability

![Pass/Fail Trends](../assets/dashboard-pass-fail.png)

### Test Execution Time

The dashboard tracks test execution time, helping you:

- Identify slow tests
- Monitor performance trends
- Detect performance regressions

![Test Execution Time](../assets/dashboard-execution-time.png)

### Flaky Tests

The dashboard identifies flaky tests, which:

- Pass and fail inconsistently
- Require special attention
- May indicate issues in the application or test code

![Flaky Tests](../assets/dashboard-flaky-tests.png)

### Coverage Trends

The dashboard tracks coverage metrics over time, showing:

- File coverage percentage
- Function coverage percentage
- Line coverage percentage
- Branch coverage percentage

![Coverage Trends](../assets/dashboard-coverage.png)

### Test Run History

The dashboard maintains a history of test runs, including:

- Run ID
- Timestamp
- Pass rate
- Number of tests
- Execution time

![Test Run History](../assets/dashboard-history.png)

## Adding Test Runs

You can add the current test run to the dashboard:

```bash
npx playwright-framework test-dashboard --add-run
```

This will:

1. Collect test results from the latest run
2. Calculate metrics (pass rate, execution time, etc.)
3. Add the run to the dashboard history
4. Update the dashboard visualizations

### Custom Run ID

You can specify a custom run ID:

```bash
npx playwright-framework test-dashboard --add-run --run-id "release-1.0"
```

### Custom Results Directory

You can specify a custom results directory:

```bash
npx playwright-framework test-dashboard --add-run --results-dir "custom-results"
```

## Integrating with CI/CD

You can integrate the dashboard with your CI/CD pipeline:

### GitHub Actions

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - run: npm run dashboard -- --add-run --run-id "gh-${{ github.run_id }}"
      - name: Upload dashboard
        uses: actions/upload-artifact@v3
        with:
          name: test-dashboard
          path: reports/dashboard
```

### Jenkins

```groovy
stage('Dashboard') {
    steps {
        sh 'npm run dashboard -- --add-run --run-id "jenkins-${BUILD_NUMBER}"'
    }
    post {
        always {
            archiveArtifacts artifacts: 'reports/dashboard/**/*', allowEmptyArchive: true
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/dashboard',
                reportFiles: 'index.html',
                reportName: 'Test Dashboard'
            ])
        }
    }
}
```

## Customizing the Dashboard

### Data Directory

You can specify a custom data directory:

```bash
npx playwright-framework test-dashboard --data-dir "custom-data"
```

### Output Path

You can specify a custom output path:

```bash
npx playwright-framework test-dashboard --output "custom-dashboard/index.html"
```

### History Size

You can limit the number of runs in the history:

```bash
npx playwright-framework test-dashboard --history-size 20
```

## Best Practices

### Regular Updates

- Add test runs to the dashboard regularly
- Use consistent run IDs for better tracking
- Keep the dashboard updated with each CI/CD build

### Data Analysis

- Review the dashboard regularly to identify trends
- Investigate spikes in failure rates
- Address flaky tests promptly
- Monitor test execution time trends

### Sharing the Dashboard

- Make the dashboard accessible to the team
- Include the dashboard link in CI/CD notifications
- Review the dashboard in team meetings

## Troubleshooting

### Common Issues

1. **Missing Test Results**

   Solution: Verify that the test results directory exists and contains valid results:
   ```bash
   npx playwright-framework test-dashboard --results-dir "path/to/results"
   ```

2. **Dashboard Not Updating**

   Solution: Check that the `--add-run` flag is used and that the data directory is writable:
   ```bash
   npx playwright-framework test-dashboard --add-run --data-dir "path/to/data"
   ```

3. **Inconsistent Metrics**

   Solution: Ensure that all test runs use the same configuration and environment.

4. **Dashboard Not Opening**

   Solution: Use the `--open` flag or manually open the HTML file:
   ```bash
   npx playwright-framework test-dashboard --open
   ```