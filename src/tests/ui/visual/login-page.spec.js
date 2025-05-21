const { test, expect } = require('@playwright/test');

test.describe('Login Page', () => {
const LoginPage = require('../../../pages/LoginPage');

test('Login page visual regression @visual', async ({ page }) => {
  const loginPage = new LoginPage(page);
});

  await loginPage.navigate(
    process.env.BASE_URL ||
      process.env.ORANGEHRM_URL
  );
  await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
});

});
