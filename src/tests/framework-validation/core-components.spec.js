const { test, expect } = require('@playwright/test');
const BasePage = require('../../pages/BasePage');
const WebInteractions = require('../../utils/web/webInteractions');
const ScreenshotUtils = require('../../utils/web/screenshotUtils');
const SelfHealingLocator = require('../../utils/web/SelfHealingLocator');
const ApiUtils = require('../../utils/api/apiUtils');
const TestDataFactory = require('../../utils/common/testDataFactory');

test.describe('Framework Core Components @validation', () => {
  test('BasePage should be instantiable', async ({ page }) => {
    const basePage = new BasePage(page);
    expect(basePage).toBeDefined();
    expect(basePage.page).toBe(page);
  });

  test('WebInteractions should be instantiable', async ({ page }) => {
    const webInteractions = new WebInteractions(page);
    expect(webInteractions).toBeDefined();
    expect(webInteractions.page).toBe(page);
  });

  test('ScreenshotUtils should be instantiable', async ({ page }) => {
    const screenshotUtils = new ScreenshotUtils(page);
    expect(screenshotUtils).toBeDefined();
    expect(screenshotUtils.page).toBe(page);
  });

  test('SelfHealingLocator should be instantiable', async ({ page }) => {
    const selfHealingLocator = new SelfHealingLocator(page);
    expect(selfHealingLocator).toBeDefined();
    expect(selfHealingLocator.page).toBe(page);
  });

  test('ApiUtils should be instantiable', async () => {
    const apiUtils = new ApiUtils('https://example.com/api');
    expect(apiUtils).toBeDefined();
    expect(apiUtils.baseUrl).toBe('https://example.com/api');
  });

  test('TestDataFactory should generate data', async () => {
    const user = TestDataFactory.generateUser();
    expect(user).toBeDefined();
    expect(user.username).toBeDefined();
    expect(user.email).toBeDefined();
  });
});
