<!-- Source: /Users/mzahirudeen/playwright-framework/docs/docusaurus/docs/faq.md -->

---
sidebar_position: 10
---

# Frequently Asked Questions

This page answers common questions about the Playwright Framework.

## General Questions

### What is Playwright Framework?

Playwright Framework is an enterprise-grade test automation solution built on top of Microsoft's Playwright. It provides additional features like test verification, coverage analysis, CI/CD integration, and more.

### How is it different from plain Playwright?

While Playwright provides the core browser automation capabilities, Playwright Framework adds:
- Advanced test verification and linting
- Test coverage analysis without instrumentation
- CI/CD integration utilities
- Test quality dashboard
- Self-healing locators
- Enhanced reporting capabilities

### Is it free to use?

Yes, Playwright Framework is open-source and free to use under the MIT license.

### Which browsers are supported?

Playwright Framework supports all browsers that Playwright supports:
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

### What programming languages are supported?

Currently, Playwright Framework supports JavaScript/Node.js. TypeScript support is available through Playwright's built-in TypeScript support.

## Installation & Setup

### What are the system requirements?

- **Node.js**: version 14 or higher
- **npm**: version 6 or higher
- **Operating System**: Windows, macOS, or Linux

### How do I install the framework?

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

See the [Installation](getting-started/installation) guide for detailed instructions.

### Do I need to install browsers separately?

Playwright can automatically install browsers with:

```bash
npx playwright install
```

For specific browsers:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### How do I update the framework?

```bash
npm update
```

## Writing Tests

### How do I create my first test?

See the [Quick Start](getting-started/quick-start) guide for a step-by-step tutorial.

### How do I use page objects?

Page objects help organize your test code. Here's a basic example:

```javascript
// src/pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
```

Then in your test:

```javascript
const { test } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('username', 'password');
});
```

### How do I run tests in parallel?

Playwright runs tests in parallel by default. You can configure the number of workers:

```bash
npx playwright test --workers=4
```

Or in your `playwright.config.js`:

```javascript
module.exports = {
  workers: 4
};
```

### How do I debug tests?

Use the `--debug` flag:

```bash
npx playwright test --debug
```

Or use `page.pause()` in your test:

```javascript
test('debug example', async ({ page }) => {
  await page.goto('https://example.com');
  await page.pause(); // This will open the Playwright Inspector
});
```

## Test Verification

### What does the test verification system check?

The test verification system checks:
- Proper test organization
- Appropriate assertions
- No empty or incomplete tests
- No overly complex tests
- No hardcoded credentials
- Proper error handling

### How do I run test verification?

```bash
npm run verify
```

Or with options:

```bash
npx playwright-framework verify-tests --dir src/tests --pattern "**/*.spec.js"
```

### How do I fix issues found by test verification?

The verification report provides specific recommendations for each issue. Common fixes include:
- Adding missing assertions
- Breaking down complex tests
- Removing hardcoded credentials
- Adding proper error handling

## Test Coverage

### How does the coverage analysis work without instrumentation?

The coverage analyzer:
1. Analyzes test files to identify imports and dependencies
2. Maps tests to source files based on imports
3. Calculates coverage metrics
4. Identifies gaps in coverage

### How do I run coverage analysis?

```bash
npm run coverage
```

Or with options:

```bash
npx playwright-framework test-coverage-analyze --test-dir src/tests --source-dir src --threshold 80
```

### What should I do with uncovered files?

Prioritize writing tests for:
1. Critical business logic
2. Code that changes frequently
3. Files with complex logic

## CI/CD Integration

### Which CI/CD systems are supported?

- GitHub Actions
- Jenkins
- GitLab CI
- Azure DevOps
- CircleCI
- Travis CI

### How do I set up CI/CD integration?

```bash
npm run ci:setup
```

Or with options:

```bash
npx playwright-framework ci-setup --system github --name "Playwright Tests"
```

### How do I run tests in Docker?

Use the official Playwright Docker image:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.35.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "test"]
```

## Reporting

### What report formats are supported?

- HTML reports
- JSON reports
- Allure reports
- JUnit reports
- Test quality dashboard

### How do I generate reports?

```bash
npm run report
```

Or with options:

```bash
npx playwright-framework test-report --types html,json,markdown --open
```

### How do I view the test quality dashboard?

```bash
npm run dashboard
```

Or with options:

```bash
npx playwright-framework test-dashboard --add-run --open
```

## Troubleshooting

### Tests pass locally but fail in CI

Common causes:
- Different browser versions
- Different screen resolutions
- Missing dependencies
- Timing issues

Solutions:
- Use the same browser version in CI and locally
- Set consistent viewport sizes
- Ensure all dependencies are installed
- Add proper waits and avoid fixed timeouts

### Tests are flaky

Common causes:
- Race conditions
- Animations
- Network requests
- Inconsistent test data

Solutions:
- Use proper waiting mechanisms
- Disable animations in tests
- Mock network requests
- Use consistent test data

### Browser installation fails

Solutions:
- Use the official Playwright Docker image
- Install system dependencies:
  ```bash
  npx playwright install-deps
  ```
- Run with administrator privileges:
  ```bash
  sudo npx playwright install
  ```

### Out of memory errors

Solutions:
- Reduce the number of parallel workers
- Close browser contexts after use
- Run fewer tests at once
- Increase memory limit in CI configuration

## Advanced Features

### How do self-healing locators work?

Self-healing locators automatically adapt to changes in the DOM:
1. Store multiple selector strategies for each element
2. Try each strategy when locating elements
3. Update selectors when they change
4. Log changes for review

### How do I use visual testing?

```javascript
const { test } = require('@playwright/test');
const { VisualComparisonUtils } = require('../utils/visual/visualComparisonUtils');

test('visual test', async ({ page }) => {
  const visualUtils = new VisualComparisonUtils(page);
  await page.goto('https://example.com');
  await visualUtils.compareScreenshot('homepage');
});
```

### How do I mock API responses?

```javascript
const { test } = require('@playwright/test');

test('mock API response', async ({ page }) => {
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: 'Mock User' }])
    });
  });
  
  await page.goto('https://example.com');
});
```

### How do I run tests on mobile devices?

Use device emulation:

```javascript
// In playwright.config.js
const { devices } = require('@playwright/test');

module.exports = {
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
};
```

## Contributing

### How do I contribute to the framework?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for your changes
5. Submit a pull request

See the [Contributing](contributing) guide for detailed instructions.

### How do I report bugs?

Open an issue on GitHub with:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, framework version)

### How do I request new features?

Open an issue on GitHub with:
- Description of the feature
- Use cases
- Expected behavior
- Any implementation ideas