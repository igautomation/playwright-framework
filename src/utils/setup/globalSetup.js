/**
 * Global setup for Playwright tests
 *
 * This file is executed once before all tests
 * @see https://playwright.dev/docs/test-global-setup-teardown
 */
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

/**
 * Global setup function
 */
async function globalSetup() {
  logger.info('Starting global setup');

  // Create necessary directories
  const dirs = [
    'reports/screenshots',
    'reports/videos',
    'reports/traces',
    'reports/html',
    'reports/allure',
    'test-results',
  ];

  dirs.forEach((dir) => {
    const dirPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Created directory: ${dirPath}`);
    }
  });

  // Set up environment variables if needed
  if (!process.env.BASE_URL) {
    logger.warn('BASE_URL environment variable not set, using default');
  }

  // Additional setup tasks can be added here
  // For example, setting up test data, database connections, etc.

  logger.info('Global setup completed');
}

module.exports = globalSetup;
