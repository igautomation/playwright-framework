---
sidebar_position: 4
---

# Configuration

This guide explains how to configure the Playwright Framework for your specific needs.

## Configuration Methods

The framework can be configured through:

1. **Environment Variables**: Set in `.env` file or directly in the environment
2. **Configuration Files**: Modify `playwright.config.js` for test-specific settings
3. **CLI Options**: Pass options when running commands

## Environment Variables

The framework supports the following environment variables:

### URLs

```
BASE_URL=https://example.com
API_URL=https://api.example.com
```

### Authentication

```
USERNAME=testuser
PASSWORD=testpass
API_KEY=your-api-key
AUTH_TOKEN=your-auth-token
```

### Timeouts (in milliseconds)

```
DEFAULT_TIMEOUT=30000
SHORT_TIMEOUT=5000
LONG_TIMEOUT=60000
PAGE_LOAD_TIMEOUT=30000
ANIMATION_TIMEOUT=1000
```

### Test Data

```
TEST_DATA_PATH=src/data
```

### Visual Testing

```
VISUAL_BASELINE_DIR=visual-baselines
VISUAL_DIFF_DIR=visual-diffs
VISUAL_THRESHOLD=0.1
```

### Browser Configuration

```
HEADLESS=true
SLOW_MO=0
DEFAULT_BROWSER=chromium
```

### Reporting

```
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
ALLURE_RESULTS_DIR=allure-results
```

### Feature Flags

```
SELF_HEALING=true
RETRY_ON_FAILURE=true
PARALLEL_EXECUTION=true
```

### Using Environment Variables

You can set environment variables in a `.env` file:

```
# .env
BASE_URL=https://example.com
HEADLESS=true
```

Or directly when running commands:

```bash
BASE_URL=https://example.com HEADLESS=false npm test
```

## Playwright Configuration

The main Playwright configuration is in `playwright.config.js`:

```javascript
// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'Mobile Chrome',
      use: {
        browserName: 'chromium',
        ...devices['Pixel 5']
      }
    },
    {
      name: 'Mobile Safari',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 12']
      }
    }
  ]
});
```

### Common Configuration Options

#### Timeouts

```javascript
// Global timeout for each test
timeout: 30000,

// Timeout for expect assertions
expect: {
  timeout: 5000
},

// Timeout for specific actions
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000
}
```

#### Retries

```javascript
// Retry failed tests
retries: process.env.CI ? 2 : 0,
```

#### Parallelization

```javascript
// Run tests in parallel
fullyParallel: true,

// Number of parallel workers
workers: process.env.CI ? 1 : undefined,
```

#### Reporters

```javascript
// Configure reporters
reporter: [
  ['html', { outputFolder: 'reports/html' }],
  ['json', { outputFile: 'reports/results.json' }],
  ['allure-playwright', { outputFolder: 'allure-results' }]
],
```

#### Browser Options

```javascript
// Configure browser options
use: {
  baseURL: process.env.BASE_URL || 'https://example.com',
  headless: process.env.HEADLESS !== 'false',
  viewport: { width: 1280, height: 720 },
  ignoreHTTPSErrors: true,
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
},
```

#### Projects

```javascript
// Configure multiple browser projects
projects: [
  {
    name: 'chromium',
    use: {
      browserName: 'chromium'
    }
  },
  {
    name: 'firefox',
    use: {
      browserName: 'firefox'
    }
  },
  {
    name: 'webkit',
    use: {
      browserName: 'webkit'
    }
  }
]
```

## CLI Options

You can pass options when running commands:

### Test Execution Options

```bash
# Run tests in headed mode
npx playwright test --headed

# Run tests with debug mode
npx playwright test --debug

# Run tests with specific browser
npx playwright test --project=chromium

# Run tests with specific reporter
npx playwright test --reporter=html

# Run tests with specific timeout
npx playwright test --timeout=60000

# Run tests with retries
npx playwright test --retries=3

# Run tests with specific workers
npx playwright test --workers=4
```

### Test Selection Options

```bash
# Run specific test file
npx playwright test path/to/test.spec.js

# Run tests with specific tag
npx playwright test --grep @smoke

# Run tests but exclude specific tag
npx playwright test --grep-invert @slow

# List all available tests
npx playwright test --list
```

### Framework CLI Options

```bash
# Verify tests with specific directory
npx playwright-framework verify-tests --dir src/tests

# Lint tests with specific pattern
npx playwright-framework test-lint --pattern "**/*.spec.js"

# Analyze coverage with specific threshold
npx playwright-framework test-coverage-analyze --threshold 80

# Generate reports with specific types
npx playwright-framework test-report --types html,json,markdown

# Set up CI/CD for specific system
npx playwright-framework ci-setup --system github
```

## Custom Configuration

### Custom Test Data Configuration

You can configure test data sources:

```javascript
// src/config/testData.config.js
module.exports = {
  csvPath: process.env.CSV_PATH || 'src/data/csv',
  jsonPath: process.env.JSON_PATH || 'src/data/json',
  yamlPath: process.env.YAML_PATH || 'src/data/yaml',
  excelPath: process.env.EXCEL_PATH || 'src/data/excel'
};
```

### Custom Reporting Configuration

You can configure reporting options:

```javascript
// src/config/reporting.config.js
module.exports = {
  htmlReportDir: process.env.HTML_REPORT_DIR || 'reports/html',
  jsonReportDir: process.env.JSON_REPORT_DIR || 'reports/json',
  allureResultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results',
  screenshotDir: process.env.SCREENSHOT_DIR || 'reports/screenshots',
  videoDir: process.env.VIDEO_DIR || 'reports/videos'
};
```

### Custom Visual Testing Configuration

You can configure visual testing options:

```javascript
// src/config/visual.config.js
module.exports = {
  baselineDir: process.env.VISUAL_BASELINE_DIR || 'visual-baselines',
  diffDir: process.env.VISUAL_DIFF_DIR || 'visual-diffs',
  threshold: parseFloat(process.env.VISUAL_THRESHOLD || '0.1'),
  maxDiffPixels: parseInt(process.env.MAX_DIFF_PIXELS || '100'),
  maxDiffPixelRatio: parseFloat(process.env.MAX_DIFF_PIXEL_RATIO || '0.05')
};
```

## Environment-Specific Configuration

You can create environment-specific configurations:

```javascript
// src/config/env/dev.js
module.exports = {
  baseUrl: 'https://dev.example.com',
  apiUrl: 'https://api.dev.example.com',
  credentials: {
    username: 'devuser',
    password: 'devpass'
  }
};

// src/config/env/prod.js
module.exports = {
  baseUrl: 'https://example.com',
  apiUrl: 'https://api.example.com',
  credentials: {
    username: 'produser',
    password: 'prodpass'
  }
};
```

Load the appropriate configuration based on the environment:

```javascript
// src/config/environment.js
const env = process.env.NODE_ENV || 'dev';
const config = require(`./env/${env}.js`);

module.exports = config;
```

## Next Steps

Now that you've configured the framework, you can:

- [Write your first test](quick-start)
- [Learn about UI testing](../guides/ui-testing)
- [Explore API testing](../guides/api-testing)
- [Set up CI/CD integration](../guides/ci-cd-integration)