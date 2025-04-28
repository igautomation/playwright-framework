// src/config/globalSetup.js

// Import required Playwright modules
const { chromium } = require('@playwright/test');
// Import utility to read data files
const { readData } = require('../utils/common/dataUtils');
// Import BasePage for consistent page interactions
const BasePage = require('../pages/BasePage');
// Import winston logger for structured logging (inspired by Boyka Framework)
const logger = require('../utils/logger');

// Global setup function for Playwright
// - Authenticates a user and saves the storage state for use in tests
// - Extracts an authentication token and sets it as an environment variable
// - Uses structured logging for better debugging (inspired by Boyka Framework)
// - Supports multi-user authentication by loading credentials dynamically
async function globalSetup(config) {
  const { baseURL, storageState } = config.projects[0].use;
  logger.info('Starting global setup', { baseURL, storageStatePath: storageState });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const basePage = new BasePage(page); // Use BasePage for navigation and common functionality

  try {
    // Start tracing with screenshots and snapshots for debugging
    const tracePath = `./test-results/setup-trace-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    await context.tracing.start({ screenshots: true, snapshots: true });
    logger.info('Tracing started', { tracePath });

    // Load credentials dynamically (supports multi-user authentication, inspired by Boyka Framework)
    const credentials = await readData('src/data/json/credentials.json');
    const user = credentials.users.find(u => u.role === 'admin'); // Use admin user for setup
    if (!user) {
      throw new Error('Admin user not found in credentials.json');
    }
    const username = process.env.SF_USERNAME || user.username;
    const password = process.env.SF_PASSWORD || user.password;
    logger.info('Loaded credentials for authentication', { username });

    // Navigate to the base URL using BasePage
    await basePage.navigateTo(baseURL);

    // Mock authentication for example.com (since it lacks a login form)
    // For Salesforce, this would be replaced with actual login logic
    logger.info('Mocking authentication for example.com');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-auth-token');
    });
    logger.info('Mock auth token set in local storage');

    // Optionally, for Salesforce authentication (commented out for now)
    /*
    logger.info('Performing Salesforce authentication');
    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await basePage.waitForLoad();
    logger.info('Submitted Salesforce login form');
    const isLoggedIn = await page.locator('h1').textContent();
    if (!isLoggedIn.includes('Salesforce')) {
      throw new Error('Salesforce login failed');
    }
    logger.info('Salesforce login successful');
    */

    // Extract authentication token
    const token = await page.evaluate(() => localStorage.getItem('authToken')) || 'mock-auth-token';
    process.env.AUTH_TOKEN = token;
    logger.info('Authentication token extracted and set', { token });

    // Save storage state for use in tests
    await context.storageState({ path: storageState });
    logger.info('Storage state saved', { storageStatePath: storageState });

    // Take a screenshot for debugging
    await basePage.takeScreenshot('global-setup');

    // Stop tracing on success
    await context.tracing.stop({ path: tracePath });
    logger.info('Tracing stopped on success', { tracePath });

    await browser.close();
    logger.info('Browser closed, global setup completed successfully');
  } catch (error) {
    // Take a screenshot on failure
    await basePage.takeScreenshot('global-setup-failure');

    // Stop tracing on failure and save trace for debugging
    const failedTracePath = `./test-results/failed-setup-trace-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    await context.tracing.stop({ path: failedTracePath });
    logger.error('Global setup failed', { error: error.message, failedTracePath });

    await browser.close();
    logger.info('Browser closed after failure');

    throw error; // Re-throw to fail the setup process
  }
}

module.exports = globalSetup;