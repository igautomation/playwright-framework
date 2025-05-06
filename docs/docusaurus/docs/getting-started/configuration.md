---
sidebar_position: 4
---

# Configuration

This guide explains how to configure the Playwright Framework for your specific needs.

## Configuration Files

The framework uses several configuration files:

1. **`.env`**: Environment variables for runtime configuration
2. **`playwright.config.js`**: Playwright-specific configuration
3. **`package.json`**: NPM scripts and dependencies

### Environment Variables (`.env`)

The `.env` file contains environment-specific configuration. Here's an example:

```
# Base URLs for different environments
BASE_URL=https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
API_URL=https://petstore.swagger.io/v2

# Test credentials
USERNAME=Admin
PASSWORD=admin123

# Browser configuration
BROWSER=chromium
HEADLESS=true

# Test configuration
RETRIES=1
WORKERS=50%
TIMEOUT=30000
EXPECT_TIMEOUT=10000

# Reporting configuration
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
TRACE_ON_FAILURE=true

# CI/CD configuration
CI=false

# Jira/Xray configuration
JIRA_BASE_URL=https://your-jira-instance.atlassian.net
JIRA_API_TOKEN=your-jira-api-token
JIRA_USERNAME=your-jira-username
JIRA_PROJECT_KEY=TEST
```

You can create different `.env` files for different environments:

- `.env.dev`
- `.env.qa`
- `.env.staging`
- `.env.prod`

To use a specific environment file:

```bash
cp .env.qa .env
npx framework test
```

### Playwright Configuration (`playwright.config.js`)

The `playwright.config.js` file contains Playwright-specific configuration:

```javascript
const { devices } = require('@playwright/test');
const path = require('path');
require('dotenv-safe').config({
  path: path.resolve(__dirname, '../../.env'),
  example: path.resolve(__dirname, '../../.env.example'),
  allowEmptyValues: true,
  silent: true,
});

module.exports = {
  testDir: '../tests',
  timeout: parseInt(process.env.TIMEOUT) || 30000,
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT) || 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : parseInt(process.env.RETRIES) || 1,
  workers: process.env.CI ? 4 : process.env.WORKERS || '50%',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../reports/html' }],
    ['allure-playwright', { outputFolder: '../../allure-results' }],
    ['json', { outputFile: '../../reports/test-results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: process.env.TRACE_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
    screenshot:
      process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
    headless: process.env.HEADLESS === 'true',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],
  globalSetup: '../utils/setup/globalSetup.js',
  globalTeardown: '../utils/setup/globalTeardown.js',
  outputDir: '../../test-results',
};
```

### NPM Scripts (`package.json`)

The `package.json` file contains NPM scripts for common tasks:

```json
{
  "scripts": {
    "test": "node src/cli/index.js test",
    "test:ui": "playwright test --ui",
    "test:headed": "node src/cli/index.js test --headed",
    "test:visual": "node src/cli/index.js test --tags @visual",
    "test:smoke": "node src/cli/index.js test --tags @smoke",
    "test:regression": "node src/cli/index.js test --tags @regression",
    "test:api": "node src/cli/index.js test --tags @api",
    "test:list": "node src/cli/index.js test --list",
    "report": "playwright show-report",
    "report:allure": "allure generate ./allure-results --clean && allure open",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

## Configuration Options

### Browser Configuration

You can configure which browsers to use for testing:

```javascript
// In playwright.config.js
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
];
```

To run tests in a specific browser:

```bash
npx framework test --project=firefox
```

### Parallel Execution

You can configure the number of parallel workers:

```javascript
// In playwright.config.js
workers: process.env.CI ? 4 : process.env.WORKERS || '50%',
```

Or via the command line:

```bash
npx framework test --workers=4
```

### Retries

You can configure the number of retries for failed tests:

```javascript
// In playwright.config.js
retries: process.env.CI ? 2 : parseInt(process.env.RETRIES) || 1,
```

Or via the command line:

```bash
npx framework test --retries=2
```

### Timeouts

You can configure various timeouts:

```javascript
// In playwright.config.js
timeout: parseInt(process.env.TIMEOUT) || 30000,
expect: {
  timeout: parseInt(process.env.EXPECT_TIMEOUT) || 10000
},
use: {
  actionTimeout: 15000,
  navigationTimeout: 30000,
}
```

### Reporting

You can configure the reporters:

```javascript
// In playwright.config.js
reporter: [
  ['list'],
  ['html', { outputFolder: '../../reports/html' }],
  ['allure-playwright', { outputFolder: '../../allure-results' }],
  ['json', { outputFile: '../../reports/test-results.json' }]
],
```

## Advanced Configuration

### Custom Fixtures

You can create custom fixtures for your tests:

```javascript
// In src/tests/fixtures/customFixtures.js
const { test: base } = require('@playwright/test');

const test = base.extend({
  myFixture: async ({ page }, use) => {
    // Set up fixture
    const myFixture = {
      // Custom functionality
    };

    await use(myFixture);

    // Clean up fixture
  },
});

module.exports = { test };
```

### Global Setup and Teardown

You can configure global setup and teardown scripts:

```javascript
// In playwright.config.js
globalSetup: '../utils/setup/globalSetup.js',
globalTeardown: '../utils/setup/globalTeardown.js',
```

These scripts run once before and after all tests.

## Environment-Specific Configuration

You can create environment-specific configurations:

```javascript
// In src/config/env/qa.js
module.exports = {
  baseUrl: 'https://qa.example.com',
  apiUrl: 'https://api.qa.example.com',
  credentials: {
    username: 'qa-user',
    password: 'qa-password',
  },
};
```

Then use them in your tests:

```javascript
const env = process.env.NODE_ENV || 'qa';
const config = require(`../../config/env/${env}`);

test('Login with environment-specific credentials', async ({ loginPage }) => {
  await loginPage.login(
    config.credentials.username,
    config.credentials.password
  );
});
```

## Next Steps

Now that you've configured the framework, you can:

1. Learn about [UI Testing](../guides/ui-testing)
2. Explore [API Testing](../guides/api-testing)
3. Set up [CI/CD Integration](../guides/ci-cd-integration)
