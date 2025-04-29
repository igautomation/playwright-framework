// src/config/playwright.config.js
/**
 * Playwright Test Configuration (ESM Compliant)
 *
 * Responsibilities:
 * - Load environment variables dynamically
 * - Configure retries, reporters, timeouts
 * - Define multiple projects (Web, Mobile, API, Unit)
 * - Enable test artifacts (trace, video, screenshots)
 * - Integrate global setup and teardown
 */

import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import logger from "../utils/common/logger.js";

// Environment and path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || "dev";
const envFileName = env === "prod" ? "prod" : "dev";
const envFilePath = join(
  __dirname,
  "..",
  "config",
  "env",
  `${envFileName}.env`
);

// Optionally load .env file if it exists
if (existsSync(envFilePath)) {
  try {
    loadEnv({ path: envFilePath, override: true });
    logger.info(
      `Successfully loaded environment variables from ${envFilePath}`
    );
  } catch (error) {
    logger.error(
      `Failed to load environment file ${envFilePath}: ${error.message}`
    );
    throw new Error(`Failed to load environment file: ${error.message}`);
  }
} else {
  logger.info(
    `Environment file ${envFilePath} not found. Using existing environment variables.`
  );
}

// Log all environment variables for debugging (without assuming specific keys)
const envVars = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !key.includes("PASSWORD") && !key.includes("SECRET")
  ) // Exclude sensitive data
);
logger.info("Available environment variables:", envVars);

// Use BASE_URL if provided, otherwise let fixtures/tests handle validation
const baseURL = process.env.BASE_URL;

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
    storageState: process.env.STORAGE_STATE,
    colorScheme: process.env.COLOR_SCHEME,
    locale: process.env.LOCALE,
    timezoneId: process.env.TIMEZONE,
    geolocation:
      process.env.GEOLOCATION_LATITUDE && process.env.GEOLOCATION_LONGITUDE
        ? {
            latitude: parseFloat(process.env.GEOLOCATION_LATITUDE),
            longitude: parseFloat(process.env.GEOLOCATION_LONGITUDE),
          }
        : null,
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
    testIdAttribute: process.env.TEST_ID_ATTRIBUTE || "data-test-id",
    launchOptions: {
      slowMo: process.env.HEADLESS === "false" ? 50 : 0,
    },
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

  timeout: process.env.TEST_TIMEOUT
    ? parseInt(process.env.TEST_TIMEOUT, 10)
    : 30000,

  expect: {
    timeout: process.env.EXPECT_TIMEOUT
      ? parseInt(process.env.EXPECT_TIMEOUT, 10)
      : 10000,
    toHaveScreenshot: {
      maxDiffPixels: process.env.SCREENSHOT_MAX_DIFF_PIXELS
        ? parseInt(process.env.SCREENSHOT_MAX_DIFF_PIXELS, 10)
        : 50,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: process.env.SNAPSHOT_MAX_DIFF_PIXEL_RATIO
        ? parseFloat(process.env.SNAPSHOT_MAX_DIFF_PIXEL_RATIO)
        : 0.05,
    },
  },
});
