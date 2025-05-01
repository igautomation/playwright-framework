// src/pages/LoginPage.js

import BasePage from "./BasePage.js";
import WebInteractions from "../utils/web/webInteractions.js";
import LoginPageLocators from "./locators/LoginPageLocators.js";

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.web = new WebInteractions(page);

    // Locators from LoginPageLocators.js
    this.usernameInput = LoginPageLocators.usernameInput;
    this.passwordInput = LoginPageLocators.passwordInput;
    this.submitButton = LoginPageLocators.submitButton;
    this.errorMessage = LoginPageLocators.errorMessage;
    this.logoutButton = LoginPageLocators.logoutButton;
  }

  async login(username, password) {
    await this.web.clearAndType(this.usernameInput, username);
    await this.web.clearAndType(this.passwordInput, password);
    await this.web.safeClick(this.submitButton);
    await this.waitForLoad();
  }

  async verifyLoginSuccess() {
    const welcomeMessage = await this.web.getText("h1");
    return welcomeMessage.includes("Welcome");
  }

  async logout() {
    await this.web.safeClick(this.logoutButton);
    await this.page.waitForURL("**/login", { timeout: 5000 });
    await this.waitForLoad();
  }
}

export default LoginPage;
