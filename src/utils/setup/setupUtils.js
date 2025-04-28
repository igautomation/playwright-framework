// src/utils/setup/setupUtils.js
const { execSync } = require('child_process');

/**
 * Setup utilities for Playwright test environment
 */
function SetupUtils() {}

/**
 * Installs the Playwright VS Code extension
 * @returns {void}
 * @throws {Error} If installation fails
 */
SetupUtils.prototype.installPlaywrightVSCode = function () {
  try {
    execSync('code --install-extension ms-playwright.playwright', { stdio: 'inherit' });
    console.log('Playwright VS Code extension installed successfully');
  } catch (error) {
    throw new Error(`Failed to install Playwright VS Code extension: ${error.message}`);
  }
};

/**
 * Configures test retries for Playwright
 * @param {number} retries - Number of retries (non-negative integer)
 * @returns {void}
 * @throws {Error} If retries is invalid
 */
SetupUtils.prototype.configureRetry = function (retries) {
  if (typeof retries !== 'number' || retries < 0 || !Number.isInteger(retries)) {
    throw new Error('Retries must be a non-negative integer');
  }
  try {
    // Placeholder: Log retry configuration
    // In a real implementation, this could update playwright.config.js or env variables
    console.log(`Configured Playwright to retry tests ${retries} times`);
    // Example: Update environment variable for CI
    process.env.PLAYWRIGHT_RETRIES = retries.toString();
  } catch (error) {
    throw new Error(`Failed to configure retries: ${error.message}`);
  }
};

module.exports = SetupUtils;