const { test } = require('../../../tests/fixtures/xpathPageContext');

test('Click download link @regression @ui', async ({ xpathPage }) => {
  await xpathPage.clickDownloadLink();
});
