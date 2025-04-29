// src/pages/BasePage.js
import logger from '../utils/common/logger.js';

class BasePage {
  constructor(page) {
    this.page = page;
    this.spinner = '[role="status"], .spinner';
    this.toast = ".toast-message, .notification";
    this.modal = ".modal, .popup";
    this.modalHeader = ".modal-header";
    this.modalClose = ".modal-close, .close-btn";
  }

  async navigateTo(path) {
    logger.info("Navigating to URL", { path });
    await this.page.goto(path);
    await this.waitForLoad();
  }

  async waitForLoad(options = { timeout: 30000 }) {
    logger.info("Waiting for page to load");
    await this.page.waitForLoadState("domcontentloaded");
    const hasSpinner = (await this.page.locator(this.spinner).count()) > 0;
    if (hasSpinner) {
      logger.info("Spinner detected, waiting for it to disappear");
      await this.page.waitForSelector(this.spinner, {
        state: "hidden",
        timeout: options.timeout,
      });
    }
    await this.page.waitForLoadState("networkidle");
    logger.info("Page load complete");
  }

  async getToastMessage() {
    const toast = this.page.locator(this.toast);
    if ((await toast.count()) > 0) {
      const message = await toast.textContent();
      logger.info("Toast message retrieved", { message });
      return message;
    }
    logger.warn("No toast message found");
    return null;
  }

  async waitForToast(options = { timeout: 10000 }) {
    logger.info("Waiting for toast message", { timeout: options.timeout });
    await this.page.waitForSelector(this.toast, {
      state: "visible",
      timeout: options.timeout,
    });
    const message = await this.getToastMessage();
    return message;
  }

  async closeModalIfPresent() {
    const modal = this.page.locator(this.modal);
    if ((await modal.count()) > 0 && (await modal.isVisible())) {
      logger.info("Modal detected, attempting to close");
      await this.page.click(this.modalClose);
      await modal.waitFor({ state: "hidden" });
      logger.info("Modal closed successfully");
      return true;
    }
    logger.warn("No modal present to close");
    return false;
  }

  getHealingLocator(locators) {
    logger.info("Getting self-healing locator", { locators });
    if (locators.data) {
      logger.debug("Trying data attribute locator");
      return this.page.locator(locators.data);
    } else if (locators.lightning && locators.classic) {
      logger.debug("Trying both Lightning and Classic locators");
      return this.page.locator(`${locators.lightning}, ${locators.classic}`);
    } else if (locators.text) {
      logger.debug("Trying text locator");
      return this.page.getByText(locators.text, {
        exact: locators.exact ?? false,
      });
    } else if (locators.label) {
      logger.debug("Trying label locator");
      return this.page.getByLabel(locators.label, {
        exact: locators.exact ?? false,
      });
    } else if (locators.testId) {
      logger.debug("Trying test ID locator");
      return this.page.getByTestId(locators.testId);
    } else {
      logger.debug("Falling back to CSS locator");
      return this.page.locator(locators.css);
    }
  }

  async takeScreenshot(name) {
    const screenshotPath = `screenshots/${name}-${Date.now()}.png`;
    logger.info("Taking screenshot", { path: screenshotPath });
    return await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }
}
export default BasePage;