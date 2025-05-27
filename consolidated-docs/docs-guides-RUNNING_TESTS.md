<!-- Source: /Users/mzahirudeen/playwright-framework/docs/guides/RUNNING_TESTS.md -->

# Running Tests

This guide explains how to run tests in the Playwright test framework.

## Basic Test Commands

Run all tests:
```bash
npm test
```

Run tests in headed mode:
```bash
npm run test:headed
```

Run tests with UI mode:
```bash
npm run test:ui
```

## Running Specific Test Types

### Smoke Tests
```bash
npm run test:smoke
```

### API Tests
```bash
npm run test:api
```

### Visual Tests
```bash
npm run test:visual
```

### Accessibility Tests
```bash
npm run test:accessibility
```

### Performance Tests
```bash
npm run test:performance
```

### End-to-End Tests
```bash
npm run test:e2e
```

## Running Specific Test Files

Run a specific test file:
```bash
npx playwright test path/to/test.spec.js
```

Run tests matching a pattern:
```bash
npx playwright test -g "pattern"
```

## Test Configuration

Tests are configured in `playwright.config.js`. Key configurations:

- **Projects**: Different browser configurations
- **Reporters**: Test reporting options
- **Timeouts**: Test and action timeouts
- **Retries**: Number of retries for failed tests

## Viewing Reports

After running tests, you can view the HTML report:
```bash
npm run report
```

This will open the HTML report in your default browser.

## Debugging Tests

To debug tests:

1. Run in headed mode:
   ```bash
   npx playwright test --headed
   ```

2. Use debug mode:
   ```bash
   npx playwright test --debug
   ```

3. Use UI mode for interactive debugging:
   ```bash
   npx playwright test --ui
   ```

## CI/CD Integration

The framework includes GitHub workflow configurations for CI/CD integration. See the `.github/workflows` directory for details.