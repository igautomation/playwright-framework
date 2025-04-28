// src/config/playwright.config.js

// Import required Playwright modules for defining configuration and device emulation
const { defineConfig, devices } = require('@playwright/test');
// Import dotenv-safe to load environment variables securely
const { config: loadEnv } = require('dotenv-safe');

// Load environment variables using dotenv-safe
// This block ensures that environment variables are available for the configuration
// - `NODE_ENV` determines the environment (e.g., 'development', 'qa', 'prod')
// - Maps 'development' to 'dev.env' to match the file naming convention
// - Uses `.env.example` as a template for required variables
// - Loads environment-specific `.env` file (e.g., `src/config/env/dev.env`)
const env = process.env.NODE_ENV || 'development';
const envFileName = env === 'development' ? 'dev' : env;
try {
  loadEnv({
    allowEmptyValues: true,
    example: '.env.example',
    path: `src/config/env/${envFileName}.env`,
  });
  loadEnv({ allowEmptyValues: true, example: '.env.example' });
} catch (error) {
  console.error(`Failed to load environment variables for ${env}:`, error.message);
  process.exit(1);
}

// Define the base URL dynamically based on the environment
// This aligns with "Test Use Options" and "Parameterization" by allowing environment-specific URLs
// - Uses `NODE_ENV` to select the appropriate URL
// - Falls back to default URLs if `BASE_URL` is not set
const baseURL = (() => {
  switch (process.env.NODE_ENV) {
    case 'prod':
      return process.env.BASE_URL || 'https://prod.example.com';
    case 'uat':
      return process.env.BASE_URL || 'https://uat.example.com';
    case 'qa':
      return process.env.BASE_URL || 'https://qa.example.com';
    default:
      return process.env.BASE_URL || 'https://dev.example.com';
  }
})();

// Define reporters based on CI environment
// This aligns with "Reporters" by providing different outputs for local and CI runs
// - On CI: Uses `dot` for concise output, `github` for annotations, and others for detailed reporting
// - Locally: Uses `list` with steps, `html` for interactive reports, and others for debugging
const reporters = process.env.CI
  ? [
      ['dot'], // Concise output for CI
      ['github'], // GitHub Actions annotations
      ['blob', { outputDir: 'blob-report' }], // For sharded runs
      ['json', { outputFile: 'test-results/results.json' }], // JSON output
      ['junit', { outputFile: 'test-results/results.xml', includeProjectInTestName: true }], // JUnit XML
      ['allure-playwright', { detail: true, outputFolder: 'reports/allure', suiteTitle: false }], // Allure reports
    ]
  : [
      ['list', { printSteps: true }], // Detailed output with steps
      ['html', { outputFolder: 'reports/html', open: 'on-failure', host: 'localhost', port: 9323 }], // HTML report
      ['blob', { outputDir: 'blob-report' }],
      ['json', { outputFile: 'test-results/results.json' }],
      ['junit', { outputFile: 'test-results/results.xml', includeProjectInTestName: true }],
      ['allure-playwright', { detail: true, outputFolder: 'reports/allure', suiteTitle: false }],
    ];

// Export the Playwright configuration using defineConfig
module.exports = defineConfig({
  // Test Configuration: Define where test files are located
  // - `testDir`: Directory containing test files
  // - `testMatch`: Pattern to match test files
  // - `testIgnore`: Patterns to ignore (e.g., test assets)
  testDir: './src/tests',
  testMatch: /.*\.spec\.js/,
  testIgnore: ['**/test-assets/**', '**/*.test.js'],

  // Parallelism: Enable full parallelism for faster test execution
  // - `fullyParallel`: Run all tests in parallel (files and within files)
  fullyParallel: true,

  // Projects: Prevent usage of `test.only` on CI to avoid skipping tests
  forbidOnly: !!process.env.CI,

  // Retries: Configure retries globally, with more on CI
  // - `retries`: 2 on CI, 1 locally to handle flaky tests
  retries: process.env.CI ? 2 : 1,

  // Parallelism: Configure number of workers
  // - `workers`: 4 on CI (configurable via env), default locally
  workers: process.env.CI ? (parseInt(process.env.WORKERS, 10) || 4) : undefined,

  // Sharding: Enable sharding on CI for distributed execution
  // - `shard`: Uses `CI_SHARD_TOTAL` and `CI_SHARD_INDEX` to split tests
  shard: process.env.CI ? { total: parseInt(process.env.CI_SHARD_TOTAL, 10) || 1, current: parseInt(process.env.CI_SHARD_INDEX, 10) || 1 } : undefined,

  // Parallelism: Limit failures on CI to save resources
  // - `maxFailures`: Stops after 10 failures on CI
  maxFailures: process.env.CI ? 10 : undefined,

  // Test Configuration: Define where test artifacts are stored
  // - `outputDir`: Directory for screenshots, videos, traces, etc.
  outputDir: 'test-results',

  // Reporters: Define reporters for test output
  // - See above for reporter configuration details
  reporter: reporters,

  // UI Mode: Configure default settings for UI mode
  // - `ui.host` and `ui.port` set defaults for interactive UI mode
  ui: {
    host: 'localhost',
    port: 8080,
  },

  // Test Use Options: Define global browser and context options
  // - `baseURL`: Dynamically set based on environment
  // - `storageState`: Path to save authentication state
  // - `colorScheme`, `locale`, `timezoneId`, `viewport`: Emulation settings
  // - `geolocation`, `permissions`: Location emulation, configurable via env
  // - `offline`, `javaScriptEnabled`: Network and JavaScript emulation
  // - `acceptDownloads`, `extraHTTPHeaders`, `ignoreHTTPSErrors`: Network options
  // - `screenshot`, `trace`, `video`: Recording options (video added inspired by Boyka Framework)
  // - `actionTimeout`, `headless`, `testIdAttribute`: Other options
  // - `launchOptions`: Browser launch options (e.g., slowMo for debugging)
  // - `defaultTestData`: Custom parameter for parameterized projects
  use: {
    baseURL,
    storageState: process.env.STORAGE_STATE || 'test-results/state.json',
    colorScheme: 'dark',
    locale: process.env.LOCALE || 'en-US',
    timezoneId: process.env.TIMEZONE || 'UTC',
    viewport: { width: 1280, height: 720 },
    geolocation: process.env.GEOLOCATION_LATITUDE && process.env.GEOLOCATION_LONGITUDE
      ? {
          latitude: parseFloat(process.env.GEOLOCATION_LATITUDE),
          longitude: parseFloat(process.env.GEOLOCATION_LONGITUDE),
        }
      : { latitude: 40.7128, longitude: -74.0060 },
    permissions: process.env.GEOLOCATION_LATITUDE && process.env.GEOLOCATION_LONGITUDE
      ? ['geolocation']
      : undefined,
    offline: process.env.OFFLINE === 'true' ? true : false,
    javaScriptEnabled: process.env.JAVASCRIPT_ENABLED === 'false' ? false : true,
    acceptDownloads: false,
    extraHTTPHeaders: process.env.API_KEY ? { 'Authorization': `Bearer ${process.env.API_KEY}` } : undefined,
    ignoreHTTPSErrors: env !== 'prod',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry', // Enhanced tracing for debugging
    video: 'on', // Added video recording for all tests, inspired by Boyka Framework
    actionTimeout: 10000,
    headless: process.env.HEADLESS === 'false' ? false : true,
    testIdAttribute: 'data-test-id',
    launchOptions: {
      slowMo: process.env.HEADLESS === 'false' ? 50 : 0,
    },
    defaultTestData: { id: '456', name: 'Default User' },
  },

  // Projects: Define test projects for different configurations
  // - `setup` and `teardown`: Global setup and teardown projects
  // - `chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari`, `google-chrome`, `microsoft-edge`: Browser and device projects
  // - `browserstack-chromium`: Added for remote execution on BrowserStack, inspired by Boyka Framework
  // - `api` and `unit`: Non-browser test projects
  // - Each project specifies `use` options, `testMatch`, `dependencies`, `retries`, and `timeout`
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.js/,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testMatch: /global\.teardown\.js/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: 'google-chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: 'microsoft-edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: 'browserstack-chromium',
      use: {
        browserName: 'chromium',
        // BrowserStack capabilities
        'bstack:options': {
          os: process.env.BSTACK_OS || 'Windows',
          osVersion: process.env.BSTACK_OS_VERSION || '11',
          browserVersion: process.env.BSTACK_BROWSER_VERSION || 'latest',
          projectName: 'Playwright Framework',
          buildName: process.env.BSTACK_BUILD_NAME || 'playwright-build',
          sessionName: 'Playwright Test',
          local: false,
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        },
        // Connect to BrowserStack
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'bstack:options': {
              userName: process.env.BROWSERSTACK_USERNAME,
              accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            },
          }))}`,
        },
      },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.js/,
      use: {
        browserName: undefined,
        launchOptions: { headless: true },
      },
      dependencies: ['setup'],
      retries: process.env.CI ? 3 : 2, // Higher retries for API tests
      timeout: 60000, // Longer timeout for API tests
    },
    {
      name: 'unit',
      testMatch: /.*\.unit\.spec\.js/,
      use: {
        browserName: undefined,
      },
      dependencies: ['setup'],
      retries: process.env.CI ? 1 : 0, // Fewer retries for unit tests
      timeout: 15000, // Shorter timeout for unit tests
    },
  ],

  // Timeouts: Define global test timeout
  // - `timeout`: 30 seconds for individual tests
  timeout: 30000,

  // Test Configuration: Define expect timeout and screenshot/snapshot options
  // - `expect.timeout`: 10 seconds for assertions
  // - `toHaveScreenshot`, `toMatchSnapshot`: Configure screenshot and snapshot assertions
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 50,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
});