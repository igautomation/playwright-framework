// @ts-check
const BaseSalesforcePage = require('./BaseSalesforcePage');

/**
 * Page object for Salesforce login page
 */
class LoginPage extends BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Log In' });
  }

  /**
   * Navigate to login page
   * @param {string} loginUrl - Salesforce login URL
   */
  async navigate(loginUrl) {
    await this.page.goto(loginUrl);
    await this.waitForPageLoad();
  }

  /**
   * Login to Salesforce
   * @param {string} username - Salesforce username
   * @param {string} password - Salesforce password
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForPageLoad();
  }
}

module.exports = LoginPage;