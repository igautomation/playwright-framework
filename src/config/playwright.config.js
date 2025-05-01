// src/config/playwright.config.js

import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import logger from "../utils/common/logger.js";

// Setup file path context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine environment
const NODE_ENV = process.env.NODE_ENV || "dev";
const envFile = join(__dirname, "env", `${NODE_ENV}.env`);

// Load environment file
if (existsSync(envFile)) {
  try {
    loadEnv({ path: envFile, override: true });
    logger.info(`Loaded environment variables from ${envFile}`);
  } catch (error) {
    logger.error(`Failed to load environment file: ${error.message}`);
    throw error;
  }
} else {
  logger.warn(`Environment file not found: ${envFile}. Using process.env`);
}

// Sanitize sensitive output from logs
const envVars = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) =>
      !key.toLowerCase().includes("password") &&
      !key.toLowerCase().includes("secret")
  )
);
logger.info("Environment variables loaded:", envVars);

// Base URL
const baseURL = process.env.BASE_URL;

// Reporters
const reporters = process.env.CI
  ? [
      ["dot"],
      ["github"],
      ["json", { outputFile: "test-results/results.json" }],
      ["junit", { outputFile: "test-results/results.xml" }],
      [
        "allure-playwright",
        { outputFolder: "reports/allure", suiteTitle: false },
      ],
    ]
  : [
      ["list", { printSteps: true }],
      ["html", { outputFolder: "reports/html", open: "on-failure" }],
      [
        "allure-playwright",
        { outputFolder: "reports/allure", suiteTitle: false },
      ],
    ];

export default defineConfig({
  testDir: "./src/tests",
  testMatch: /.*\.spec\.js/,
  testIgnore: ["**/test-assets/**", "**/*.test.js"],

  // Global hooks
  globalSetup: "./src/config/globalSetup.js",
  globalTeardown: "./src/config/globalTeardown.js",

  // Execution policies
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI
    ? parseInt(process.env.WORKERS || "4", 10)
    : undefined,
  maxFailures: process.env.CI ? 10 : undefined,

  // Sharding support
  shard: process.env.CI
    ? {
        total: parseInt(process.env.CI_SHARD_TOTAL || "1", 10),
        current: parseInt(process.env.CI_SHARD_INDEX || "1", 10),
      }
    : undefined,

  // Timeouts
  timeout: parseInt(process.env.TEST_TIMEOUT || "30000", 10),
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT || "10000", 10),
    toHaveScreenshot: {
      maxDiffPixels: parseInt(
        process.env.SCREENSHOT_MAX_DIFF_PIXELS || "50",
        10
      ),
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: parseFloat(
        process.env.SNAPSHOT_MAX_DIFF_PIXEL_RATIO || "0.05"
      ),
    },
  },

  // Reporters and artifacts
  outputDir: "test-results",
  reporter: reporters,

  use: {
    baseURL,
    storageState: process.env.STORAGE_STATE || "test-results/storageState.json",
    colorScheme: process.env.COLOR_SCHEME || "light",
    locale: process.env.LOCALE || "en-US",
    timezoneId: process.env.TIMEZONE || "UTC",
    geolocation:
      process.env.GEOLOCATION_LATITUDE && process.env.GEOLOCATION_LONGITUDE
        ? {
            latitude: parseFloat(process.env.GEOLOCATION_LATITUDE),
            longitude: parseFloat(process.env.GEOLOCATION_LONGITUDE),
          }
        : undefined,
    permissions: process.env.GEOLOCATION_LATITUDE ? ["geolocation"] : undefined,
    offline: process.env.OFFLINE === "true",
    javaScriptEnabled: process.env.JAVASCRIPT_ENABLED !== "false",
    acceptDownloads: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
    testIdAttribute: process.env.TEST_ID_ATTRIBUTE || "data-test-id",
    headless: process.env.HEADLESS !== "false",
    extraHTTPHeaders: process.env.API_KEY
      ? { Authorization: `Bearer ${process.env.API_KEY}` }
      : undefined,
    launchOptions: {
      slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 0,
    },
    actionTimeout: 10000,
  },

  // Multiple execution projects
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
});
