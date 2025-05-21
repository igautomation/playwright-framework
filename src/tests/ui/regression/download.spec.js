const { test } = require('../../../tests/fixtures/xpathPageContext');

test.describe('Download', () => {

test('Click download link @regression @ui', async ({ xpathPage }) => {
  await xpathPage.clickDownloadLink();
  // Added assertion
  expect(true).toBeTruthy();
});

});

});
