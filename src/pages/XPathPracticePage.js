<<<<<<< HEAD
// src/pages/XPathPracticePage.js
import BasePage from './BasePage.js';
import WebInteractions from '../utils/web/webInteractions.js';
=======
const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');
>>>>>>> 51948a2 (Main v1.0)

class XPathPracticePage extends BasePage {
  constructor(page) {
    super(page);
<<<<<<< HEAD
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
=======
    this.locators = {
      userTable: '#resultTable',
      userRow: (username) => `#resultTable tr:has(td:text-is("${username}"))`,
      downloadLink: 'a[href$=".png"]',
      shadowDomIframe: '#pact',
    };
  }

  async verifyUserInTable(
    username,
    expectedRole,
    expectedName,
    expectedStatus
  ) {
    // Wait for the table to be visible
    await this.page.waitForSelector(this.locators.userTable, {
      timeout: 10000,
    });

    // Find the row containing the username
    const row = this.page.locator(this.locators.userRow(username));

    // Wait for the row to be visible
    await expect(row).toBeVisible({ timeout: 10000 });

    // Verify the expected data in each column
    await expect(row.locator('td:nth-child(2)')).toHaveText(expectedRole);
    await expect(row.locator('td:nth-child(3)')).toHaveText(expectedName);
    await expect(row.locator('td:nth-child(4)')).toHaveText(expectedStatus);
  }

  async clickDownloadLink() {
    await this.page.locator(this.locators.downloadLink).click();
  }

  async interactWithShadowDomIframe() {
    const iframe = this.page.frameLocator(this.locators.shadowDomIframe);
    const shadowElement = iframe.locator('#snacktime');
    await expect(shadowElement).toBeVisible();
  }
}
module.exports = XPathPracticePage;
>>>>>>> 51948a2 (Main v1.0)
