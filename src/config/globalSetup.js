// src/config/globalSetup.js

/**
 * Global Setup Script for Playwright Automation Framework.
 *
 * Purpose:
 * - Authenticate a user and save the storage state before tests run.
 * - Extract authentication tokens dynamically.
 * - Support multi-user login scenarios.
 * - Use structured logging and tracing for debugging.
 */

import { chromium } from "@playwright/test";
import { readData } from "../utils/common/dataUtils.js";
import BasePage from "../pages/BasePage.js";
import logger from "../utils/logger.js";

/**
 * Global setup function executed before the test suite.
 *
 * @param {Object} config - Playwright global config object.
 */
async function globalSetup(config) {
  const { baseURL, storageState } = config.projects[0].use;

  logger.info("Starting global setup", {
    baseURL,
    storageStatePath: storageState,
  });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const basePage = new BasePage(page);

  try {
    // Start tracing to capture screenshots, DOM snapshots, network activity
    const tracePath = `./test-results/setup-trace-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.zip`;
    await context.tracing.start({ screenshots: true, snapshots: true });
    logger.info("Tracing started", { tracePath });

    // Dynamically load credentials (admin user preferred)
    const credentials = await readData("src/data/json/credentials.json");
    const user = credentials.users.find((u) => u.role === "admin");
    if (!user) {
      throw new Error("Admin user not found in credentials.json");
    }

    const username = process.env.TEST_USERNAME || user.username;
    const password = process.env.TEST_PASSWORD || user.password;
    logger.info("Loaded credentials", { username });

    // Navigate to baseURL using BasePage utility
    await basePage.navigateTo(baseURL);

    // Mock authentication (e.g., example.com, agent portals)
    logger.info("Setting mock authentication token in local storage...");
    await page.evaluate(() => {
      localStorage.setItem("authToken", "mock-auth-token");
    });
    logger.info("Mock authToken set successfully");

    // Capture and export authentication token
    const token =
      (await page.evaluate(() => localStorage.getItem("authToken"))) ||
      "mock-auth-token";
    process.env.AUTH_TOKEN = token;
    logger.info("Authentication token extracted", { token });

    // Save storage state for future sessions
    await context.storageState({ path: storageState });
    logger.info("Storage state saved", { storageStatePath: storageState });

    // Capture a screenshot for debugging
    await basePage.takeScreenshot("global-setup");

    // Stop tracing on success
    await context.tracing.stop({ path: tracePath });
    logger.info("Tracing stopped successfully", { tracePath });

    await browser.close();
    logger.info("Browser closed - Global setup completed successfully");
  } catch (error) {
    // On error, capture screenshot and trace
    await basePage.takeScreenshot("global-setup-failure");

    const failedTracePath = `./test-results/failed-setup-trace-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.zip`;
    await context.tracing.stop({ path: failedTracePath });
    logger.error("Global setup failed", {
      error: error.message,
      failedTracePath,
    });

    await browser.close();
    logger.info("Browser closed after failure");

    throw error; // Re-throw to stop the entire setup if failed
  }
}

module.exports = globalSetup;
