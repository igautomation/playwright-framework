const { devices } = require('@playwright/test');
const path = require('path');
require('dotenv-safe').config({
  path: path.resolve(process.cwd(), '.env'),
  example: path.resolve(process.cwd(), '.env.example'),
  allowEmptyValues: true,
  silent: true,
});

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
module.exports = {
  testDir: path.resolve(process.cwd(), 'src/tests'),
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
    ['html', { outputFolder: path.resolve(process.cwd(), 'reports/html') }],
    ['allure-playwright', { outputFolder: path.resolve(process.cwd(), 'allure-results') }],
    ['json', { outputFile: path.resolve(process.cwd(), 'reports/test-results.json') }],
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
  globalSetup: path.resolve(process.cwd(), 'src/utils/setup/globalSetup.js'),
  globalTeardown: path.resolve(process.cwd(), 'src/utils/setup/globalTeardown.js'),
  outputDir: path.resolve(process.cwd(), 'test-results'),
};
