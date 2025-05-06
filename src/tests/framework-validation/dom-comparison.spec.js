const { test, expect } = require('@playwright/test');
const DOMComparisonUtils = require('../../utils/web/domComparisonUtils');
const fs = require('fs');
const path = require('path');

test.describe('DOM Comparison Utils @validation', () => {
  test('should capture DOM snapshot', async ({ page }) => {
    // Set up test page
    await page.setContent(`
      <div>
        <h1 id="title">Test Page</h1>
        <button id="submit-button">Submit</button>
        <input type="text" name="username" />
      </div>
    `);

    const domComparisonUtils = new DOMComparisonUtils(page);
    const snapshotPath = await domComparisonUtils.captureDom('test-page');

    // Verify snapshot was saved
    expect(fs.existsSync(snapshotPath)).toBeTruthy();

    // Verify snapshot content
    const snapshotContent = fs.readFileSync(snapshotPath, 'utf8');
    expect(snapshotContent).toContain('<h1 id="title">Test Page</h1>');
    expect(snapshotContent).toContain(
      '<button id="submit-button">Submit</button>'
    );

    // Clean up
    fs.unlinkSync(snapshotPath);
  });

  test('should extract locators from DOM', async ({ page }) => {
    // Set up test page
    await page.setContent(`
      <div>
        <h1 id="title">Test Page</h1>
        <button id="submit-button">Submit</button>
        <input type="text" name="username" />
        <div data-testid="test-element">Test Element</div>
      </div>
    `);

    const domComparisonUtils = new DOMComparisonUtils(page);
    const locators = await domComparisonUtils.extractLocators();

    // Verify locators
    expect(locators).toHaveProperty('h1-title');
    expect(locators['h1-title']).toBe('#title');
    expect(locators).toHaveProperty('button-submit-button');
    expect(locators['button-submit-button']).toBe('#submit-button');
    expect(locators).toHaveProperty('input-username');
    expect(locators['input-username']).toBe('[name="username"]');
    expect(locators).toHaveProperty('div-test-element');
    expect(locators['div-test-element']).toBe('[data-testid="test-element"]');
  });

  test('should save and load locators', async ({ page }) => {
    const domComparisonUtils = new DOMComparisonUtils(page);
    const testLocators = {
      'h1-title': '#title',
      'button-submit': '#submit',
    };

    // Save locators
    domComparisonUtils.saveLocators('test-page', testLocators);

    // Load locators
    const loadedLocators = domComparisonUtils.loadLocators('test-page');

    // Verify loaded locators
    expect(loadedLocators).toEqual(testLocators);

    // Clean up
    const locatorsPath = path.join(
      domComparisonUtils.locatorsDir,
      'test-page.json'
    );
    fs.unlinkSync(locatorsPath);
  });
});
