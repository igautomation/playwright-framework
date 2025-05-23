/**
 * Login Page
 */
class LoginPage {
  constructor(page) {
    this.page = page;
  }
  
  async navigate(url) {
    await this.page.goto(url || process.env.ORANGEHRM_URL);
  }
  
  async login(username, password) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }
  
  async verifyLoginPageDisplayed() {
    await this.page.waitForSelector('.orangehrm-login-form');
  }
  
  async verifyLoginError(errorMessage) {
    await this.page.waitForSelector('.oxd-alert-content');
  }
}

exports.LoginPage = LoginPage;