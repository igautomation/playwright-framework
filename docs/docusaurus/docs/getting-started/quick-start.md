---
sidebar_position: 3
---

# Quick Start

This guide will help you get started with writing and running tests using the Playwright Framework.

## Writing Your First Test

Let's create a simple test that verifies the login functionality of a web application.

### 1. Create a Page Object

First, create a page object for the login page. Create a file at `src/pages/LoginPage.js`:

```javascript
const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Define page locators
    this.locators = {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      loginButton: 'button[type="submit"]',
      errorMessage: '.error-message',
    };
  }

  async navigate() {
    await super.navigate('/login');
    return this;
  }

  async login(username, password) {
    await this.fill(this.locators.usernameInput, username);
    await this.fill(this.locators.passwordInput, password);
    await this.click(this.locators.loginButton);
    return this;
  }

  async verifyLoginSuccess() {
    // Wait for navigation to dashboard
    await this.page.waitForURL('**/dashboard**');
    return this;
  }

  async verifyLoginError(expectedErrorMessage) {
    await this.verifyElementVisible(this.locators.errorMessage);
    await this.verifyText(this.locators.errorMessage, expectedErrorMessage);
    return this;
  }
}

module.exports = LoginPage;
```

### 2. Create a Test Fixture

Create a fixture file at `src/tests/fixtures/loginFixture.js`:

```javascript
const { test: base } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },
});

module.exports = { test };
```

### 3. Write a Test

Create a test file at `src/tests/ui/login.spec.js`:

```javascript
const { test } = require('../fixtures/loginFixture');
const { expect } = require('@playwright/test');

test.describe('Login Functionality @smoke @ui', () => {
  test('Successful login with valid credentials @p1', async ({ loginPage }) => {
    // Login with valid credentials
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);

    // Verify login was successful
    await loginPage.verifyLoginSuccess();
  });

  test('Failed login with invalid credentials @p1', async ({ loginPage }) => {
    // Login with invalid credentials
    await loginPage.login('invalid', 'invalid');

    // Verify error message
    await loginPage.verifyLoginError('Invalid username or password');
  });
});
```

## Running Tests

### Run All Tests

To run all tests:

```bash
npx framework test
```

### Run Specific Tests by Tag

To run tests with specific tags:

```bash
# Run smoke tests
npx framework test --tags @smoke

# Run UI tests
npx framework test --tags @ui

# Run smoke tests that are also UI tests
npx framework test --tags "@smoke && @ui"

# Run smoke tests but exclude flaky tests
npx framework test --tags "@smoke && !@flaky"
```

### Run Tests in Headed Mode

To run tests in headed mode (with browser visible):

```bash
npx framework test --headed
```

### List Available Tests

To list all available tests:

```bash
npx framework test --list
```

### List Available Tags

To list all available tags:

```bash
npx framework list-tags
```

## Viewing Reports

After running tests, you can view the reports:

```bash
# View HTML report
npx framework generate-report --type html

# View Allure report
npx framework generate-report --type allure
```

## Next Steps

Now that you've created and run your first test, you can:

1. Learn more about [Page Objects](../guides/ui-testing)
2. Explore [API Testing](../guides/api-testing)
3. Set up [CI/CD Integration](../guides/ci-cd-integration)
4. Check out the [API Reference](../api/cli) for more details on the available commands and utilities
