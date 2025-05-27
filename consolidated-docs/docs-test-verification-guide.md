<!-- Source: /Users/mzahirudeen/playwright-framework/docs/test-verification-guide.md -->

# Test Verification Guide

This guide explains how to verify that all tests in the framework are functioning correctly.

## Overview

The framework includes comprehensive test verification capabilities that allow you to:

1. Verify that all unit tests are working correctly
2. Verify that all Playwright tests are working correctly
3. Validate the framework's health and functionality
4. Verify test files for best practices and quality standards
5. Generate reports on test verification results

## Quick Start

To run a comprehensive verification of all tests:

```bash
npm run test:verify
```

This command will:
1. Run all Jest unit tests
2. Run all Playwright tests
3. Run the framework validation
4. Verify test files for best practices
5. Generate an HTML report with the results

## Available Commands

### NPM Scripts

The following NPM scripts are available for test verification:

- `npm run test:unit`: Run Jest unit tests
- `npm run test`: Run Playwright tests
- `npm run validate:framework`: Run framework validation
- `npm run verify`: Verify test files for best practices
- `npm run verify:all-tests`: Run all tests (unit tests, Playwright tests, and framework validation)
- `npm run test:verify`: Run comprehensive test verification with HTML report generation

### CLI Commands

The framework includes CLI commands for test verification:

```bash
# Verify test files for best practices
npx pw-framework verify-tests

# Verify test files with HTML report
npx pw-framework verify-tests --generate-report

# Verify test files with specific directory and pattern
npx pw-framework verify-tests --dir src/tests/api --pattern "**/*.spec.js"

# Run comprehensive verification of all tests
npx pw-framework verify-all-tests

# Run comprehensive verification with HTML report
npx pw-framework verify-all-tests --generate-report

# Run comprehensive verification with verbose output
npx pw-framework verify-all-tests --verbose
```

## Test File Verification

The test file verification checks for the following:

### Basic Checks

- File size (warns if too large)
- Import of Playwright test framework
- Presence of test declarations
- Commented out tests
- Skipped tests (`test.skip`)
- Exclusive tests (`test.only`)
- Presence of assertions
- Proper test isolation (beforeEach/afterEach hooks)
- Hardcoded credentials
- Magic numbers
- Test timeouts
- Proper error handling

### Advanced Checks

- Test description quality (length, uniqueness)
- Nested tests (which Playwright doesn't support)
- Test organization (use of describe blocks)
- Test structure and best practices

## HTML Reports

The test verification commands can generate HTML reports with detailed information about the verification results.

### Test File Verification Report

The test file verification report includes:

- Summary of files analyzed
- Number of tests found
- Number of passed and failed checks
- Number of warnings
- Detailed list of issues found in each file

### Comprehensive Verification Report

The comprehensive verification report includes:

- Unit test results
- Playwright test results
- Framework validation results
- Test file verification results

## GitHub Workflow Integration

The framework includes GitHub workflow files for test verification:

- `verify-all-tests.yml`: Runs comprehensive test verification
- `framework-validation.yml`: Validates the framework
- `playwright.yml`: Runs Playwright tests
- `test-workflow.yml`: Runs tests in CI/CD

To manually trigger the test verification workflow:

1. Go to the GitHub repository
2. Click on the "Actions" tab
3. Select "Verify All Tests" from the list of workflows
4. Click "Run workflow"
5. Select the branch to run on
6. Click "Run workflow"

## Troubleshooting

If test verification fails, check the following:

1. Make sure all dependencies are installed:
   ```bash
   npm ci
   ```

2. Make sure Playwright browsers are installed:
   ```bash
   npx playwright install
   ```

3. Check for environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with appropriate values
   ```

4. Run tests individually to identify the issue:
   ```bash
   npm run test:unit
   npm run test
   npm run validate:framework
   npm run verify
   ```

5. Check the HTML reports for detailed information:
   ```bash
   # Open the test verification report
   open reports/verification/test-verification-report.html
   
   # Open the comprehensive verification report
   open reports/verification/verification-report.html
   ```

## Best Practices

1. Run test verification before submitting pull requests
2. Include test verification in CI/CD pipelines
3. Keep test verification reports for historical analysis
4. Address any issues identified by test verification promptly
5. Use the `--generate-report` option to create detailed HTML reports
6. Review test files with warnings and errors to improve test quality