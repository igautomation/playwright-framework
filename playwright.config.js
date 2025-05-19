// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Optimized Playwright configuration
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    actionTimeout: 15000,
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      grepInvert: /@slow/
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grepInvert: /@slow/
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      grepInvert: /@slow/
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      grepInvert: /@slow/
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      grepInvert: /@slow/
    },
    {
      name: 'slow-tests',
      testMatch: /.*\.spec\.js/,
      grep: /@slow/,
    },
  ],
  
  // Folder for test artifacts (traces, screenshots, videos)
  outputDir: 'test-results/',
  
  // Shared settings for all projects
  webServer: process.env.CI ? {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  } : undefined,
});