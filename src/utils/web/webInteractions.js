// src/utils/web/webInteractions.js

/**
 * Web Interaction Utilities for Playwright Automation Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Simplify common UI interactions (text, dropdowns, hover, uploads, frames, tabs)
 * - Handle advanced interactions (shadow DOM, dynamic locators, retries, drag and drop)
 */

import { expect } from '@playwright/test';

class WebInteractions {
  constructor(page) {
    if (!page) {
      throw new Error('Page object is required');
    }
    this.page = page;
  }

  // ---------------------------------------
  // Basic Interactions
  // ---------------------------------------

  async getText(selector) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    const text = await element.textContent();
    if (text === null) {
      throw new Error(`No text content found for selector: ${selector}`);
    }
    return text;
  }

  async verifyText(selector, expectedText) {
    if (!selector || !expectedText) {
      throw new Error('Selector and expected text are required');
    }
    const actualText = await this.getText(selector);
    return actualText.trim() === expectedText.trim();
  }

  async handleDropdown(selector, value) {
    if (!selector || !value) throw new Error('Selector and value are required');
    await this.page.selectOption(selector, value);
  }

  async verifyDropdownValues(selector, expectedValues) {
    if (!selector || !Array.isArray(expectedValues)) {
      throw new Error('Selector and expected values are required');
    }
    const options = await this.page.locator(`${selector} option`).allTextContents();
    return JSON.stringify(options.sort()) === JSON.stringify(expectedValues.sort());
  }

  async mouseHover(selector) {
    if (!selector) throw new Error('Selector is required');
    await this.page.hover(selector);
  }

  async uploadFile(selector, filePath) {
    if (!selector || !filePath) throw new Error('Selector and file path are required');
    const { existsSync } = await import('fs');
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileInput = this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  async keyboardAction(key) {
    if (!key) throw new Error('Key is required');
    await this.page.keyboard.press(key);
  }

  async handleAutocomplete(inputSelector, value, optionSelector) {
    if (!inputSelector || !value || !optionSelector) {
      throw new Error('Input selector, value, and option selector are required');
    }
    await this.page.fill(inputSelector, value);
    await this.page.click(optionSelector);
  }

  async handleAlert(accept) {
    await new Promise((resolve) => {
      this.page.once('dialog', (dialog) => {
        if (accept) {
          dialog.accept();
        } else {
          dialog.dismiss();
        }
        resolve();
      });
    });
  }

  async handleFrame(frameSelector) {
    if (!frameSelector) throw new Error('Frame selector is required');
    const frame = this.page.frameLocator(frameSelector);
    if (!frame) {
      throw new Error(`Frame not found for selector: ${frameSelector}`);
    }
    return frame;
  }

  async switchTab(index) {
    if (typeof index !== 'number' || index < 0) {
      throw new Error('Valid tab index is required');
    }
    const pages = await this.page.context().pages();
    if (index >= pages.length) {
      throw new Error(`Tab index ${index} out of range`);
    }
    await pages[index].bringToFront();
    return pages[index];
  }

  async maximizeBrowser() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  // ---------------------------------------
  // Shadow DOM Interactions
  // ---------------------------------------

  async clickInsideShadow(hostSelector, innerSelector) {
    if (!hostSelector || !innerSelector) {
      throw new Error('Host selector and inner selector are required');
    }
    const host = this.page.locator(hostSelector);
    const shadowRoot = await host.evaluateHandle((el) => el.shadowRoot);
    const element = await shadowRoot.$(innerSelector);
    if (!element) {
      throw new Error(`Element inside shadow DOM not found: ${innerSelector}`);
    }
    await element.click();
  }

  async getTextInsideShadow(hostSelector, innerSelector) {
    if (!hostSelector || !innerSelector) {
      throw new Error('Host selector and inner selector are required');
    }
    const host = this.page.locator(hostSelector);
    const shadowRoot = await host.evaluateHandle((el) => el.shadowRoot);
    const element = await shadowRoot.$(innerSelector);
    if (!element) {
      throw new Error(`Element inside shadow DOM not found: ${innerSelector}`);
    }
    return await element.evaluate((el) => el.textContent);
  }

  // ---------------------------------------
  // Dynamic Locator Builders
  // ---------------------------------------

  buildLocatorByPartialText(text) {
    if (!text) throw new Error('Text is required');
    return this.page.getByText(text, { exact: false });
  }

  buildLocatorByAttribute(attribute, value) {
    if (!attribute || !value) {
      throw new Error('Attribute and value are required');
    }
    return this.page.locator(`[${attribute}="${value}"]`);
  }

  // ---------------------------------------
  // Smart Actions
  // ---------------------------------------

  async safeClick(selector) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 5000 });
    await element.click();
  }

  async clearAndType(selector, text) {
    if (!selector || !text) throw new Error('Selector and text are required');
    const input = this.page.locator(selector);
    await input.fill('');
    await input.type(text);
  }

  async dragAndDrop(sourceSelector, targetSelector) {
    if (!sourceSelector || !targetSelector) {
      throw new Error('Source and target selectors are required');
    }
    const source = this.page.locator(sourceSelector);
    const target = this.page.locator(targetSelector);
    await source.dragTo(target);
  }

  async scrollIntoView(selector) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  async waitForClickable(selector, timeout = 5000) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    await expect(element).toBeEnabled({ timeout });
  }

  async retryClick(selector, retries = 3, delayMs = 1000) {
    if (!selector) throw new Error('Selector is required');
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const element = this.page.locator(selector);
        await element.click();
        return;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Retry click failed after ${retries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  async doubleClick(selector) {
    if (!selector) throw new Error('Selector is required');
    await this.page.dblclick(selector);
  }

  async rightClick(selector) {
    if (!selector) throw new Error('Selector is required');
    await this.page.click(selector, { button: 'right' });
  }

  async waitForUrl(urlPart, timeout = 10000) {
    if (!urlPart) throw new Error('URL part is required');
    await this.page.waitForURL(`**${urlPart}**`, { timeout });
  }

  async dragByOffset(selector, xOffset, yOffset) {
    if (!selector) throw new Error('Selector is required');
    const element = this.page.locator(selector);
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Bounding box not found for ${selector}`);
    }
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(
      box.x + box.width / 2 + xOffset,
      box.y + box.height / 2 + yOffset
    );
    await this.page.mouse.up();
  }
}

export default WebInteractions;