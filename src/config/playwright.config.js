// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Standard Playwright configuration
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
    ['html', { outputFolder: './reports/html' }],
    ['list'],
    ['allure-playwright', { outputFolder: './reports/allure' }]
  ],
  use: {
    actionTimeout: 15000,
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
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
      testMatch: /.*api\/.*\.spec\.js/,
    },
    {
      name: 'visual',
      testMatch: /.*visual\/.*\.spec\.js/,
    },
    {
      name: 'accessibility',
      testMatch: /.*accessibility\/.*\.spec\.js/,
    },
    {
      name: 'performance',
      testMatch: /.*performance\/.*\.spec\.js/,
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