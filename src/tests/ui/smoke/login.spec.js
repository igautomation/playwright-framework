// src/tests/ui/smoke/login.spec.js
require('module-alias/register');

const { test, expect } = require('@fixtures/combined');
const LoginPage = require('@pages/LoginPage');
const { readData } = require('@utils/common/dataUtils');

async function runLoginTests() {
  const credentials = await readData("src/data/json/credentials.json");
  const users = credentials.users;

  users.forEach((user) => {
    test.describe(`Login Tests for ${user.role}`, () => {
      let loginPage;

      test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await page.goto("https://example.com");
        await page.evaluate(() => {
          localStorage.setItem("authToken", "mock-auth-token");
        });
      });

      test(`Navigate with ${user.username}`, async ({ page }) => {
        const isLoggedIn = await loginPage.verifyLoginSuccess();
        expect(isLoggedIn).toBe(true);
        await expect(page.locator("h1")).toHaveText("Example Domain");
      });

      test.afterEach(async ({ page }) => {
        console.log(`After test for ${user.username}: URL is ${page.url()}`);
        await loginPage.logout();
      });
    });
  });
}

runLoginTests();
