// src/tests/hybrid/contact-crud.spec.js
const { test, expect } = require('../../fixtures/combined');
const LoginPage = require('../../../pages/LoginPage.js');
const HomePage = require('../../../pages/HomePage.js');

test.describe('Basic UI Operations', () => {
  let loginPage;
  let homePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    await loginPage.navigate();
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-auth-token');
    });
  });

  test('should navigate to a page and verify content', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page.locator('h1')).toHaveText('Example Domain');
  });

  test('should use HomePage to verify content', async ({ page }) => {
    await page.goto('https://example.com');
    const welcomeMessage = await homePage.getWelcomeMessage();
    expect(welcomeMessage).toBe('Example Domain');
    const navLinks = await homePage.getNavLinks();
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test.afterEach(async () => {
    await loginPage.logout();
  });
});