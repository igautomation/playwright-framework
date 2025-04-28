// src/config/playwright.config.js
const { config: loadEnv } = require("dotenv-safe");

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

const config = {
  testDir: "./src/tests", // Explicitly set the test directory
  testIgnore: ["**/src/templates/**"], // Exclude src/templates
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || "https://example.com",
    headless: process.env.HEADLESS === "true",
    screenshot: "only-on-failure",
    video: "on",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: "global.setup.js",
    },
    {
      name: "teardown",
      testMatch: "global.teardown.js",
    },
    {
      name: "chromium",
      use: { browserName: "chromium" },
      dependencies: ["setup"],
    },
    {
      name: "api",
      testMatch: "src/tests/api/**/*.spec.js",
      dependencies: ["setup"],
    },
    {
      name: "unit",
      testMatch: "src/tests/unit/**/*.spec.js",
      dependencies: ["setup"],
    },
  ],
  reporter: process.env.CI
    ? [
        ["dot"],
        ["github"],
        ["blob", { outputDir: "blob-report" }],
        ["json", { outputFile: "reports/test-results.json" }],
        ["junit", { outputFile: "reports/test-results.xml" }],
        ["allure-playwright"],
      ]
    : [
        ["list", { printSteps: true }],
        ["html", { outputFolder: "reports/html", open: "on-failure" }],
        ["json", { outputFile: "reports/test-results.json" }],
        ["junit", { outputFile: "reports/test-results.xml" }],
        ["allure-playwright"],
      ],
  globalSetup: "./src/tests/global.setup.js",
  globalTeardown: "./src/tests/global.teardown.js",
};

module.exports = config;
