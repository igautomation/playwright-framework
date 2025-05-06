const { test, expect } = require('@playwright/test');
const LoginPage = require('../../../pages/LoginPage');

test('Login page visual regression @visual', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate(
    process.env.BASE_URL ||
      'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login'
  );
  await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
});
