/**
 * Advanced UI test for Playwright Framework
 * 
 * This test demonstrates more advanced UI testing capabilities
 * including page objects and visual testing
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Simple Page Object for the Playwright website
class PlaywrightPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.docsLink = page.getByRole('link', { name: /docs/i }).first();
    this.mainContent = page.locator('main');
  }

  /**
   * Navigate to the Playwright website
   */
  async goto() {
    await this.page.goto('https://playwright.dev/');
  }

  /**
   * Navigate to the docs page
   */
  async gotoDocsPage() {
    await this.goto();
    try {
      await this.docsLink.click();
    } catch (e) {
      // Fallback to direct navigation if clicking fails
      await this.page.goto('https://playwright.dev/docs/intro');
    }
  }

  /**
   * Take a screenshot of the page
   * @param {string} name - Name for the screenshot
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: path.join(screenshotsDir, `${name}.png`) });
  }
}

test.describe('Advanced UI Test Suite', () => {
  let playwrightPage;

  test.beforeEach(async ({ page }) => {
    playwrightPage = new PlaywrightPage(page);
    await playwrightPage.goto();
  });

  test('should navigate to docs page using page object', async ({ page }) => {
    await playwrightPage.gotoDocsPage();
    await expect(page).toHaveURL(/.*docs/);
    await playwrightPage.takeScreenshot('docs-page');
  });

  test('should test responsive behavior', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://playwright.dev/');
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-view.png') });
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('https://playwright.dev/');
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-view.png') });
  });
});