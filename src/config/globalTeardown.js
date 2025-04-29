// src/config/globalTeardown.js

/**
 * Global Teardown Script for Playwright Automation Framework.
 *
 * Purpose:
 * - This script runs once after all tests are completed.
 * - It ensures cleanup of temporary artifacts such as storage state files.
 * - Improves CI/CD hygiene by removing old session data.
 */

import fs from "fs-extra";
import path from "path";

/**
 * Global teardown function.
 * Deletes the storageState file if it exists to clean up the local environment.
 */
module.exports = async () => {
  const storageStatePath =
    process.env.STORAGE_STATE || "test-results/storageState.json";

  console.log("Starting global teardown: cleaning up storage state.");

  try {
    // Check if storageState file exists and remove it
    if (await fs.pathExists(storageStatePath)) {
      await fs.remove(storageStatePath);
      console.log(`Storage state file removed: ${storageStatePath}`);
    } else {
      console.log("No storage state file found to remove.");
    }
  } catch (error) {
    console.error("Error during global teardown:", error);
    process.exit(1); // Exit with failure code if teardown fails
  }
};
