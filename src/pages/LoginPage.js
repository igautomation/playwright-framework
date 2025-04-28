// src/pages/LoginPage.js
const BasePage = require("./BasePage");
require('module-alias/register');
const logger = require('@utils/common/logger');
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = "#username";
    this.passwordInput = "#password";
    this.submitButton = 'button[type="submit"]';
    this.errorMessage = ".error-message";
    this.logoutButton = ".logout-btn";
  }

  async login(username, password) {
    logger.info("Attempting login", { username });
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
    await this.waitForLoad();
    logger.info("Login form submitted");
  }

  async verifyLoginSuccess() {
    const welcomeMessage = await this.page.locator("h1").textContent();
    logger.info("Verifying login success", { welcomeMessage });
    return (
      welcomeMessage.includes("Welcome") ||
      welcomeMessage.includes("Example Domain")
    );
  }

  async logout() {
    logger.info("Attempting logout");
    await this.page.click(this.logoutButton);
    await this.page.waitForURL("**/login", { timeout: 5000 });
    await this.waitForLoad();
    logger.info("Logout successful");
  }
}

module.exports = LoginPage;
