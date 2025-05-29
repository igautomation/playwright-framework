/**
 * OrangeHRMLogin Page Object
 * Generated from https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 * @generated
 */
const { BasePage } = require('./orangehrm/BasePage');

class OrangeHRMLogin extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Page URL
    this.url = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

    // Selectors
    // Buttons
    this.loginButton = 'button[type="submit"]';

    // Inputs
    this.username = '[name="username"]';
    this.password = '[name="password"]';

    // Links
    this.forgotPasswordLink = '.orangehrm-login-forgot p';

    // Forms
    this.form = 'form';

    // Containers
    this.container = '.orangehrm-login-container';
    this.oxd_toaster_1 = '#oxd-toaster_1';
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    // Wait for main content to be available
    await this.page.waitForSelector('body', { timeout: 30000 });
  }

  /**
   * Login with credentials
   * @param {string} username
   * @param {string} password
   */
  async loginWithCredentials(username, password) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Login button
   */
  async clickLogin() {
    await this.click(this.loginButton);
  }

  /**
   * Fill Username
   * @param {string} value
   */
  async fillUsername(value) {
    await this.fill(this.username, value);
  }

  /**
   * Fill Password
   * @param {string} value
   */
  async fillPassword(value) {
    await this.fill(this.password, value);
  }

  /**
   * Click Forgot Password link
   */
  async clickForgotPassword() {
    await this.click(this.forgotPasswordLink);
  }

  /**
   * Submit form
   */
  async submitForm() {
    await this.page.evaluate(selector => {
      document.querySelector(selector).submit();
    }, this.form);
  }

  /**
   * Get error message text
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    const errorSelector = '.oxd-alert-content-text';
    await this.page
      .waitForSelector(errorSelector, { state: 'visible', timeout: 5000 })
      .catch(() => {});
    return await this.page
      .locator(errorSelector)
      .textContent()
      .catch(() => '');
  }

  /**
   * Check if login page is displayed
   * @returns {Promise<boolean>}
   */
  async isLoginPageDisplayed() {
    return await this.isVisible(this.container);
  }
}

module.exports = OrangeHRMLogin;
