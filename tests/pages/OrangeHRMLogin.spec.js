/**
 * OrangeHRMLogin Tests
 * Generated from https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 * @generated
 */
const { test, expect } = require('@playwright/test');
const OrangeHRMLogin = require('../src/pages/OrangeHRMLogin');

test.describe('OrangeHRMLogin Tests', () => {
  let page;
  let orangeHRMLogin;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    orangeHRMLogin = new OrangeHRMLogin(page);
    
    // Navigate to the page
    await orangeHRMLogin.goto();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load the page successfully', async () => {
    // Verify page loaded
    await expect(page).toHaveURL(new RegExp("/web/index.php/auth/login"));
    await expect(page.locator('form')).toBeVisible();
  });
  
  test('should interact with form elements', async () => {
    // Fill Password field
    await orangeHRMLogin.fillPassword('Test value');
    
    // Submit form
    await orangeHRMLogin.clickLogin();
  });
  
  test('should navigate using links', async () => {
    // Click link link
    const navigationPromise = page.waitForNavigation();
    await orangeHRMLogin.clickLink();
    await navigationPromise;
  });
  
  
});