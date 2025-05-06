const { test, expect } = require('@playwright/test');
const SelfHealingLocator = require('../../utils/web/SelfHealingLocator');
const fs = require('fs');
const path = require('path');

test.describe('Self-Healing Locator @validation', () => {
  test('should find element with primary selector', async ({ page }) => {
    // Set up test page
    await page.setContent(`
      <div>
        <button id="test-button">Click Me</button>
      </div>
    `);

    const selfHealingLocator = new SelfHealingLocator(page);
    const locator = await selfHealingLocator.getLocator('#test-button');

    expect(await locator.count()).toBe(1);
    await expect(locator).toHaveText('Click Me');
  });

  test('should use fallback selector when primary selector fails', async ({
    page,
  }) => {
    // Set up test page
    await page.setContent(`
      <div>
        <button data-testid="test-button">Click Me</button>
      </div>
    `);

    const selfHealingLocator = new SelfHealingLocator(page);
    const locator = await selfHealingLocator.getLocator('#test-button', [
      '[data-testid="test-button"]',
    ]);

    expect(await locator.count()).toBe(1);
    await expect(locator).toHaveText('Click Me');
  });

  test('should store healed locators', async ({ page }) => {
    // Set up test page
    await page.setContent(`
      <div>
        <button data-testid="test-button">Click Me</button>
      </div>
    `);

    const selfHealingLocator = new SelfHealingLocator(page);

    // Clean up any existing healed locators file
    const healedLocatorsPath = path.resolve(
      process.cwd(),
      'data/healed-locators.json'
    );
    if (fs.existsSync(healedLocatorsPath)) {
      fs.unlinkSync(healedLocatorsPath);
    }

    // Get locator with fallback
    const locator = await selfHealingLocator.getLocator('#missing-button', [
      '[data-testid="test-button"]',
    ]);

    // Verify locator works
    expect(await locator.count()).toBe(1);
    await expect(locator).toHaveText('Click Me');

    // Verify healed locator was stored
    expect(fs.existsSync(healedLocatorsPath)).toBeTruthy();

    const healedLocators = JSON.parse(
      fs.readFileSync(healedLocatorsPath, 'utf8')
    );
    expect(healedLocators).toHaveProperty('#missing-button');
    expect(healedLocators['#missing-button']).toBe(
      '[data-testid="test-button"]'
    );
  });
});
