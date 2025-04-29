// src/pages/HomePage.js

const BasePage = require('./BasePage');
const WebInteractions = require('@utils/web/webInteractions');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.web = new WebInteractions(page);

    // Locators directly used here or imported separately
    this.welcomeMessage = 'h1';
    this.navLinks = 'nav a';
  }

  async getNavLinks() {
    const links = await this.page.locator(this.navLinks).allTextContents();
    return links;
  }

  async navigateToSection(sectionName) {
    await this.page.locator(this.navLinks).filter({ hasText: sectionName }).click();
    await this.waitForLoad();
  }

  async verifyWelcomeMessage(expectedText) {
    const actualText = await this.web.getText(this.welcomeMessage);
    return actualText.includes(expectedText);
  }
}

module.exports = HomePage;