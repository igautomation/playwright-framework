// src/config/playwright.config.js
// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { config: loadEnv } = require('dotenv-safe');

/**
 * Load environment variables with validation against .env.example
 * @type {string} env - The environment (development, qa, uat, prod)
 */
const env = process.env.NODE_ENV || 'development';
loadEnv({
  allowEmptyValues: true,
  example: '.env.example',
  path: `.env.${env}`,
});
loadEnv({ allowEmptyValues: true, example: '.env.example' }); // Load default .env

/**
 * Determine baseURL based on environment
 * @returns {string} The base URL for the environment
 */
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

/**
 * Playwright configuration for the enterprise-grade test framework
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
    }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
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
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }, // Chrome for Android
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] }, // Mobile Safari
    },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.js/,
      use: {
        // Disable browser for API tests
        browserName: undefined,
        launchOptions: { headless: true },
      },
    },
  ],
  globalSetup: require.resolve('./globalSetup.js'),
  globalTeardown: require.resolve('./globalTeardown.js'),
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});