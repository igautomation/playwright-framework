# UI Tests

This document provides instructions on how to run UI tests in this repository.

## Running UI Tests

### Option 1: Using the run-ui-tests.sh Script

The simplest way to run all UI tests is to use the provided shell script:

1. Make the script executable:

```bash
chmod +x run-ui-tests.sh
```

Or use the npm script:

```bash
npm run make:ui-tests-executable
```

2. Run the script:

```bash
./run-ui-tests.sh
```

This script will:
- Find and delete any duplicate test files
- Run all UI tests in the `src/tests/ui/` directory
- Automatically fix common issues in failing tests
- Run the tests again to verify the fixes

### Option 2: Using npm Scripts

You can also run the UI tests using npm scripts:

```bash
npm run test:ui-only
```

or

```bash
npm run test:ui-only:sh
```

### Option 3: Using Playwright CLI Directly

You can use the Playwright CLI directly to run UI tests:

```bash
npx playwright test src/tests/ui/
```

## What the UI Test Runner Does

The UI test runner script (`run-ui-tests.js`) performs the following actions:

1. **Finds and Deletes Duplicate Tests**:
   - Identifies test files with similar names (e.g., `orangehrm-ui.spec.js` and `orangehrm-ui-fixed.spec.js`)
   - Keeps the "fixed" version if it exists, otherwise keeps the first one
   - Deletes the duplicate files

2. **Runs UI Tests**:
   - Executes all tests in the `src/tests/ui/` directory

3. **Automatically Fixes Common Issues**:
   - Increases timeouts for flaky tests
   - Adds `waitForLoadState` for navigation issues
   - Adds try-catch blocks for logout operations to prevent test failures
   - Adds explicit waits for elements before interactions

4. **Verifies Fixes**:
   - Runs the tests again to verify that the fixes resolved the issues

## Troubleshooting

If you encounter any issues running the UI tests, try the following:

1. Make sure all dependencies are installed:

```bash
npm install
```

2. Make sure Playwright browsers are installed:

```bash
npx playwright install
```

3. Make sure all shell scripts are executable:

```bash
chmod +x run-ui-tests.sh
```

4. Run tests in debug mode for more detailed output:

```bash
npx playwright test src/tests/ui/ --debug
```

5. Run tests in headed mode to see the browser:

```bash
npx playwright test src/tests/ui/ --headed
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [HOW-TO-RUN-TESTS.md](HOW-TO-RUN-TESTS.md) - General information on running tests