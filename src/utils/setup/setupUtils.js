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

  configureRetry(retries) {
    if (typeof retries !== 'number' || retries < 0 || !Number.isInteger(retries)) {
      throw new Error('Retries must be a non-negative integer');
    }
    try {
      console.log(`Configured Playwright to retry tests ${retries} times`);
      process.env.PLAYWRIGHT_RETRIES = retries.toString();
    } catch (error) {
      throw new Error(`Failed to configure retries: ${error.message}`);
    }
  }
}

const setupUtils = new SetupUtils();

// ✅ Export **instance methods** directly for easy usage
export const installPlaywrightVSCode = setupUtils.installPlaywrightVSCode.bind(setupUtils);
export const configureRetry = setupUtils.configureRetry.bind(setupUtils);
