<!-- Source: /Users/mzahirudeen/playwright-framework/docs/docusaurus/docs/api/cli.md -->

---
sidebar_position: 1
---

# CLI Reference

The Playwright Framework provides a comprehensive command-line interface (CLI) for test execution, verification, and management.

## Command Structure

The CLI commands follow this structure:

```bash
npx playwright-framework <command> [options]
```

## Available Commands

### Test Execution

These commands are used to run tests:

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui

# Run specific test file
npx playwright test path/to/test.spec.js

# Run tests with specific tag
npx playwright test --grep @smoke

# Run tests in specific project
npx playwright test --project=chromium

# List all available tests
npx playwright test --list

# Run tests in parallel
npx playwright test --workers=4

# Run tests with specific reporter
npx playwright test --reporter=html

# Run tests with specific configuration
npx playwright test --config=custom-config.js

# Run tests with specific timeout
npx playwright test --timeout=60000

# Run tests with retries
npx playwright test --retries=3

# Run tests with specific shard
npx playwright test --shard=1/3
```

### Test Verification

These commands are used to verify and lint tests:

```bash
# Verify test files for best practices
npm run verify
# or with options
npx playwright-framework verify-tests --dir src/tests --pattern "**/*.spec.js"

# Lint test files
npm run lint
# or with options
npx playwright-framework test-lint --dir src/tests --pattern "**/*.spec.js"

# Lint test files and fix issues automatically
npm run lint:fix
# or with options
npx playwright-framework test-lint --dir src/tests --pattern "**/*.spec.js" --fix
```

### Test Coverage

These commands are used to analyze test coverage:

```bash
# Analyze test coverage
npm run coverage
# or with options
npx playwright-framework test-coverage-analyze --test-dir src/tests --source-dir src --threshold 80 --open
```

### Reporting

These commands are used to generate reports:

```bash
# Generate test reports
npm run report
# or with options
npx playwright-framework test-report --output-dir reports --types html,json,markdown --open

# Generate test quality dashboard
npm run dashboard
# or with options
npx playwright-framework test-dashboard --add-run --open
```

### CI/CD Integration

These commands are used to set up CI/CD integration:

```bash
# Set up CI/CD integration
npm run ci:setup
# or with options
npx playwright-framework ci-setup --system github --name "Playwright Tests"
```

### Framework Utilities

These commands are used for framework utilities:

```bash
# Run framework self-test
npm run self-test
```

## Command Options

### verify-tests

```bash
npx playwright-framework verify-tests [options]

Options:
  -d, --dir <directory>    Test directory to verify
  -p, --pattern <pattern>  File pattern to match
  --ignore-errors          Continue even if errors are found
```

### test-lint

```bash
npx playwright-framework test-lint [options]

Options:
  -d, --dir <directory>    Test directory to lint
  -p, --pattern <pattern>  File pattern to match
  --fix                    Automatically fix issues when possible
  --ignore-errors          Continue even if errors are found
```

### test-report

```bash
npx playwright-framework test-report [options]

Options:
  -o, --output-dir <directory>   Output directory for reports
  -t, --types <types>            Report types to generate (comma-separated)
  -r, --results-dir <directory>  Test results directory
  --open                         Open reports after generation
  -v, --verbose                  Show verbose output
```

### test-coverage-analyze

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

### ci-setup

```bash
npx playwright-framework ci-setup [options]

Options:
  -s, --system <system>         CI system (github, jenkins, gitlab)
  -n, --name <name>             Workflow/pipeline name
  -b, --branches <branches>     Comma-separated list of branches to trigger on
  --node-version <version>      Node.js version
  --test-command <command>      Test command
  --report-command <command>    Report command
```

### test-dashboard

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

## Help Commands

Get help for any command:

```bash
# Show main help
npx playwright-framework --help

# Show help for specific command
npx playwright-framework verify-tests --help
npx playwright-framework test-lint --help
npx playwright-framework test-report --help
npx playwright-framework test-coverage-analyze --help
npx playwright-framework ci-setup --help
npx playwright-framework test-dashboard --help
```

## Environment Variables

The CLI respects the following environment variables:

```
# URLs
BASE_URL=https://example.com
API_URL=https://api.example.com

# Authentication
USERNAME=testuser
PASSWORD=testpass
API_KEY=your-api-key
AUTH_TOKEN=your-auth-token

# Timeouts (in milliseconds)
DEFAULT_TIMEOUT=30000
SHORT_TIMEOUT=5000
LONG_TIMEOUT=60000
PAGE_LOAD_TIMEOUT=30000
ANIMATION_TIMEOUT=1000

# Test Data
TEST_DATA_PATH=src/data

# Visual Testing
VISUAL_BASELINE_DIR=visual-baselines
VISUAL_DIFF_DIR=visual-diffs
VISUAL_THRESHOLD=0.1

# Browser Configuration
HEADLESS=true
SLOW_MO=0
DEFAULT_BROWSER=chromium

# Reporting
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
ALLURE_RESULTS_DIR=allure-results

# Feature Flags
SELF_HEALING=true
RETRY_ON_FAILURE=true
PARALLEL_EXECUTION=true
```

## Examples

### Running Tests with Tags

```bash
# Run smoke tests
npx playwright test --grep @smoke

# Run regression tests but exclude slow tests
npx playwright test --grep @regression --grep-invert @slow
```

### Generating Reports

```bash
# Generate HTML report
npx playwright-framework test-report --types html --open

# Generate multiple report types
npx playwright-framework test-report --types html,json,markdown
```

### Setting Up CI/CD

```bash
# Set up GitHub Actions
npx playwright-framework ci-setup --system github --name "Playwright Tests" --branches main,develop

# Set up Jenkins
npx playwright-framework ci-setup --system jenkins --name "Playwright Tests" --test-command "npm test" --report-command "npm run report"
```