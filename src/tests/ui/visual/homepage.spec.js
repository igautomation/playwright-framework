const { test, expect } = require('@playwright/test');
const XPathPracticePage = require('../../../pages/XPathPracticePage');

test('Homepage visual regression @visual', async ({ page }) => {
  const xpathPage = new XPathPracticePage(page);
  await xpathPage.navigate('https://selectorshub.com/xpath-practice-page/');
  await expect(page).toHaveScreenshot('homepage.png', { fullPage: true });
});
