<!-- Source: /Users/mzahirudeen/playwright-framework/docs/docusaurus/docs/guides/documentation-examples.md -->

---
sidebar_position: 2
---

# Documentation Examples

This guide provides practical examples of how to use the documentation to solve common tasks with the Playwright Framework.

## Example 1: Setting Up a New Project

**Task**: Set up a new test automation project using the Playwright Framework.

**Documentation Path**:

1. Start with [Installation](../getting-started/installation)
2. Follow the [Quick Start](../getting-started/quick-start) guide
3. Configure the project using [Configuration](../getting-started/configuration)

**Step-by-Step**:

1. Install the framework:
   ```bash
   npm install
   npx playwright install
   ```

2. Create your first test file:
   ```javascript
   // src/tests/my-first-test.spec.js
   const { test, expect } = require('@playwright/test');

   test('has title', async ({ page }) => {
     await page.goto('https://example.com');
     await expect(page).toHaveTitle(/Example/);
   });
   ```

3. Run the test:
   ```bash
   npx playwright test
   ```

4. Configure the project by creating a `playwright.config.js` file:
   ```javascript
   // playwright.config.js
   const { defineConfig } = require('@playwright/test');

   module.exports = defineConfig({
     testDir: './src/tests',
     use: {
       baseURL: 'https://example.com',
     },
   });
   ```

## Example 2: Writing UI Tests with Page Objects

**Task**: Create UI tests using the Page Object Model pattern.

**Documentation Path**:

1. Read [Writing Tests](./writing-tests)
2. Check [Page Objects](../api/page-objects)
3. See [UI Testing](./ui-testing) for best practices

**Step-by-Step**:

1. Create a page object:
   ```javascript
   // src/pages/LoginPage.js
   class LoginPage {
     constructor(page) {
       this.page = page;
       this.usernameInput = page.locator('#username');
       this.passwordInput = page.locator('#password');
       this.loginButton = page.locator('#login');
       this.errorMessage = page.locator('.error-message');
     }

     async navigate() {
       await this.page.goto('/login');
     }

     async login(username, password) {
       await this.usernameInput.fill(username);
       await this.passwordInput.fill(password);
       await this.loginButton.click();
     }

     async getErrorMessage() {
       return this.errorMessage.textContent();
     }
   }

   module.exports = { LoginPage };
   ```

2. Create a test using the page object:
   ```javascript
   // src/tests/login.spec.js
   const { test, expect } = require('@playwright/test');
   const { LoginPage } = require('../pages/LoginPage');

   test.describe('Login functionality', () => {
     let loginPage;

     test.beforeEach(async ({ page }) => {
       loginPage = new LoginPage(page);
       await loginPage.navigate();
     });

     test('should login with valid credentials', async ({ page }) => {
       await loginPage.login('validUser', 'validPassword');
       await expect(page).toHaveURL('/dashboard');
     });

     test('should show error with invalid credentials', async () => {
       await loginPage.login('invalidUser', 'invalidPassword');
       const errorMessage = await loginPage.getErrorMessage();
       expect(errorMessage).toContain('Invalid username or password');
     });
   });
   ```

3. Run the tests:
   ```bash
   npx playwright test src/tests/login.spec.js
   ```

## Example 3: API Testing

**Task**: Create API tests for a REST API.

**Documentation Path**:

1. Read [API Testing](./api-testing)
2. Check [API Utils](../api/api-utils)
3. See [API Example](../examples/api-example)

**Step-by-Step**:

1. Create an API test:
   ```javascript
   // src/tests/api/users.spec.js
   const { test, expect } = require('@playwright/test');
   const { ApiUtils } = require('../../utils/api/apiUtils');

   test.describe('User API', () => {
     let apiUtils;

     test.beforeEach(() => {
       apiUtils = new ApiUtils();
     });

     test('should get user by ID', async () => {
       const response = await apiUtils.get('https://reqres.in/api/users/2');
       
       expect(response.status()).toBe(200);
       
       const body = await response.json();
       expect(body.data.id).toBe(2);
       expect(body.data.email).toBeTruthy();
     });

     test('should create a new user', async () => {
       const userData = {
         name: 'John Doe',
         job: 'Software Engineer'
       };
       
       const response = await apiUtils.post('https://reqres.in/api/users', userData);
       
       expect(response.status()).toBe(201);
       
       const body = await response.json();
       expect(body.name).toBe(userData.name);
       expect(body.job).toBe(userData.job);
       expect(body.id).toBeTruthy();
     });
   });
   ```

2. Run the API tests:
   ```bash
   npx playwright test src/tests/api/users.spec.js
   ```

## Example 4: Setting Up CI/CD Integration

**Task**: Set up CI/CD integration with GitHub Actions.

**Documentation Path**:

1. Read [CI/CD Integration](./ci-cd-integration)
2. Check [CI Setup](../api/cli#ci-setup)

**Step-by-Step**:

1. Use the CI setup command:
   ```bash
   npx playwright-framework ci-setup --system github --name "Playwright Tests"
   ```

2. This creates a GitHub Actions workflow file (`.github/workflows/playwright-tests.yml`):
   ```yaml
   name: Playwright Tests

   on:
     push:
       branches: ['main', 'develop']
     pull_request:
       branches: ['main', 'develop']
     workflow_dispatch:

   jobs:
     test:
       runs-on: ubuntu-latest
       timeout-minutes: 60
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Install Playwright browsers
           run: npx playwright install --with-deps
           
         - name: Run Playwright tests
           run: npm test
           
         - name: Generate test reports
           if: always()
           run: npm run report
           
         - name: Upload test results
           if: always()
           uses: actions/upload-artifact@v3
           with:
             name: test-results
             path: reports
             retention-days: 30
   ```

3. Commit and push the workflow file:
   ```bash
   git add .github/workflows/playwright-tests.yml
   git commit -m "Add GitHub Actions workflow"
   git push origin main
   ```

## Example 5: Analyzing Test Coverage

**Task**: Analyze test coverage and identify gaps.

**Documentation Path**:

1. Read [Test Coverage Analysis](../advanced/test-coverage-analysis)
2. Check [Test Coverage Analyze](../api/cli#test-coverage-analyze)

**Step-by-Step**:

1. Run the coverage analysis:
   ```bash
   npx playwright-framework test-coverage-analyze --test-dir src/tests --source-dir src --threshold 80
   ```

2. Review the console output:
   ```
   📊 Test Coverage Summary
   File coverage: 78.5%
   Total files: 120
   Covered files: 94
   Uncovered files: 26

   📋 Recommendations:
     ❗ File coverage (78.5%) is below threshold (80%)
     ❗ 5 important files have no tests
     ⚠️ 12 files have minimal test coverage (only one test)
   ```

3. Open the HTML report:
   ```bash
   npx playwright-framework test-coverage-analyze --test-dir src/tests --source-dir src --open
   ```

4. Address the coverage gaps by writing tests for the uncovered files.

## Example 6: Generating and Viewing Test Reports

**Task**: Generate and view test reports.

**Documentation Path**:

1. Read [Reporting](./reporting)
2. Check [Test Report](../api/cli#test-report)

**Step-by-Step**:

1. Run tests with reporting:
   ```bash
   npx playwright test
   ```

2. Generate reports:
   ```bash
   npx playwright-framework test-report --types html,json,markdown --open
   ```

3. This will:
   - Generate HTML, JSON, and Markdown reports
   - Open the HTML report in your browser

4. Generate and view the test quality dashboard:
   ```bash
   npx playwright-framework test-dashboard --add-run --open
   ```

## Example 7: Debugging Tests

**Task**: Debug a failing test.

**Documentation Path**:

1. Read [Troubleshooting](./troubleshooting)
2. Check [FAQ](../faq#how-do-i-debug-tests)

**Step-by-Step**:

1. Run the test in debug mode:
   ```bash
   npx playwright test failing-test.spec.js --debug
   ```

2. Add `page.pause()` to the test:
   ```javascript
   test('failing test', async ({ page }) => {
     await page.goto('https://example.com');
     await page.pause(); // This will open the Playwright Inspector
     await page.click('button');
   });
   ```

3. Run the test with trace:
   ```bash
   npx playwright test failing-test.spec.js --trace on
   ```

4. View the trace:
   ```bash
   npx playwright show-trace test-results/failing-test-trace.zip
   ```

## Example 8: Using Self-Healing Locators

**Task**: Implement self-healing locators for resilient tests.

**Documentation Path**:

1. Read [Self-Healing Locators](../advanced/self-healing-locators)
2. Check [Web Interactions](../api/web-interactions)

**Step-by-Step**:

1. Import the self-healing locator:
   ```javascript
   const { SelfHealingLocator } = require('../../utils/web/SelfHealingLocator');
   ```

2. Create a self-healing locator:
   ```javascript
   const loginButton = new SelfHealingLocator(page, {
     css: '#login-button',
     xpath: '//button[contains(text(), "Login")]',
     text: 'Login',
     role: { role: 'button', name: 'Login' }
   });
   ```

3. Use the locator in your test:
   ```javascript
   await loginButton.click();
   ```

4. The locator will automatically try different strategies if the primary one fails.

## Example 9: Data-Driven Testing

**Task**: Implement data-driven tests.

**Documentation Path**:

1. Read [Data-Driven Testing](./data-driven-testing)
2. Check [Test Data Factory](../api/test-data-factory)

**Step-by-Step**:

1. Create a test data file:
   ```json
   // src/data/users.json
   [
     {
       "username": "user1",
       "password": "pass1",
       "expectedResult": "success"
     },
     {
       "username": "user2",
       "password": "wrongpass",
       "expectedResult": "failure"
     }
   ]
   ```

2. Create a data-driven test:
   ```javascript
   // src/tests/data-driven-login.spec.js
   const { test, expect } = require('@playwright/test');
   const { LoginPage } = require('../pages/LoginPage');
   const users = require('../data/users.json');

   test.describe('Data-driven login tests', () => {
     let loginPage;

     test.beforeEach(async ({ page }) => {
       loginPage = new LoginPage(page);
       await loginPage.navigate();
     });

     for (const user of users) {
       test(`Login with ${user.username} should ${user.expectedResult}`, async ({ page }) => {
         await loginPage.login(user.username, user.password);
         
         if (user.expectedResult === 'success') {
           await expect(page).toHaveURL('/dashboard');
         } else {
           const errorMessage = await loginPage.getErrorMessage();
           expect(errorMessage).toContain('Invalid username or password');
         }
       });
     }
   });
   ```

3. Run the data-driven tests:
   ```bash
   npx playwright test src/tests/data-driven-login.spec.js
   ```

## Example 10: Visual Testing

**Task**: Implement visual testing.

**Documentation Path**:

1. Read [Visual Testing](./visual-testing)
2. Check [Visual Comparison Utils](../api/visual-comparison-utils)

**Step-by-Step**:

1. Import the visual comparison utilities:
   ```javascript
   const { VisualComparisonUtils } = require('../../utils/visual/visualComparisonUtils');
   ```

2. Create a visual test:
   ```javascript
   // src/tests/visual/homepage.spec.js
   const { test } = require('@playwright/test');
   const { VisualComparisonUtils } = require('../../utils/visual/visualComparisonUtils');

   test.describe('Visual tests', () => {
     let visualUtils;

     test.beforeEach(async ({ page }) => {
       visualUtils = new VisualComparisonUtils(page);
       await page.goto('https://example.com');
     });

     test('homepage should match baseline', async ({ page }) => {
       await visualUtils.compareScreenshot('homepage');
     });

     test('header should match baseline', async ({ page }) => {
       await visualUtils.compareElement('header', 'header-component');
     });
   });
   ```

3. Run the visual tests:
   ```bash
   npx playwright test src/tests/visual/homepage.spec.js
   ```

4. The first run will create baseline images, subsequent runs will compare against the baselines.