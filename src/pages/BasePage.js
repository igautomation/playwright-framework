<<<<<<< HEAD
// src/pages/BasePage.js
import logger from '../utils/common/logger.js';

class BasePage {
  constructor(page) {
    this.page = page;
    this.spinner = '[role="status"], .spinner';
    this.toast = '.toast-message, .notification';
    this.modal = '.modal, .popup';
    this.modalHeader = '.modal-header';
    this.modalClose = '.modal-close, .close-btn';
  }

  async navigateTo(path) {
    logger.info('Navigating to URL', { path });
    await this.page.goto(path);
    await this.waitForLoad();
  }

  async waitForLoad(options = { timeout: 30000 }) {
    logger.info('Waiting for page to load');
    await this.page.waitForLoadState('domcontentloaded');
    const hasSpinner = (await this.page.locator(this.spinner).count()) > 0;
    if (hasSpinner) {
      logger.info('Spinner detected, waiting for it to disappear');
      await this.page.waitForSelector(this.spinner, {
        state: 'hidden',
        timeout: options.timeout
      });
    }
    await this.page.waitForLoadState('networkidle');
    logger.info('Page load complete');
  }

  async getToastMessage() {
    const toast = this.page.locator(this.toast);
    if ((await toast.count()) > 0) {
      const message = await toast.textContent();
      logger.info('Toast message retrieved', { message });
      return message;
    }
    logger.warn('No toast message found');
    return null;
  }

  async waitForToast(options = { timeout: 10000 }) {
    logger.info('Waiting for toast message', { timeout: options.timeout });
    await this.page.waitForSelector(this.toast, {
      state: 'visible',
      timeout: options.timeout
    });
    const message = await this.getToastMessage();
    return message;
  }

  async closeModalIfPresent() {
    const modal = this.page.locator(this.modal);
    if ((await modal.count()) > 0 && (await modal.isVisible())) {
      logger.info('Modal detected, attempting to close');
      await this.page.click(this.modalClose);
      await modal.waitFor({ state: 'hidden' });
      logger.info('Modal closed successfully');
      return true;
    }
    logger.warn('No modal present to close');
    return false;
  }

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
      return this.page.getByText(locators.text, {
        exact: locators.exact ?? false
      });
    } else if (locators.label) {
      logger.debug('Trying label locator');
      return this.page.getByLabel(locators.label, {
        exact: locators.exact ?? false
      });
    } else if (locators.testId) {
      logger.debug('Trying test ID locator');
      return this.page.getByTestId(locators.testId);
    } else {
      logger.debug('Falling back to CSS locator');
      return this.page.locator(locators.css);
    }
  }

  async takeScreenshot(name) {
    const screenshotPath = `screenshots/${name}-${Date.now()}.png`;
    logger.info('Taking screenshot', { path: screenshotPath });
    return await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }
}
export default BasePage;
=======
const { expect } = require('@playwright/test');
const logger = require('../utils/common/logger');

/**
 * Base page object with common functionality
 */
class BasePage {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || '';
  }

  /**
   * Navigate to a URL
   * @param {string} path - Path to navigate to
   * @param {Object} options - Navigation options
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async navigate(path = '/', options = {}) {
    const url = new URL(path, this.baseUrl).toString();
    logger.info(`Navigating to: ${url}`);
    
    try {
      // Set default navigation options with timeout
      const navigationOptions = {
        waitUntil: 'load',
        timeout: 30000, // 30 seconds timeout
        ...options
      };
      
      await this.page.goto(url, navigationOptions);
      return this;
    } catch (error) {
      logger.error(`Navigation failed to ${url}: ${error.message}`);
      // Retry once with increased timeout if it's a timeout error
      if (error.message.includes('timeout') || error.message.includes('net::ERR')) {
        logger.info(`Retrying navigation to ${url} with increased timeout`);
        try {
          await this.page.goto(url, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 // 60 seconds timeout for retry
          });
          return this;
        } catch (retryError) {
          throw new Error(`Navigation failed after retry: ${retryError.message}`);
        }
      }
      throw error;
    }
  }

  /**
   * Click on an element
   * @param {string} selector - Element selector
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async click(selector) {
    logger.debug(`Clicking on: ${selector}`);
    await this.page.locator(selector).click();
    return this;
  }

  /**
   * Fill a form field
   * @param {string} selector - Element selector
   * @param {string} value - Value to fill
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async fill(selector, value) {
    logger.debug(`Filling ${selector} with: ${value}`);
    await this.page.locator(selector).fill(value);
    return this;
  }

  /**
   * Get text from an element
   * @param {string} selector - Element selector
   * @returns {Promise<string>} Element text
   */
  async getText(selector) {
    const text = await this.page.locator(selector).textContent();
    return text.trim();
  }

  /**
   * Check if an element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} Whether element is visible
   */
  async isVisible(selector) {
    const element = this.page.locator(selector);
    return await element.isVisible();
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - Element selector
   * @param {Object} options - Wait options
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async waitForElement(selector, options = {}) {
    await this.page.locator(selector).waitFor({ state: 'visible', ...options });
    return this;
  }

  /**
   * Wait for navigation to complete
   * @param {Object} options - Wait options
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async waitForNavigation(options = {}) {
    await this.page.waitForNavigation(options);
    return this;
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} Path to screenshot
   */
  async takeScreenshot(name) {
    const path = `screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path });
    return path;
  }

  /**
   * Verify element contains text
   * @param {string} selector - Element selector
   * @param {string} text - Expected text
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async verifyText(selector, text) {
    const element = this.page.locator(selector);
    await expect(element).toContainText(text);
    return this;
  }

  /**
   * Verify element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async verifyElementVisible(selector) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    return this;
  }

  /**
   * Verify page title
   * @param {string} title - Expected title
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async verifyTitle(title) {
    await expect(this.page).toHaveTitle(title);
    return this;
  }

  /**
   * Verify page URL
   * @param {string|RegExp} urlOrRegexp - Expected URL or regexp
   * @returns {Promise<BasePage>} This page object for chaining
   */
  async verifyUrl(urlOrRegexp) {
    await expect(this.page).toHaveURL(urlOrRegexp);
    return this;
  }
}

module.exports = BasePage;
>>>>>>> 51948a2 (Main v1.0)
