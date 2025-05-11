const { devices } = require('@playwright/test');
const path = require('path');
require('dotenv-safe').config({
  path: path.resolve(process.cwd(), '.env'),
  example: path.resolve(process.cwd(), '.env.example'),
  allowEmptyValues: true,
  silent: true,
});

// Constants for defaults
const DEFAULTS = {
  TEST_TIMEOUT: 30000,
  EXPECT_TIMEOUT: 10000,
  SCREENSHOT_MAX_DIFF_PIXELS: 50,
  SNAPSHOT_MAX_DIFF_PIXEL_RATIO: 0.05,
  WORKERS: 4,
  MAX_FAILURES: 10,
  SLOWMO: 0,
  HEADLESS: true,
  JAVASCRIPT_ENABLED: true
};

// Parse and validate environment variables
const parseEnvNumber = (value, defaultValue, name) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Invalid ${name}: ${value}. Using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
};

// Reporter configuration
const getReporters = (isCI) => {
  const commonReporters = [
    ['allure-playwright', { outputFolder: path.resolve(process.cwd(), 'allure-results') }]
  ];

  return isCI
    ? [
        ['dot'],
        ['github'],
        ['json', { outputFile: path.resolve(process.cwd(), 'reports/test-results.json') }],
        ['junit', { outputFile: path.resolve(process.cwd(), 'test-results/results.xml') }],
        ...commonReporters
      ]
    : [
        ['list', { printSteps: true }],
        ['html', { outputFolder: path.resolve(process.cwd(), 'reports/html'), open: 'on-failure' }],
        ...commonReporters
      ];
};

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
module.exports = {
  testDir: path.resolve(process.cwd(), 'src/tests'),
  testMatch: ['**/*.js'],
  testIgnore: ['**/test-assets/**', '**/*.unit.test.js'], // Avoid confusion with unit tests
  timeout: parseInt(process.env.TEST_TIMEOUT) || DEFAULTS.TEST_TIMEOUT,
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT) || DEFAULTS.EXPECT_TIMEOUT,
    toHaveScreenshot: {
      maxDiffPixels: parseEnvNumber(
        process.env.SCREENSHOT_MAX_DIFF_PIXELS,
        DEFAULTS.SCREENSHOT_MAX_DIFF_PIXELS,
        'SCREENSHOT_MAX_DIFF_PIXELS'
      )
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: parseFloat(
        process.env.SNAPSHOT_MAX_DIFF_PIXEL_RATIO || DEFAULTS.SNAPSHOT_MAX_DIFF_PIXEL_RATIO
      )
    }
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : parseInt(process.env.RETRIES) || 1,
  workers: process.env.CI ? DEFAULTS.WORKERS : process.env.WORKERS || '50%',
  maxFailures: process.env.CI ? DEFAULTS.MAX_FAILURES : undefined,
  reporter: getReporters(!!process.env.CI),
  use: {
    baseURL: process.env.BASE_URL,
    trace: process.env.TRACE_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
    screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
    headless: process.env.HEADLESS === 'false' ? false : DEFAULTS.HEADLESS,
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT) || 15000,
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT) || 30000,
    viewport: { width: 1280, height: 720 },
    storageState: process.env.STORAGE_STATE || 'test-results/storageState.json',
    colorScheme: process.env.COLOR_SCHEME || 'light',
    locale: process.env.LOCALE || 'en-US',
    timezoneId: process.env.TIMEZONE || 'UTC',
    javaScriptEnabled: process.env.JAVASCRIPT_ENABLED === 'false' ? false : DEFAULTS.JAVASCRIPT_ENABLED,
    acceptDownloads: true,
    testIdAttribute: process.env.TEST_ID_ATTRIBUTE || 'data-test-id',
    extraHTTPHeaders: process.env.API_KEY
      ? { Authorization: `Bearer ${process.env.API_KEY}` }
      : undefined,
    launchOptions: {
      slowMo: parseEnvNumber(process.env.SLOWMO, DEFAULTS.SLOWMO, 'SLOWMO')
    }
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**global.setup.js'
    },
    {
      name: 'teardown',
      testMatch: '**global.teardown.js'
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/*.ui.spec.js'
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/*.ui.spec.js'
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/*.ui.spec.js'
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
    {
      name: 'api',
      use: {}, // No browser for API tests
      testMatch: '**/*.api.spec.js'
    },
    {
      name: 'unit',
      use: {}, // No browser for unit tests
      testMatch: '**/*.unit.spec.js'
    }
  ],
  globalSetup: path.resolve(process.cwd(), 'src/utils/setup/globalSetup.js'),
  globalTeardown: path.resolve(process.cwd(), 'src/utils/setup/globalTeardown.js'),
  outputDir: path.resolve(process.cwd(), 'test-results'),
};