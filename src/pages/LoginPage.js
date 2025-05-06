<<<<<<< HEAD
// src/pages/LoginPage.js

import BasePage from './BasePage.js';
import WebInteractions from '../utils/web/webInteractions.js';
import LoginPageLocators from './locators/LoginPageLocators.js';

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
    const welcomeMessage = await this.web.getText('h1');
    return welcomeMessage.includes('Welcome');
  }

  async logout() {
    await this.web.safeClick(this.logoutButton);
    await this.page.waitForURL('**/login', { timeout: 5000 });
    await this.waitForLoad();
  }
}

export default LoginPage;
=======
const BasePage = require('./BasePage');
const logger = require('../utils/common/logger');

/**
 * Login Page class for OrangeHRM
 */
class LoginPage extends BasePage {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);

    // Define page locators
    this.locators = {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      loginButton: 'button[type="submit"]',
      forgotPasswordLink: '.orangehrm-login-forgot p',
      errorMessage: '.oxd-alert-content-text',
      logoImage: '.orangehrm-login-branding img',
      loginForm: '.orangehrm-login-form',
      socialMediaIcons: '.orangehrm-login-footer-sm',
      footerText: '.orangehrm-login-footer-content',
      versionText: '.orangehrm-login-footer-content:nth-child(2)',
    };
  }

  /**
   * Navigate to login page
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async navigate() {
    logger.info('Navigating to login page');
    await super.navigate('/');
    await this.waitForPageLoad();
    return this;
  }

  /**
   * Enter username
   * @param {string} username - Username
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async enterUsername(username) {
    logger.info(`Entering username: ${username}`);
    await this.fill(this.locators.usernameInput, username);
    return this;
  }

  /**
   * Enter password
   * @param {string} password - Password
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async enterPassword(password) {
    logger.info('Entering password');
    await this.fill(this.locators.passwordInput, password);
    return this;
  }

  /**
   * Click login button
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async clickLoginButton() {
    logger.info('Clicking login button');
    await this.click(this.locators.loginButton);
    return this;
  }

  /**
   * Login with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async login(username, password) {
    logger.info(`Logging in with username: ${username}`);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
    return this;
  }

  /**
   * Click forgot password link
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async clickForgotPasswordLink() {
    logger.info('Clicking forgot password link');
    await this.click(this.locators.forgotPasswordLink);
    return this;
  }

  /**
   * Get error message
   * @returns {Promise<string>} Error message
   */
  async getErrorMessage() {
    logger.info('Getting error message');
    return await this.getText(this.locators.errorMessage);
  }

  /**
   * Verify login page is displayed
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async verifyLoginPageDisplayed() {
    logger.info('Verifying login page is displayed');
    await this.verifyElementVisible(this.locators.loginForm);
    await this.verifyElementVisible(this.locators.logoImage);
    return this;
  }

  /**
   * Verify login success
   * @returns {Promise<boolean>} Whether login was successful
   */
  async verifyLoginSuccess() {
    logger.info('Verifying login success');

    try {
      // Wait for dashboard to load
      await this.page.waitForURL('**/dashboard**', { timeout: 10000 });

      // Check if we're on the dashboard page
      const currentUrl = await this.getCurrentUrl();
      return currentUrl.includes('/dashboard');
    } catch (error) {
      logger.error('Login was not successful', error);
      return false;
    }
  }

  /**
   * Verify login failure
   * @param {string} expectedErrorMessage - Expected error message
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async verifyLoginFailure(expectedErrorMessage) {
    logger.info(
      `Verifying login failure with message: ${expectedErrorMessage}`
    );

    // Wait for error message to be visible
    await this.verifyElementVisible(this.locators.errorMessage);

    // Verify error message text if provided
    if (expectedErrorMessage) {
      await this.verifyText(this.locators.errorMessage, expectedErrorMessage);
    }

    return this;
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getPageTitle() {
    logger.info('Getting page title');
    return await this.getTitle();
  }

  /**
   * Verify page title
   * @returns {Promise<LoginPage>} This instance for chaining
   */
  async verifyPageTitle() {
    logger.info('Verifying page title');
    await this.verifyTitle('OrangeHRM');
    return this;
  }

  /**
   * Take login page screenshot
   * @returns {Promise<string>} Path to the screenshot
   */
  async takeLoginPageScreenshot() {
    logger.info('Taking login page screenshot');
    return await this.takeScreenshot('login-page');
  }
}

module.exports = LoginPage;
>>>>>>> 51948a2 (Main v1.0)
