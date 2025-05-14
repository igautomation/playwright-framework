# Test Framework Verification

This document provides instructions on how to verify that the test framework is working correctly.

## Prerequisites

Before running the tests, make sure you have installed the required dependencies:

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running the Verification Test

To verify that the test framework is working correctly, run the following command:

```bash
node verify-framework.js
```

This will run a simple verification test that confirms the test framework is working correctly.

## Running All Tests

To run all tests in the repository, use the following command:

```bash
npm test
```

This will run all Playwright tests in the repository.

## Running Tests in Headed Mode

To run tests in headed mode (with browser UI visible), use:

```bash
npm run test:headed
```

## Running Tests in Debug Mode

To run tests in debug mode, use:

```bash
npm run test:debug
```

## Running Tests with UI

To run tests with the Playwright UI, use:

```bash
npm run test:ui
```

## Troubleshooting

If you encounter any issues running the tests, try the following:

1. Make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. Make sure Playwright browsers are installed:
   ```bash
   npx playwright install
   ```

3. Check for any error messages in the console output.

4. Try running a specific test file:
   ```bash
   npx playwright test src/tests/verification-test.spec.js
   ```

5. If you're still having issues, please refer to the [Playwright documentation](https://playwright.dev/docs/intro) for more information.