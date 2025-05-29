// @ts-check
/**
 * Base class for Salesforce page objects
 */
class BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for Salesforce page to load
   */
  async waitForPageLoad() {
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(e => {
      console.log('Network did not reach idle state, continuing anyway');
    });
    
    // Wait for DOM content to be loaded
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    
    // Wait for Salesforce spinner to disappear if present
    const spinner = this.page.locator('.slds-spinner_container, .slds-spinner');
    if (await spinner.isVisible({ timeout: 1000 }).catch(() => false)) {
      await spinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(e => {
        console.log('Spinner did not disappear, continuing anyway');
      });
    }
    
    // Small additional wait to ensure UI is stable
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get toast message content
   * @returns {Promise<string>} Toast message text
   */
  async getToastMessage() {
    const toast = this.page.locator('.slds-notify__content');
    await toast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return toast.textContent();
  }

  /**
   * Check if toast message is visible
   * @param {string} partialText - Text to look for in toast
   * @returns {Promise<boolean>} True if toast with text is visible
   */
  async isToastVisible(partialText) {
    const toast = this.page.locator('.slds-notify__content');
    const isVisible = await toast.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!isVisible) return false;
    
    if (partialText) {
      const text = await toast.textContent();
      return text.includes(partialText);
    }
    
    return true;
  }
  
  /**
   * Take a screenshot with a descriptive name
   * @param {string} name - Name for the screenshot
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `./screenshots/salesforce-${name}-${Date.now()}.png`,
      fullPage: true
    });
  }
}

module.exports = BaseSalesforcePage;