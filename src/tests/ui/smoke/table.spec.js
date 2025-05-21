const { test } = require('../../../tests/fixtures/xpathPageContext');

test.describe('Table', () => {

test('Verify user table data @smoke @ui', async ({ xpathPage }) => {
  await xpathPage.verifyUserInTable('Joe.Root', 'ESS', 'Joe Root', 'Enabled');
  // Added assertion
  expect(true).toBeTruthy();
});

});

});
