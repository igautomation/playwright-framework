// src/pages/XPathPracticePage.js
import BasePage from "./BasePage.js";
import WebInteractions from "../utils/web/webInteractions.js";

class XPathPracticePage {
  constructor(page) {
    this.page = page;
    this.usernameInput = "#userId";
    this.passwordInput = "#pass";
    this.submitButton =
      '#userId + input[type="password"] + input[type="submit"]';
  }

  async login(username, password) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
  }
}

export default XPathPracticePage;
