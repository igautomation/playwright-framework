---
sidebar_position: 1
---

# UI Testing

This guide explains how to write UI tests using the Playwright Framework.

## Page Object Model

The framework uses the Page Object Model (POM) pattern to organize UI tests. This pattern separates the test logic from the page-specific code, making tests more maintainable and reusable.

### Base Page

The `BasePage` class provides common functionality for all page objects:

```javascript
const { expect } = require('@playwright/test');
const WebInteractions = require('../utils/web/webInteractions');
const ScreenshotUtils = require('../utils/web/screenshotUtils');

class BasePage {
  constructor(page) {
    this.page = page;
    this.webInteractions = new WebInteractions(page);
    this.screenshotUtils = new ScreenshotUtils(page);
  }

  async navigate(path = '/') {
    await this.page.goto(path);
    return this;
  }

  async click(selector) {
    await this.page.locator(selector).click();
    return this;
  }

  async fill(selector, value) {
    await this.page.locator(selector).fill(value);
    return this;
  }

  async getText(selector) {
    return await this.webInteractions.getText(selector);
  }

  async verifyElementVisible(selector) {
    await expect(this.page.locator(selector)).toBeVisible();
    return this;
  }

  // More common methods...
}

module.exports = BasePage;
```

### Page Classes

Create specific page classes that extend the `BasePage`:

```javascript
const BasePage = require('./BasePage');

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

## Test Fixtures

Test fixtures provide a way to set up and tear down test environments:

```javascript
const { test: base } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');

const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);

    // Wait for dashboard to load
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardPageDisplayed();

    // Use the authenticated page
    await use(page);

    // Logout after test
    await dashboardPage.logout();
  },
});

module.exports = { test };
```

## Writing UI Tests

Using the page objects and fixtures, you can write UI tests:

```javascript
const { test } = require('../fixtures/baseFixtures');
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

## Advanced UI Testing

### Self-Healing Locators

The framework provides self-healing locators that can adapt to UI changes:

```javascript
const SelfHealingLocator = require('../../utils/web/SelfHealingLocator');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.selfHealing = new SelfHealingLocator(page);

    // Define primary and fallback locators
    this.locators = {
      usernameInput: {
        primary: 'input[name="username"]',
        fallbacks: ['#username', '[data-test="username"]'],
      },
    };
  }

  async enterUsername(username) {
    const locator = await this.selfHealing.getLocator(
      this.locators.usernameInput.primary,
      this.locators.usernameInput.fallbacks
    );

    await locator.fill(username);
    return this;
  }
}
```

### Visual Testing

The framework supports visual testing:

```javascript
const { test } = require('../fixtures/baseFixtures');

test('Visual regression test @visual', async ({ page }) => {
  await page.goto('/dashboard');

  // Take a screenshot and compare with baseline
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

### Handling Iframes

```javascript
const { test } = require('../fixtures/baseFixtures');

test('Interact with iframe content @ui', async ({ page }) => {
  await page.goto('/page-with-iframe');

  // Get the iframe
  const iframe = page.frameLocator('iframe[name="content"]');

  // Interact with elements inside the iframe
  await iframe.locator('button').click();

  // Verify content inside the iframe
  await expect(iframe.locator('.result')).toHaveText('Success');
});
```

### Handling Multiple Tabs

```javascript
const { test } = require('../fixtures/baseFixtures');

test('Handle multiple tabs @ui', async ({ page, context }) => {
  await page.goto('/page-with-links');

  // Create a promise that resolves when a new page is created
  const pagePromise = context.waitForEvent('page');

  // Click a link that opens a new tab
  await page.click('a[target="_blank"]');

  // Wait for the new page
  const newPage = await pagePromise;
  await newPage.waitForLoadState();

  // Interact with the new tab
  await expect(newPage).toHaveTitle('New Page');

  // Close the new tab
  await newPage.close();
});
```

### Network Interception

```javascript
const { test } = require('../fixtures/baseFixtures');
const NetworkUtils = require('../../utils/web/networkUtils');

test('Intercept network requests @ui', async ({ page }) => {
  const networkUtils = new NetworkUtils(page);

  // Start intercepting
  await networkUtils.startIntercepting();

  // Mock API response
  await networkUtils.mockResponse('/api/users', { users: [] });

  // Navigate to page
  await page.goto('/users');

  // Verify empty state is displayed
  await expect(page.locator('.empty-state')).toBeVisible();

  // Stop intercepting
  await networkUtils.stopIntercepting();
});
```

## Best Practices

1. **Separate locators from actions**: Store locators in a separate object or file
2. **Use chainable methods**: Return `this` from page object methods for method chaining
3. **Use meaningful method names**: Methods should describe the action being performed
4. **Keep tests focused**: Each test should verify a single piece of functionality
5. **Use data-test attributes**: Add `data-test` attributes to elements for stable selectors
6. **Handle waits properly**: Use explicit waits for dynamic elements
7. **Take screenshots for failures**: Capture screenshots when tests fail for easier debugging
8. **Use test hooks**: Use `beforeEach` and `afterEach` for setup and teardown

## Next Steps

Now that you've learned about UI testing, you can:

1. Explore [API Testing](api-testing)
2. Learn about [E2E Testing](e2e-testing)
3. Set up [Visual Testing](visual-testing)
