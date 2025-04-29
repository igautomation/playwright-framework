// src/config/playwright.config.js

/**
 * Playwright Test Configuration (ESM Compliant)
 *
 * Responsibilities:
 * - Load environment variables dynamically
 * - Configure base URLs, retries, reporters, timeouts
 * - Define multiple projects (Web, Mobile, API, Unit, BrowserStack)
 * - Enable test artifacts (trace, video, screenshots)
 * - Integrate global setup and teardown
 */

import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv-safe";
import { join } from "path";

// Load environment variables safely
const env = process.env.NODE_ENV || "development";
const envFileName = env === "development" ? "dev" : env;

try {
  loadEnv({
    allowEmptyValues: true,
    example: ".env.example",
    path: join("src", "config", "env", `${envFileName}.env`),
  });
} catch (error) {
  console.error(
    `Failed to load environment variables for ${env}:`,
    error.message
  );
  process.exit(1);
}

// Dynamically determine baseURL
const baseURL = (() => {
  switch (env) {
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

// Configure reporters (Local vs CI)
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

// Final Playwright Configuration
export default defineConfig({
  globalSetup: "./src/config/globalSetup.js",
  globalTeardown: "./src/config/globalTeardown.js",

  testDir: "./src/tests",
  testMatch: /.*\.spec\.js/,
  testIgnore: ["**/test-assets/**", "**/*.test.js"],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? parseInt(process.env.WORKERS, 10) || 4 : undefined,

  shard: process.env.CI
    ? {
        total: parseInt(process.env.CI_SHARD_TOTAL, 10) || 1,
        current: parseInt(process.env.CI_SHARD_INDEX, 10) || 1,
      }
    : undefined,

  maxFailures: process.env.CI ? 10 : undefined,

  outputDir: "test-results",
  reporter: reporters,

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
    permissions: process.env.GEOLOCATION_LATITUDE ? ["geolocation"] : undefined,
    offline: process.env.OFFLINE === "true",
    javaScriptEnabled: process.env.JAVASCRIPT_ENABLED !== "false",
    acceptDownloads: true,
    extraHTTPHeaders: process.env.API_KEY
      ? { Authorization: `Bearer ${process.env.API_KEY}` }
      : undefined,
    ignoreHTTPSErrors: env !== "prod",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    actionTimeout: 10000,
    headless: process.env.HEADLESS === "false" ? false : true,
    testIdAttribute: "data-test-id",
    launchOptions: {
      slowMo: process.env.HEADLESS === "false" ? 50 : 0,
    },
    defaultTestData: { id: "456", name: "Default User" },
  },

  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.js/,
    },
    {
      name: "teardown",
      testMatch: /global\.teardown\.js/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.ui\.spec\.js/,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /.*\.ui\.spec\.js/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: /.*\.ui\.spec\.js/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: /.*\.ui\.spec\.js/,
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
      testMatch: /.*\.ui\.spec\.js/,
    },
    {
      name: "google-chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      testMatch: /.*\.ui\.spec\.js/,
    },
    {
      name: "microsoft-edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
      testMatch: /.*\.ui\.spec\.js/,
    },
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
    },
    {
      name: "api",
      use: {
        browserName: undefined,
        launchOptions: { headless: true },
      },
      testMatch: /.*\.api\.spec\.js/,
    },
    {
      name: "unit",
      use: {
        browserName: undefined,
      },
      testMatch: /.*\.unit\.spec\.js/,
    },
  ],

  timeout: 30000,

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
