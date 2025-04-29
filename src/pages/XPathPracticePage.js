const BasePage = require('./BasePage');
const WebInteractions = require('@utils/web/webInteractions');

class XPathPracticePage {
    constructor(page) {
      this.page = page;
      this.usernameInput = '#userId';
      this.passwordInput = '#pass';
      this.submitButton = '#userId + input[type="password"] + input[type="submit"]';
    }
  
    async login(username, password) {
      await this.page.fill(this.usernameInput, username);
      await this.page.fill(this.passwordInput, password);
      await this.page.click(this.submitButton);
    }
  }
  
  export default XPathPracticePage;
  
