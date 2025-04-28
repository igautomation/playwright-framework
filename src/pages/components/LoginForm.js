// src/pages/components/LoginForm.js
const SelfHealingLocator = require("../locators/SelfHealingLocator");

class LoginForm {
  constructor(page) {
    this.page = page;
    // Use self-healing locators for form elements
    this.form = SelfHealingLocator.create(page, "form#login-form", {
      tag: "form",
    });
    this.usernameInput = SelfHealingLocator.create(page, "#username", {
      role: "textbox",
      name: "username",
      tag: "input",
    });
    this.passwordInput = SelfHealingLocator.create(page, "#password", {
      role: "textbox",
      name: "password",
      tag: "input",
    });
    this.submitButton = SelfHealingLocator.create(
      page,
      'button[type="submit"]',
      {
        role: "button",
        name: "submit",
        text: "Login",
        tag: "button",
      }
    );
    this.errorMessage = SelfHealingLocator.create(page, ".error-message", {
      tag: "div",
    });
  }

  async login(username, password) {
    const usernameLocator = await this.usernameInput.locate();
    const passwordLocator = await this.passwordInput.locate();
    const submitLocator = await this.submitButton.locate();

    await usernameLocator.fill(username);
    await passwordLocator.fill(password);
    await submitLocator.click();
  }

  async getErrorMessage() {
    const errorLocator = await this.errorMessage.locate();
    return (await errorLocator.isVisible())
      ? await errorLocator.textContent()
      : null;
  }

  async isVisible() {
    const formLocator = await this.form.locate();
    return await formLocator.isVisible();
  }
}

module.exports = LoginForm;
