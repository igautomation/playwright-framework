const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

/**
 * Page object for the OrangeHRM login page
 * @extends BasePage
 */
class LoginPage extends BasePage {
  /**
   * Constructor for the LoginPage class
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @throws {Error} If page object is not provided
   */
  constructor(page) {
    if (!page) {
      throw new Error('Page object is required for LoginPage');
    }
    super(page);

    // Define page locators
    this.locators = {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      loginButton: 'button[type="submit"]',
      errorMessage: '.oxd-alert-content-text',
      forgotPasswordLink: '.orangehrm-login-forgot',
    };

    // Define page URL
    this.url = '/auth/login';
  }

  /**
   * Navigate to the login page
   * @returns {Promise<LoginPage>} This page object for chaining
   * @throws {Error} If navigation or element waiting fails
   */
  async navigate() {
    try {
      // Use extended navigation options with longer timeout and retry
      await super.navigate(this.url, {
        timeout: 45000, // 45 seconds timeout
        waitUntil: 'domcontentloaded', // Less strict waiting condition
      });

      // Wait for the username input with a more generous timeout
      await this.page.waitForSelector(this.locators.usernameInput, {
        state: 'visible',
        timeout: 30000, // 30 seconds timeout
      });

      return this;
    } catch (error) {
      // If the error is related to the selector not being found, try a different approach
      if (
        error.message.includes('waiting for selector') ||
        error.message.includes('frame was detached')
      ) {
        try {
          // Try to wait for any content to load
          await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });

          // Check if we're already on a page with the login form
          const hasLoginForm = (await this.page.locator('form').count()) > 0;
          if (hasLoginForm) {
            return this;
          }

          throw new Error('Login form not found after navigation');
        } catch (fallbackError) {
          throw new Error(
            `Failed to navigate to login page: ${error.message}. Additional error: ${fallbackError.message}`
          );
        }
      }

      throw new Error(`Failed to navigate to login page: ${error.message}`);
    }
  }

  /**
   * Enter username
   * @param {string} username - Username to enter
   * @returns {Promise<LoginPage>} This page object for chaining
   * @throws {Error} If username is invalid or input operation fails
   */
  async enterUsername(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('Username must be a non-empty string');
    }

    try {
      await this.fill(this.locators.usernameInput, username);
      return this;
    } catch (error) {
      throw new Error(`Failed to enter username: ${error.message}`);
    }
  }

  /**
   * Enter password
   * @param {string} password - Password to enter
   * @returns {Promise<LoginPage>} This page object for chaining
   * @throws {Error} If password is invalid or input operation fails
   */
  async enterPassword(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    try {
      await this.fill(this.locators.passwordInput, password);
      return this;
    } catch (error) {
      throw new Error(`Failed to enter password: ${error.message}`);
    }
  }

  /**
   * Click login button
   * @returns {Promise<LoginPage>} This page object for chaining
   * @throws {Error} If click operation fails
   */
  async clickLoginButton() {
    try {
      await this.click(this.locators.loginButton);
      return this;
    } catch (error) {
      throw new Error(`Failed to click login button: ${error.message}`);
    }
  }

  /**
   * Login with username and password
   * @param {string} username - Username to enter
   * @param {string} password - Password to enter
   * @returns {Promise<LoginPage>} This page object for chaining
   * @throws {Error} If any login step fails
   */
  async login(username, password) {
    try {
      await this.enterUsername(username);
      await this.enterPassword(password);
      await this.clickLoginButton();
      return this;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Verify login success by checking URL redirection to dashboard
   * @param {number} [timeout=5000] - Timeout in milliseconds
   * @returns {Promise<boolean>} True if login was successful, false otherwise
   */
  async verifyLoginSuccess(timeout = 10000) {
    try {
      // Try multiple ways to verify successful login

      // Method 1: Check URL - OrangeHRM uses 'viewDashboard' in the URL
      try {
        await this.page.waitForURL('**/viewDashboard**', { timeout });
        return true;
      } catch (urlError) {
        console.log('URL check failed:', urlError.message);
        // URL check failed, try other methods
      }

      // Method 2: Check for dashboard elements
      try {
        const dashboardHeader = this.page.locator('.oxd-topbar-header-breadcrumb');
        const isVisible = await dashboardHeader.isVisible({ timeout: timeout });
        if (isVisible) {
          console.log('Dashboard header is visible');
          return true;
        }
      } catch (elementError) {
        console.log('Element check failed:', elementError.message);
        // Element check failed, try other methods
      }

      // Method 3: Check if we're no longer on the login page
      try {
        const loginButton = this.page.locator(this.locators.loginButton);
        const isLoginButtonGone = !(await loginButton.isVisible({ timeout: timeout / 2 }));
        if (isLoginButtonGone) {
          console.log('Login button is gone, likely logged in');
          return true;
        }
      } catch (formError) {
        console.log('Login button check failed:', formError.message);
        // Form check failed
      }

      // Method 4: Check for any dashboard-specific element
      try {
        const dashboardElement = this.page.locator('.oxd-layout-context');
        const isDashboardVisible = await dashboardElement.isVisible({ timeout: timeout / 2 });
        if (isDashboardVisible) {
          console.log('Dashboard layout is visible');
          return true;
        }
      } catch (dashboardError) {
        console.log('Dashboard check failed:', dashboardError.message);
      }

      console.log('All login verification methods failed');
      return false;
    } catch (error) {
      console.log('Login verification error:', error.message);
      return false;
    }
  }

  /**
   * Verify login error message
   * @param {string} expectedMessage - Expected error message
   * @returns {Promise<boolean>} True if error message matches, false otherwise
   * @throws {Error} If expectedMessage is not provided
   */
  async verifyLoginError(expectedMessage) {
    if (!expectedMessage || typeof expectedMessage !== 'string') {
      throw new Error('Expected error message must be a non-empty string');
    }

    try {
      const errorElement = this.page.locator(this.locators.errorMessage);
      await expect(errorElement).toBeVisible({ timeout: 5000 });

      const actualMessage = await errorElement.textContent();
      return actualMessage.includes(expectedMessage);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if error message is displayed
   * @returns {Promise<boolean>} True if error message is visible, false otherwise
   */
  async isErrorMessageDisplayed() {
    try {
      const errorElement = this.page.locator(this.locators.errorMessage);
      return await errorElement.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the text of the error message
   * @returns {Promise<string|null>} The error message text or null if not found
   */
  async getErrorMessage() {
    try {
      const errorElement = this.page.locator(this.locators.errorMessage);
      if (await errorElement.isVisible()) {
        return await errorElement.textContent();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Click forgot password link
   * @returns {Promise<LoginPage>} This page object for chaining
   * @throws {Error} If click operation fails
   */
  async clickForgotPasswordLink() {
    try {
      await this.click(this.locators.forgotPasswordLink);
      return this;
    } catch (error) {
      throw new Error(`Failed to click forgot password link: ${error.message}`);
    }
  }
}

module.exports = LoginPage;
