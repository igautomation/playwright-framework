---
sidebar_position: 3
---

# Quick Start

This guide will help you get started with writing and running tests using the Playwright Framework.

## Writing Your First Test

Let's create a simple test that navigates to a website and verifies its title.

### 1. Create a Test File

Create a new file in the `src/tests` directory, e.g., `src/tests/my-first-test.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('My First Test Suite', () => {
  test('should have the correct title', async ({ page }) => {
    // Navigate to the website
    await page.goto('https://playwright.dev');
    
    // Verify the title
    await expect(page).toHaveTitle(/Playwright/);
  });
  
  test('should have visible get started link', async ({ page }) => {
    // Navigate to the website
    await page.goto('https://playwright.dev');
    
    // Click the get started link
    await page.getByRole('link', { name: 'Get started' }).click();
    
    // Verify the URL
    await expect(page).toHaveURL(/.*intro/);
  });
});
```

### 2. Run the Test

Run the test using the CLI:

```bash
npx playwright test src/tests/my-first-test.spec.js
```

You should see output indicating that the tests passed.

## Using Page Objects

For better organization and reusability, let's refactor the test to use page objects.

### 1. Create a Page Object

Create a new file in the `src/pages` directory, e.g., `src/pages/PlaywrightHomePage.js`:

```javascript
class PlaywrightHomePage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
  }

  /**
   * Navigate to the Playwright homepage
   */
  async navigate() {
    await this.page.goto('https://playwright.dev');
  }

  /**
   * Click the "Get Started" link
   */
  async clickGetStarted() {
    await this.getStartedLink.click();
  }
}

module.exports = { PlaywrightHomePage };
```

### 2. Update the Test

Update your test to use the page object:

```javascript
const { test, expect } = require('@playwright/test');
const { PlaywrightHomePage } = require('../pages/PlaywrightHomePage');

test.describe('My First Test Suite with Page Objects', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new PlaywrightHomePage(page);
    await homePage.navigate();
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright/);
  });
  
  test('should navigate to get started page', async ({ page }) => {
    await homePage.clickGetStarted();
    await expect(page).toHaveURL(/.*intro/);
  });
});
```

## Adding API Tests

Let's add a simple API test:

```javascript
const { test, expect } = require('@playwright/test');
const { ApiUtils } = require('../utils/api/apiUtils');

test.describe('API Tests', () => {
  let apiUtils;

  test.beforeEach(async () => {
    apiUtils = new ApiUtils();
  });

  test('should get user data', async () => {
    const response = await apiUtils.get('https://reqres.in/api/users/2');
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.data.id).toBe(2);
    expect(body.data.email).toBeTruthy();
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Headed Mode

```bash
npm run test:headed
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Tests with UI Mode

```bash
npm run test:ui
```

### Run Specific Test File

```bash
npx playwright test path/to/test.spec.js
```

### Run Tests with Specific Tag

```bash
npx playwright test --grep @smoke
```

## Verifying Tests

Verify that your tests follow best practices:

```bash
npm run verify
```

## Linting Tests

Lint your test files:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

## Generating Reports

Generate test reports:

```bash
npm run report
```

## Next Steps

Now that you've written your first tests, you can:

- [Configure the framework](configuration) for your specific needs
- Learn about [UI testing](../guides/ui-testing) in depth
- Explore [API testing](../guides/api-testing) capabilities
- Set up [CI/CD integration](../guides/ci-cd-integration)