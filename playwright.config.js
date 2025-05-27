// @ts-check
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');
const configManager = require('./src/utils/config');

// Get configuration
const config = configManager.getConfig();
const browserConfig = config.browser;
const testConfig = config.test;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  
  /* Maximum time one test can run for */
  timeout: testConfig.defaultTimeout,
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry tests */
  retries: testConfig.retryCount,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || config.orangeHrm.url,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: testConfig.screenshotOnFailure ? 'only-on-failure' : 'off',
    
    /* Action timeout */
    actionTimeout: testConfig.actionTimeout,
    
    /* Assertion timeout */
    expect: {
      timeout: testConfig.expectTimeout
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: browserConfig.headless,
        slowMo: browserConfig.slowMo
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: browserConfig.headless,
        slowMo: browserConfig.slowMo
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: browserConfig.headless,
        slowMo: browserConfig.slowMo
      },
    },
    // Project for utility tests
    {
      name: 'utils',
      testDir: './src/utils',
      testMatch: '**/*.test.js',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true
      },
    },
    // Project for src/tests directory
    {
      name: 'src-tests',
      testDir: './src/tests',
      testMatch: '**/*.+(spec|test).js',
      use: { 
        ...devices['Desktop Chrome'],
        headless: browserConfig.headless,
        slowMo: browserConfig.slowMo
      },
    },
  ],
});