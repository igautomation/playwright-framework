// src/config/globalSetup.js

/**
 * Global Setup for Playwright Framework
 * - Launches browser
 * - Loads base URL
 * - Injects or mocks login token
 * - Saves storage state
 * - Traces and logs outcome
 */

import { chromium } from '@playwright/test';
import { readJson } from '../utils/common/dataOrchestrator.js';
import BasePage from '../pages/BasePage.js';
import logger from '../utils/common/logger.js';
import path from 'path';

/**
 * Playwright global setup hook
 * Runs before any test executes (once per run)
 */
export default async function globalSetup(config) {
  const { baseURL, storageState } = config.projects[0].use;

  logger.info('Global setup started', { baseURL });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const basePage = new BasePage(page);

  try {
    // Start tracing
    const traceFile = `./test-results/setup-trace-${Date.now()}.zip`;
    await context.tracing.start({ screenshots: true, snapshots: true });

    // Load admin credentials from JSON
    const credentials = readJson('src/data/json/credentials.json');
    const user = credentials.users.find((u) => u.role === 'admin');
    if (!user) throw new Error('No admin user found');

    const username = process.env.TEST_USERNAME || user.username;
    const password = process.env.TEST_PASSWORD || user.password;

    logger.info('Using credentials for global setup', { username });

    // Navigate to the login page
    await basePage.navigateTo(baseURL);

    // Mock or inject auth token
    const token = process.env.AUTH_TOKEN || 'mock-auth-token';
    await page.evaluate((t) => localStorage.setItem('authToken', t), token);

    logger.info('Authentication token injected', { token });

    // Save session state
    await context.storageState({ path: storageState });
    logger.info('Storage state saved', { path: storageState });

    await basePage.takeScreenshot('global-setup');

    // Stop tracing
    await context.tracing.stop({ path: traceFile });
    logger.info('Tracing complete', { traceFile });

    await browser.close();
    logger.info('Global setup completed');
  } catch (error) {
    const failTrace = `./test-results/failed-setup-trace-${Date.now()}.zip`;
    await basePage.takeScreenshot('global-setup-failure');
    await context.tracing.stop({ path: failTrace });
    logger.error('Global setup failed', { error: error.message, failTrace });

    await browser.close();
    throw error;
  }
}
