// src/config/globalTeardown.js

/**
 * Global Teardown Script for Playwright Automation Framework.
 *
 * Runs once after all tests are finished.
 * Cleans up storage state, cached tokens, or temp session data
 * to ensure a clean CI/CD environment.
 */

import fs from "fs-extra";
import path from "path";
import logger from "../utils/common/logger.js";

export default async function globalTeardown() {
  const storageStatePath =
    process.env.STORAGE_STATE || "test-results/storageState.json";

  logger.info("Global teardown started.");

  try {
    if (await fs.pathExists(storageStatePath)) {
      await fs.remove(storageStatePath);
      logger.info(`Removed storage state file: ${storageStatePath}`);
    } else {
      logger.info(`No storage state file found at: ${storageStatePath}`);
    }

    // Optional: remove trace or session dumps if needed
    // await fs.remove('test-results/setup-trace.zip');

    logger.info("Global teardown completed.");
  } catch (error) {
    logger.error(`Error during global teardown: ${error.message}`);
    process.exit(1); // Fail the teardown process if cleanup fails
  }
}
