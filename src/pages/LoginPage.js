// src/pages/LoginPage.js
const LoginPageLocators = require('./locators/LoginPageLocators');

/**
 * Page Object for the login page
 */
class LoginPage {
  constructor(page) {
    this.page = page;
    this.locators = new LoginPageLocators(page);
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async enterUsername(username) {
    const locator = await this.locators.getLocator('usernameInput');
    await locator.fill(username);
  }

  async enterPassword(password) {
    const locator = await this.locators.getLocator('passwordInput');
    await locator.fill(password);
  }

  async clickSubmit() {
    const locator = await this.locators.getLocator('submitButton');
    await locator.click();
  }

  async login({ username, password }) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSubmit();
  }
}

module.exports = LoginPage;