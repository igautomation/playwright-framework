// src/pages/BasePage.js

/**
 * Base Page Object with common functionality for all pages
 */
const logger = require('../utils/logger');

// Base Page Object class
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    this.page = page;
    this.spinner = '[role="status"], .spinner'; // Generic spinner selector
    this.toast = '.toast-message, .notification'; // Generic toast selector
    this.modal = '.modal, .popup'; // Generic modal selector
    this.modalHeader = '.modal-header';
    this.modalClose = '.modal-close, .close-btn';
  }

  /**
   * Navigate to a specific URL
   * @param {string} path - Path to navigate to
   * @returns {Promise<void>}
   */
  async navigateTo(path) {
    logger.info('Navigating to URL', { path });
    await this.page.goto(path);
    await this.waitForLoad();
  }

  /**
   * Wait for page to load (spinner to disappear)
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForLoad(options = { timeout: 30000 }) {
    logger.info('Waiting for page to load');
    // Wait for the DOM to load
    await this.page.waitForLoadState('domcontentloaded');

    // Check for a spinner and wait for it to disappear
    const hasSpinner = await this.page.locator(this.spinner).count() > 0;
    if (hasSpinner) {
      logger.info('Spinner detected, waiting for it to disappear');
      await this.page.waitForSelector(this.spinner, { state: 'hidden', timeout: options.timeout });
    }

    // Wait for the network to be idle
    await this.page.waitForLoadState('networkidle');
    logger.info('Page load complete');
  }

  /**
   * Get toast message text
   * @returns {Promise<string|null>} Toast message text or null if no toast is present
   */
  async getToastMessage() {
    const toast = this.page.locator(this.toast);
    if (await toast.count() > 0) {
      const message = await toast.textContent();
      logger.info('Toast message retrieved', { message });
      return message;
    }
    logger.warn('No toast message found');
    return null;
  }

  /**
   * Wait for toast message to appear
   * @param {Object} options - Options
   * @returns {Promise<string>} Toast message text
   */
  async waitForToast(options = { timeout: 10000 }) {
    logger.info('Waiting for toast message', { timeout: options.timeout });
    await this.page.waitForSelector(this.toast, { state: 'visible', timeout: options.timeout });
    const message = await this.getToastMessage();
    return message;
  }

  /**
   * Close modal if present
   * @returns {Promise<boolean>} True if modal was closed, false if no modal was present
   */
  async closeModalIfPresent() {
    const modal = this.page.locator(this.modal);
    if (await modal.count() > 0 && await modal.isVisible()) {
      logger.info('Modal detected, attempting to close');
      await this.page.click(this.modalClose);
      await modal.waitFor({ state: 'hidden' });
      logger.info('Modal closed successfully');
      return true;
    }
    logger.warn('No modal present to close');
    return false;
  }

  /**
   * Get self-healing locator (tries multiple strategies)
   * @param {Object} locators - Object with different locator strategies
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  getHealingLocator(locators) {
    logger.info('Getting self-healing locator', { locators });
    if (locators.data) {
      logger.debug('Trying data attribute locator');
      return this.page.locator(locators.data);
    } else if (locators.lightning && locators.classic) {
      logger.debug('Trying both Lightning and Classic locators');
      return this.page.locator(`${locators.lightning}, ${locators.classic}`);
    } else if (locators.text) {
      logger.debug('Trying text locator');
      return this.page.getByText(locators.text, { exact: locators.exact ?? false });
    } else if (locators.label) {
      logger.debug('Trying label locator');
      return this.page.getByLabel(locators.label, { exact: locators.exact ?? false });
    } else if (locators.testId) {
      logger.debug('Trying test ID locator');
      return this.page.getByTestId(locators.testId);
    } else {
      logger.debug('Falling back to CSS locator');
      return this.page.locator(locators.css);
    }
  }

  /**
   * Take screenshot with meaningful name
   * @param {string} name - Screenshot name
   * @returns {Promise<Buffer>} Screenshot
   */
  async takeScreenshot(name) {
    const screenshotPath = `screenshots/${name}-${Date.now()}.png`;
    logger.info('Taking screenshot', { path: screenshotPath });
    return await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }
}

module.exports = BasePage;