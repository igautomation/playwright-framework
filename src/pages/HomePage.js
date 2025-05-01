// src/pages/HomePage.js

import BasePage from './BasePage.js';
import WebInteractions from '../utils/web/webInteractions.js';

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
export default HomePage;
