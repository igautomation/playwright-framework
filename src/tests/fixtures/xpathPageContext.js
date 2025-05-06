const { test: base } = require('@playwright/test');
const XPathPracticePage = require('../../pages/XPathPracticePage');
const LoginPage = require('../../pages/LoginPage');

const test = base.extend({
  xpathPage: async ({ page }, use) => {
    const xpathPage = new XPathPracticePage(page);
    await xpathPage.navigate('https://selectorshub.com/xpath-practice-page/');
    await use(xpathPage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },
});

module.exports = { test };
