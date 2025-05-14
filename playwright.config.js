// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './src/tests',
  /* Maximum time one test can run for. */
  timeout: 60000, // Increased timeout to accommodate API rate limiting delays
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 10000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 15000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.API_BASE_URL || 'https://reqres.in',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Viewport size */
    viewport: { width: 1280, height: 720 },
    
    /* Automatically wait for elements */
    navigationTimeout: 30000,
  },

  /* Global setup and teardown */
  globalSetup: './global-setup.js',
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Add extra timeout for API requests
        actionTimeout: 30000,
        navigationTimeout: 45000,
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    /* Test specific groups */
    {
      name: 'api',
      testMatch: /.*api.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        // Add extra timeout for API requests
        actionTimeout: 30000,
        navigationTimeout: 45000,
        // Add extra HTTP headers for API requests
        extraHTTPHeaders: {
          'x-api-key': 'reqres-free-v1',
          'Content-Type': 'application/json'
        }
      },
    },
    {
      name: 'ui',
      testMatch: /.*orangehrm.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'e2e',
      testMatch: /.*e2e.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        // Add extra timeout for API requests
        actionTimeout: 30000,
        navigationTimeout: 45000,
        // Add extra HTTP headers for API requests
        extraHTTPHeaders: {
          'x-api-key': 'reqres-free-v1',
          'Content-Type': 'application/json'
        }
      },
    },
    {
      name: 'visual',
      testMatch: /.*visual.*\.spec\.js/,
      testDir: './src/tests',
      use: {
        ...devices['Desktop Chrome'],
        // Specific settings for visual tests
        screenshot: 'on',
        viewport: { width: 1280, height: 720 },
        // Increase timeouts for visual comparison
        actionTimeout: 45000,
        navigationTimeout: 60000,
      },
    },
  ],
  
  /* Define test metadata */
  metadata: {
    apiBaseUrl: 'https://reqres.in/api',
    uiBaseUrl: 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
  },
});