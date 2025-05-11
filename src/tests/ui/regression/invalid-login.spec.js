const { test } = require('../../../tests/fixtures/xpathPageContext');

test('Verify invalid login @regression @ui', async ({ loginPage }) => {
  await loginPage.login('invalid', 'invalid');
  await loginPage.verifyLoginError('Invalid credentials');
});
