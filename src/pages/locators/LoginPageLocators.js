// src/pages/locators/LoginPageLocators.js

import BaseLocator from './BaseLocator.js';

/**
 * Locators for the login page
 */
class LoginPageLocators extends BaseLocator {
  constructor(page) {
    super(page);
    this.addLocator('usernameInput', {
      primary: '[data-testid=username-input]',
      fallbacks: ['#username', 'input[name=username]'],
    });
    this.addLocator('passwordInput', {
      primary: '[data-testid=password-input]',
      fallbacks: ['#password', 'input[name=password]'],
    });
    this.addLocator('submitButton', {
      primary: '[data-testid=login-button]',
      fallbacks: ['#submit', 'button[type=submit]'],
    });
  }
}

export default LoginPageLocators;