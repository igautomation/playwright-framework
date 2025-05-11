/**
 * Login page object
 */
const BasePage = require('./BasePage');
const logger = require('../utils/common/logger');

class LoginPage extends BasePage {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    super(page);
    this.url = 'https://opensource-demo.orangehrmlive.com/';
    
    // Locators
    this.usernameInput = 'input[name="username"]';
    this.passwordInput = 'input[name="password"]';
    this.loginButton = 'button[type="submit"]';
    this.errorMessage = '.oxd-alert-content-text';
  }

  /**
   * Login with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<void>}
   */
  async login(username, password) {
    logger.info(`Logging in with username: ${username}`);
    
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get error message
   * @returns {Promise<string>} Error message
   */
  async getErrorMessage() {
    if (await this.hasElement(this.errorMessage)) {
      return await this.getText(this.errorMessage);
    }
    return '';
  }
  
  /**
   * Verify login error message
   * @param {string} expectedMessage - Expected error message
   * @returns {Promise<boolean>} True if error message matches
   */
  async verifyLoginError(expectedMessage) {
    const actualMessage = await this.getErrorMessage();
    return actualMessage.includes(expectedMessage);
  }

  /**
   * Check if login was successful
   * @returns {Promise<boolean>} True if login was successful
   */
  async isLoggedIn() {
    // Check if we're redirected to dashboard
    return await this.page.url().includes('dashboard');
  }

  /**
   * Logout
   * @returns {Promise<void>}
   */
  async logout() {
    logger.info('Logging out');
    
    // Click user dropdown
    await this.click('.oxd-userdropdown-tab');
    
    // Click logout
    await this.click('text=Logout');
    
    // Wait for login page
    await this.page.waitForSelector(this.usernameInput);
  }
}

module.exports = LoginPage;