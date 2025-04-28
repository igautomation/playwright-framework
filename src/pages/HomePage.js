// src/pages/HomePage.js
const BasePage = require('./BasePage');
const logger = require('../utils/logger');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.welcomeMessage = 'h1';
    this.navLinks = 'nav a'; // Adjust selector based on your app
  }

  async getNavLinks() {
    const links = await this.page.locator(this.navLinks).allTextContents();
    logger.info('Retrieved navigation links', { links });
    return links;
  }

  async navigateToSection(section) {
    logger.info('Navigating to section', { section });
    await this.page.locator(this.navLinks).filter({ hasText: section }).click();
    await this.waitForLoad();
    logger.info('Navigation to section complete', { section });
  }
}

module.exports = HomePage;