// src/pages/XPathPracticePage.js
import BasePage from './BasePage.js';
import WebInteractions from '../utils/web/webInteractions.js';

class XPathPracticePage extends BasePage {
  constructor(page) {
    super(page);
    this.web = new WebInteractions(page);
    this.usernameSelector = '#userId';
    this.passwordSelector = '#pass';
    this.loginButton = 'button[type="submit"]';
  }

  async goto() {
    await this.page.goto(`${process.env.BASE_URL}`);
  }

  async login(username, password) {
    await this.web.clearAndType(this.usernameSelector, username);
    await this.web.clearAndType(this.passwordSelector, password);
    await this.web.safeClick(this.loginButton);
  }

  async logout() {
    await this.web.safeClick('button[type="logout"]');
  }
}

export default XPathPracticePage;
