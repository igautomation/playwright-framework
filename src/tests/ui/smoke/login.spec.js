/**
 * Login page smoke tests
 */
const { test, expect } = require('../../fixtures/baseFixtures');

test.describe('Login Page @ui @smoke', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    // Navigate to login page
    await loginPage.navigate();
  });

  test('should display login page', async ({ page, loginPage }) => {
    // Verify login page is displayed
    await expect(page).toHaveTitle(/Login/);
  });

  test('should login with valid credentials', async ({ page, loginPage }) => {
    // Login with valid credentials
    await loginPage.login(
      process.env.USERNAME || 'Admin',
      process.env.PASSWORD || 'admin123'
    );

    // Verify login was successful
    const loginSuccess = await loginPage.verifyLoginSuccess();
    expect(loginSuccess).toBeTruthy();
  });

  test('should show error with invalid credentials', async ({
    page,
    loginPage,
  }) => {
    // Login with invalid credentials
    await loginPage.login('invalid', 'invalid');

    // Verify error message is displayed
    const errorMessage = 'Invalid credentials';
    const hasError = await loginPage.verifyLoginError(errorMessage);
    expect(hasError).toBeTruthy();
  });
});
