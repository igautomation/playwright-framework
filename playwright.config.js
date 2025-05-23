// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * Standard Playwright configuration
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory
  testDir: './src/tests',
  
  // Maximum time one test can run
  timeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
  
  // Expect assertion timeout
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT || '5000')
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? parseInt(process.env.WORKERS || '4') : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: process.env.HTML_REPORT_DIR || './reports/html' }],
    ['list'],
    ['allure-playwright', { outputFolder: process.env.ALLURE_RESULTS_DIR || './allure-results' }]
  ],
  
  // Global setup/teardown
  globalSetup: './global-setup.js',
  
  // Shared settings for all the projects below
  use: {
    // Action timeout
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '15000'),
    
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot only on failure
    screenshot: 'only-on-failure',
    
    // Record video only on failure
    video: 'retain-on-failure',
  },
  
  // Configure projects for different browsers/devices
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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'api',
      testMatch: '.*api/.*\\.spec\\.js',
    },
    {
      name: 'visual',
      testMatch: '.*visual/.*\\.spec\\.js',
      use: {
        screenshot: 'on',
      }
    },
    {
      name: 'accessibility',
      testMatch: '.*accessibility/.*\\.spec\\.js',
    },
    {
      name: 'performance',
      testMatch: '.*performance/.*\\.spec\\.js',
    }
  ],
  
  // Folder for test artifacts (traces, screenshots, videos)
  outputDir: './reports/test-results/',
  
  // Shared settings for all projects
  webServer: process.env.CI ? {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  } : undefined,
});