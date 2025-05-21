const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
const XPathPracticePage = require('../../../pages/XPathPracticePage');

test('Homepage visual regression @visual', async ({ page }) => {
  const xpathPage = new XPathPracticePage(page);
});

  await xpathPage.navigate(process.env.SELECTORS_HUB_URL);
  await expect(page).toHaveScreenshot('homepage.png', { fullPage: true });
});

});
