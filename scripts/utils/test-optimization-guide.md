# Test Optimization Guide

This guide explains how to use the optimized testing features in the Playwright framework.

## Optimized Configuration

The `playwright.config.js` file has been optimized with:

- **Parallel execution**: Tests run in parallel by default
- **Timeouts**: Appropriate timeouts for actions and expectations
- **Project filtering**: Tests are organized into projects by browser
- **Resource optimization**: Screenshots and videos only on failure
- **Test categorization**: Tests can be tagged as `@fast` or `@slow`

## Optimized Fixtures

The `src/tests/fixtures/optimized-fixtures.js` file provides:

- **Authenticated page**: Reuse authentication state between tests
- **API client**: Shared API client for API tests
- **Test data**: Load test data once for all tests

## Running Optimized Tests

Use these npm scripts to run optimized tests:

```bash
# Run all optimized tests
npm run test:optimized

# Run only fast tests
npm run test:fast

# Run only slow tests
npm run test:slow

# Run tests only in Chromium
npm run test:chromium

# Run tests only in Firefox
npm run test:firefox

# Run tests only in WebKit
npm run test:webkit

# Run tests on mobile browsers
npm run test:mobile

# Run tests with high parallelization
npm run test:parallel
```

## Custom Test Runs

You can customize test runs with the `run-optimized-tests.sh` script:

```bash
# Run with 6 workers
./scripts/runners/run-optimized-tests.sh --workers=6

# Run specific test pattern
./scripts/runners/run-optimized-tests.sh --grep="login"

# Run tests in shards (for CI)
./scripts/runners/run-optimized-tests.sh --shard=1/3
```

## Writing Optimized Tests

Follow these practices when writing tests:

1. **Use fixtures** for shared resources:
   ```javascript
   test('example test', async ({ authenticatedPage }) => {
     // Test using pre-authenticated page
   });
   ```

2. **Tag tests** for selective running:
   ```javascript
   test('fast test @fast', async ({ page }) => {
     // Fast test implementation
   });
   
   test('slow test @slow', async ({ page }) => {
     // Slow test implementation
   });
   ```

3. **Skip tests conditionally**:
   ```javascript
   test('browser specific test', async ({ page, browserName }) => {
     test.skip(browserName !== 'chromium', 'Chromium only test');
     // Test implementation
   });
   ```

4. **Use beforeAll** for shared setup:
   ```javascript
   test.beforeAll(async ({ browser }) => {
     // Setup that runs once before all tests
   });
   ```

5. **Set appropriate timeouts** for slow operations:
   ```javascript
   test('test with long operation', async ({ page }) => {
     test.setTimeout(60000);
     // Test with long-running operation
   });
   ```