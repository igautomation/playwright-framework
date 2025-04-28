// src/utils/setup/setupUtils.js

/**
 * Setup Utilities for Playwright Automation Framework.
 *
 * Responsibilities:
 * - Install Playwright VS Code extensions
 * - Configure test retry settings dynamically
 */

const { execSync } = require("child_process");

/**
 * Constructor for SetupUtils.
 */
function SetupUtils() {}

/**
 * Installs the Playwright extension in Visual Studio Code.
 *
 * @throws {Error} If installation fails.
 */
SetupUtils.prototype.installPlaywrightVSCode = function () {
  try {
    execSync("code --install-extension ms-playwright.playwright", {
      stdio: "inherit",
    });
    console.log("Playwright VS Code extension installed successfully");
  } catch (error) {
    throw new Error(
      `Failed to install Playwright VS Code extension: ${error.message}`
    );
  }
};

/**
 * Configures the number of retries for Playwright tests.
 *
 * @param {number} retries - Non-negative integer representing retry attempts.
 * @throws {Error} If retries value is invalid.
 */
SetupUtils.prototype.configureRetry = function (retries) {
  if (
    typeof retries !== "number" ||
    retries < 0 ||
    !Number.isInteger(retries)
  ) {
    throw new Error("Retries must be a non-negative integer");
  }
  try {
    // This implementation logs the configuration.
    // In real scenarios, this could update playwright.config.js or environment variables dynamically.
    console.log(`Configured Playwright to retry tests ${retries} times`);

    // Example: Set environment variable (for CI/CD runners that read it)
    process.env.PLAYWRIGHT_RETRIES = retries.toString();
  } catch (error) {
    throw new Error(`Failed to configure retries: ${error.message}`);
  }
};

module.exports = SetupUtils;
