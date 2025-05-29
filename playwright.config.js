// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './src/tests',
  testMatch: '**/*.spec.js',
  
  /* Maximum time one test can run for */
  timeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry tests */
  retries: parseInt(process.env.RETRY_COUNT || '1'),
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.SF_INSTANCE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    
    /* Action timeout */
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '15000'),
    
    /* Assertion timeout */
    expect: {
      timeout: parseInt(process.env.EXPECT_TIMEOUT || '5000')
    }
  },

  /* Configure projects for major browsers */
  projects: [
    // Default project is disabled for Salesforce tests to avoid duplicate runs
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: process.env.HEADLESS === 'true',
        slowMo: parseInt(process.env.BROWSER_SLOW_MO || '0')
      },
      testIgnore: '**/salesforce/**', // Ignore Salesforce tests in this project
    },
    // Project for Salesforce tests with authentication
    {
      name: 'salesforce',
      testDir: './src/tests/salesforce',
      testMatch: '**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.HEADLESS === 'true',
        slowMo: parseInt(process.env.BROWSER_SLOW_MO || '0'),
        storageState: './auth/salesforce-storage-state.json'
      },
    }
  ],
});