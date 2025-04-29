// src/utils/setup/setupUtils.js

/**
 * Setup Utilities for Playwright Automation Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Install Playwright VS Code extensions
 * - Configure test retry settings dynamically
 */

import { execSync } from 'child_process';

class SetupUtils {
  constructor() {}

  /**
   * Installs the Playwright extension in Visual Studio Code.
   */
  installPlaywrightVSCode() {
    try {
      execSync('code --install-extension ms-playwright.playwright', {
        stdio: 'inherit'
      });
      console.log('Playwright VS Code extension installed successfully');
    } catch (error) {
      throw new Error(
        `Failed to install Playwright VS Code extension: ${error.message}`
      );
    }
  }

  /**
   * Configures the number of retries for Playwright tests.
   *
   * @param {number} retries - Non-negative integer representing retry attempts.
   */
  configureRetry(retries) {
    if (typeof retries !== 'number' || retries < 0 || !Number.isInteger(retries)) {
      throw new Error('Retries must be a non-negative integer');
    }
    try {
      console.log(`Configured Playwright to retry tests ${retries} times`);

      // Set environment variable for CI/CD runners
      process.env.PLAYWRIGHT_RETRIES = retries.toString();
    } catch (error) {
      throw new Error(`Failed to configure retries: ${error.message}`);
    }
  }
}

export default SetupUtils;