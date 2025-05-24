/**
 * OrangeHRMLogin Page Object
 * Generated from https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 * @generated
 */
const { BasePage } = require('./BasePage');

class OrangeHRMLogin extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // Page URL
    this.url = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
    
    // Selectors
    // Buttons
    this.login = 'button[type="submit"]';

    // Inputs
    this.password = '[name="password"]';

    // Links
    this.link = 'a';

    // Forms
    this.form = 'form';

    // Containers
    this.container = 'div';
    this.oxd_toaster_1 = '#oxd-toaster_1';
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    // Wait for main content to be available
    await this.page.waitForSelector('body', { timeout: 30000 });
  }

  /**
   * Click Login button
   */
  async clickLogin() {
    await this.click(this.login);
  }

  /**
   * Fill Password
   * @param {string} value
   */
  async fillPassword(value) {
    await this.fill(this.password, value);
  }

  /**
   * Click link link
   */
  async clickLink() {
    await this.click(this.link);
  }

  /**
   * Submit form form
   */
  async submitForm() {
    await this.page.evaluate(selector => {
      document.querySelector(selector).submit();
    }, this.form);
  }
}

module.exports = OrangeHRMLogin;