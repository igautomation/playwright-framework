// src/config/playwright.config.js

/**
 * Playwright Test Configuration
 *
 * This configuration:
 * - Loads environment variables dynamically
 * - Configures base URLs and reporters
 * - Defines projects for different browsers, mobile devices, API and unit tests
 * - Sets global test settings such as retries, sharding, and test artifacts
 */

const { defineConfig, devices } = require("@playwright/test");
const { config: loadEnv } = require("dotenv-safe");

// Load environment variables
const env = process.env.NODE_ENV || "development";
const envFileName = env === "development" ? "dev" : env;

try {
  loadEnv({
    allowEmptyValues: true,
    example: ".env.example",
    path: `src/config/env/${envFileName}.env`,
  });
  loadEnv({ allowEmptyValues: true, example: ".env.example" });
} catch (error) {
  console.error(
    `Failed to load environment variables for ${env}:`,
    error.message
  );
  process.exit(1);
}

// Dynamically define baseURL depending on environment
const baseURL = (() => {
  switch (process.env.NODE_ENV) {
    case "prod":
      return process.env.BASE_URL || "https://prod.example.com";
    case "uat":
      return process.env.BASE_URL || "https://uat.example.com";
    case "qa":
      return process.env.BASE_URL || "https://qa.example.com";
    default:
      return process.env.BASE_URL || "https://dev.example.com";
  }
})();

// Configure reporters based on CI or Local run
const reporters = process.env.CI
  ? [
      ["dot"],
      ["github"],
      ["blob", { outputDir: "blob-report" }],
      ["json", { outputFile: "test-results/results.json" }],
      [
        "junit",
        {
          outputFile: "test-results/results.xml",
          includeProjectInTestName: true,
        },
      ],
      [
        "allure-playwright",
        { detail: true, outputFolder: "reports/allure", suiteTitle: false },
      ],
    ]
  : [
      ["list", { printSteps: true }],
      [
        "html",
        {
          outputFolder: "reports/html",
          open: "on-failure",
          host: "localhost",
          port: 9323,
        },
      ],
      ["blob", { outputDir: "blob-report" }],
      ["json", { outputFile: "test-results/results.json" }],
      [
        "junit",
        {
          outputFile: "test-results/results.xml",
          includeProjectInTestName: true,
        },
      ],
      [
        "allure-playwright",
        { detail: true, outputFolder: "reports/allure", suiteTitle: false },
      ],
    ];

// Export Playwright defineConfig
module.exports = defineConfig({
  // Test Discovery
  testDir: "./src/tests",
  testMatch: /.*\.spec\.js/,
  testIgnore: ["**/test-assets/**", "**/*.test.js"],

  // Parallel Test Execution
  fullyParallel: true,

  // Control test.only on CI
  forbidOnly: !!process.env.CI,

  // Retry Strategy
  retries: process.env.CI ? 2 : 1,

  // Worker Configuration
  workers: process.env.CI ? parseInt(process.env.WORKERS, 10) || 4 : undefined,

  // Sharding Strategy
  shard: process.env.CI
    ? {
        total: parseInt(process.env.CI_SHARD_TOTAL, 10) || 1,
        current: parseInt(process.env.CI_SHARD_INDEX, 10) || 1,
      }
    : undefined,

  // Stop after certain number of failures
  maxFailures: process.env.CI ? 10 : undefined,

  // Output Directory for Artifacts
  outputDir: "test-results",

  // Reporters to use
  reporter: reporters,

  // Playwright UI Mode (when run in interactive mode)
  ui: {
    host: "localhost",
    port: 8080,
  },

  // Global Test Use Options
  use: {
    baseURL,
    storageState: process.env.STORAGE_STATE || "test-results/state.json",
    colorScheme: "dark",
    locale: process.env.LOCALE || "en-US",
    timezoneId: process.env.TIMEZONE || "UTC",
    viewport: { width: 1280, height: 720 },
    geolocation:
      process.env.GEOLOCATION_LATITUDE && process.env.GEOLOCATION_LONGITUDE
        ? {
            latitude: parseFloat(process.env.GEOLOCATION_LATITUDE),
            longitude: parseFloat(process.env.GEOLOCATION_LONGITUDE),
          }
        : { latitude: 40.7128, longitude: -74.006 },
    permissions:
      process.env.GEOLOCATION_LATITUDE && process.env.GEOLOCATION_LONGITUDE
        ? ["geolocation"]
        : undefined,
    offline: process.env.OFFLINE === "true",
    javaScriptEnabled: process.env.JAVASCRIPT_ENABLED !== "false",
    acceptDownloads: false,
    extraHTTPHeaders: process.env.API_KEY
      ? { Authorization: `Bearer ${process.env.API_KEY}` }
      : undefined,
    ignoreHTTPSErrors: env !== "prod",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "on",
    actionTimeout: 10000,
    headless: process.env.HEADLESS === "false" ? false : true,
    testIdAttribute: "data-test-id",
    launchOptions: {
      slowMo: process.env.HEADLESS === "false" ? 50 : 0,
    },
    defaultTestData: { id: "456", name: "Default User" },
  },

  // Define Projects: Browsers, Mobile, API, Unit
  projects: [
    // Setup and Teardown Projects
    {
      name: "setup",
      testMatch: /global\.setup\.js/,
      teardown: "teardown",
    },
    {
      name: "teardown",
      testMatch: /global\.teardown\.js/,
    },

    // Desktop Browsers
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ["setup"],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ["setup"],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ["setup"],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },

    // Mobile Browsers
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ["setup"],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ["setup"],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },

    // Specific Browser Channels
    {
      name: "google-chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ["setup"],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },
    {
      name: "microsoft-edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ["setup"],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },

    // BrowserStack Execution
    {
      name: "browserstack-chromium",
      use: {
        browserName: "chromium",
        "bstack:options": {
          os: process.env.BSTACK_OS || "Windows",
          osVersion: process.env.BSTACK_OS_VERSION || "11",
          browserVersion: process.env.BSTACK_BROWSER_VERSION || "latest",
          projectName: "Playwright Framework",
          buildName: process.env.BSTACK_BUILD_NAME || "playwright-build",
          sessionName: "Playwright Test",
          local: false,
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        },
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
            JSON.stringify({
              "bstack:options": {
                userName: process.env.BROWSERSTACK_USERNAME,
                accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
              },
            })
          )}`,
        },
      },
      testMatch: /.*\.ui\.spec\.js/,
      dependencies: ["setup"],
      retries: process.env.CI ? 2 : 1,
      timeout: 30000,
    },

    // API Testing Project
    {
      name: "api",
      testMatch: /.*\.api\.spec\.js/,
      use: {
        browserName: undefined,
        launchOptions: { headless: true },
      },
      dependencies: ["setup"],
      retries: process.env.CI ? 3 : 2,
      timeout: 60000,
    },

    // Unit Testing Project
    {
      name: "unit",
      testMatch: /.*\.unit\.spec\.js/,
      use: {
        browserName: undefined,
      },
      dependencies: ["setup"],
      retries: process.env.CI ? 1 : 0,
      timeout: 15000,
    },
  ],

  // Default Timeout per test
  timeout: 30000,

  // Expect Configuration
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
