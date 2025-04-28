// src/utils/web/webInteractions.js

/**
 * Web Interaction Utilities for Playwright Automation Framework.
 *
 * Responsibilities:
 * - Simplify common UI interactions (text, dropdown, hover, uploads, frames, tabs)
 * - Handle advanced interactions (shadow DOM, dynamic locators, retries, drag and drop)
 */

class WebInteractions {
  /**
   * Creates a new WebInteractions instance.
   *
   * @param {import('@playwright/test').Page} page - Playwright page object.
   */
  constructor(page) {
    if (!page) {
      throw new Error("Page object is required");
    }
    this.page = page;
  }

  // ---------------------------------------
  // Basic Interactions
  // ---------------------------------------

  async getText(selector) {
    if (!selector) throw new Error("Selector is required");
    const element = await this.page.locator(selector);
    const text = await element.textContent();
    if (text === null)
      throw new Error(`No text content found for selector: ${selector}`);
    return text;
  }

  async verifyText(selector, expectedText) {
    if (!selector || !expectedText)
      throw new Error("Selector and expected text are required");
    const actualText = await this.getText(selector);
    return actualText.trim() === expectedText.trim();
  }

  async handleDropdown(selector, value) {
    if (!selector || !value) throw new Error("Selector and value are required");
    await this.page.selectOption(selector, value);
  }

  async verifyDropdownValues(selector, expectedValues) {
    if (!selector || !Array.isArray(expectedValues))
      throw new Error("Selector and expected values are required");
    const options = await this.page
      .locator(`${selector} option`)
      .allTextContents();
    return (
      JSON.stringify(options.sort()) === JSON.stringify(expectedValues.sort())
    );
  }

  async mouseHover(selector) {
    if (!selector) throw new Error("Selector is required");
    await this.page.hover(selector);
  }

  async uploadFile(selector, filePath) {
    if (!selector || !filePath)
      throw new Error("Selector and file path are required");
    if (!require("fs").existsSync(filePath))
      throw new Error(`File not found: ${filePath}`);
    const fileInput = await this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  async keyboardAction(key) {
    if (!key) throw new Error("Key is required");
    await this.page.keyboard.press(key);
  }

  async handleAutocomplete(inputSelector, value, optionSelector) {
    if (!inputSelector || !value || !optionSelector)
      throw new Error(
        "Input selector, value, and option selector are required"
      );
    await this.page.fill(inputSelector, value);
    await this.page.click(optionSelector);
  }

  async handleAlert(accept) {
    const dialogPromise = new Promise((resolve) => {
      this.page.once("dialog", (dialog) => {
        if (accept) {
          dialog.accept();
        } else {
          dialog.dismiss();
        }
        resolve();
      });
    });
    await dialogPromise;
  }

  async handleFrame(frameSelector) {
    if (!frameSelector) throw new Error("Frame selector is required");
    const frame = await this.page.frameLocator(frameSelector);
    if (!frame)
      throw new Error(`Frame not found for selector: ${frameSelector}`);
    return frame;
  }

  async switchTab(index) {
    if (typeof index !== "number" || index < 0)
      throw new Error("Valid tab index is required");
    const pages = await this.page.context().pages();
    if (index >= pages.length)
      throw new Error(`Tab index ${index} out of range`);
    await pages[index].bringToFront();
    return pages[index];
  }

  async maximizeBrowser() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  // ---------------------------------------
  // Shadow DOM Interactions
  // ---------------------------------------

  /**
   * Clicks inside a shadow root element.
   */
  async clickInsideShadow(hostSelector, innerSelector) {
    if (!hostSelector || !innerSelector)
      throw new Error("Host selector and inner selector are required");
    const host = await this.page.locator(hostSelector);
    const shadowRoot = await host.evaluateHandle((el) => el.shadowRoot);
    const element = await shadowRoot.$(innerSelector);
    if (!element)
      throw new Error(`Element inside shadow DOM not found: ${innerSelector}`);
    await element.click();
  }

  /**
   * Gets text inside a shadow root element.
   */
  async getTextInsideShadow(hostSelector, innerSelector) {
    if (!hostSelector || !innerSelector)
      throw new Error("Host selector and inner selector are required");
    const host = await this.page.locator(hostSelector);
    const shadowRoot = await host.evaluateHandle((el) => el.shadowRoot);
    const element = await shadowRoot.$(innerSelector);
    if (!element)
      throw new Error(`Element inside shadow DOM not found: ${innerSelector}`);
    return await element.evaluate((el) => el.textContent);
  }

  // ---------------------------------------
  // Dynamic Locator Builders
  // ---------------------------------------

  /**
   * Builds locator by partial text.
   */
  buildLocatorByPartialText(text) {
    if (!text) throw new Error("Text is required");
    return this.page.getByText(text, { exact: false });
  }

  /**
   * Builds locator dynamically by attribute and value.
   */
  buildLocatorByAttribute(attribute, value) {
    if (!attribute || !value)
      throw new Error("Attribute and value are required");
    return this.page.locator(`[${attribute}="${value}"]`);
  }

  // ---------------------------------------
  // Smart Actions
  // ---------------------------------------

  /**
   * Waits for element to be visible before clicking.
   */
  async safeClick(selector) {
    if (!selector) throw new Error("Selector is required");
    const element = this.page.locator(selector);
    await element.waitFor({ state: "visible", timeout: 5000 });
    await element.click();
  }

  /**
   * Clears an input field and types safely.
   */
  async clearAndType(selector, text) {
    if (!selector || !text) throw new Error("Selector and text are required");
    const input = this.page.locator(selector);
    await input.fill("");
    await input.type(text);
  }

  /**
   * Performs drag and drop from one element to another.
   */
  async dragAndDrop(sourceSelector, targetSelector) {
    if (!sourceSelector || !targetSelector)
      throw new Error("Source and target selectors are required");
    const source = await this.page.locator(sourceSelector);
    const target = await this.page.locator(targetSelector);
    await source.dragTo(target);
  }
}

module.exports = WebInteractions;
