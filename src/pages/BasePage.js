/**
 * Base Page Object for Salesforce UI Pages
 */
import { expect } from '@playwright/test';

/**
 * Base Page Object with common functionality for all Salesforce pages
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    this.page = page;
    this.spinner = '[role="status"], .slds-spinner';
    this.toast = '.slds-notify_toast, .forceToastMessage';
    this.modal = '.modal-container, .slds-modal';
    this.modalHeader = '.modal-header, .slds-modal__header';
    this.modalClose = '.slds-modal__close, button.closeIcon';
  }

  /**
   * Navigate to a specific Salesforce URL
   * @param {string} path - Path to navigate to
   * @returns {Promise<void>}
   */
  async navigateTo(path) {
    await this.page.goto(path);
    await this.waitForLoad();
  }

  /**
   * Wait for page to load (spinner to disappear)
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForLoad(options = { timeout: 30000 }) {
    // First wait for the navigation to complete
    await this.page.waitForLoadState('domcontentloaded');
    
    // Then check if there's a spinner and wait for it to disappear
    const hasSpinner = await this.page.locator(this.spinner).count() > 0;
    if (hasSpinner) {
      await this.page.waitForSelector(this.spinner, { state: 'hidden', timeout: options.timeout });
    }
    
    // Finally wait for the network to be idle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get toast message text
   * @returns {Promise<string|null>} Toast message text or null if no toast is present
   */
  async getToastMessage() {
    const toast = this.page.locator(this.toast);
    if (await toast.count() > 0) {
      return await toast.textContent();
    }
    return null;
  }

  /**
   * Wait for toast message to appear
   * @param {Object} options - Options
   * @returns {Promise<string>} Toast message text
   */
  async waitForToast(options = { timeout: 10000 }) {
    await this.page.waitForSelector(this.toast, { state: 'visible', timeout: options.timeout });
    return this.getToastMessage();
  }

  /**
   * Close modal if present
   * @returns {Promise<boolean>} True if modal was closed, false if no modal was present
   */
  async closeModalIfPresent() {
    const modal = this.page.locator(this.modal);
    if (await modal.count() > 0 && await modal.isVisible()) {
      await this.page.click(this.modalClose);
      await modal.waitFor({ state: 'hidden' });
      return true;
    }
    return false;
  }

  /**
   * Get self-healing locator (tries multiple strategies)
   * @param {Object} locators - Object with different locator strategies
   * @returns {import('@playwright/test').Locator} Playwright locator
   */
  getHealingLocator(locators) {
    // Create a joint locator that will try each strategy in order
    if (locators.data) {
      // First try with data attribute (most stable in Lightning)
      return this.page.locator(locators.data);
    } else if (locators.lightning && locators.classic) {
      // Try both Lightning and Classic locators
      return this.page.locator(`${locators.lightning}, ${locators.classic}`);
    } else if (locators.text) {
      // Try by text
      return this.page.getByText(locators.text, { exact: locators.exact ?? false });
    } else if (locators.label) {
      // Try by label
      return this.page.getByLabel(locators.label, { exact: locators.exact ?? false });
    } else if (locators.testId) {
      // Try by test ID
      return this.page.getByTestId(locators.testId);
    } else {
      // Fallback to CSS
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
    return await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }
}