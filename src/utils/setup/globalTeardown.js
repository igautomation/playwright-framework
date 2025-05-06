/**
 * Global teardown for Playwright tests
 *
 * This file is executed once after all tests
 * @see https://playwright.dev/docs/test-global-setup-teardown
 */
const logger = require('../common/logger');

/**
 * Global teardown function
 */
async function globalTeardown() {
  logger.info('Starting global teardown');

  // Clean up resources if needed
  // For example, closing database connections, removing temporary files, etc.

  logger.info('Global teardown completed');
}

module.exports = globalTeardown;
