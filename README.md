# Playwright Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Testing](https://img.shields.io/badge/Testing-8A2BE2?style=for-the-badge&logo=testing-library&logoColor=white)

A comprehensive, modular test automation framework built with Playwright. This framework supports UI testing, API testing, visual regression, accessibility testing, performance testing, and localization testing in a unified architecture.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Framework Architecture](#framework-architecture)
- [Test Types](#test-types)
- [Key Components](#key-components)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Reporting](#reporting)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)
- [CI/CD Integration](#cicd-integration)
- [Additional Resources](#additional-resources)

## Features

- **Multi-browser Testing**: Run tests on Chromium, Firefox, WebKit, and mobile viewports
- **API Testing**: Comprehensive REST API testing capabilities with schema validation
- **Visual Testing**: Compare screenshots across different environments and device sizes
- **Accessibility Testing**: Automated accessibility audits using Playwright's accessibility features
- **Performance Testing**: Measure and analyze page load and interaction performance
- **Localization Testing**: Test applications across different languages and locales
- **Data-Driven Testing**: Support for YAML, JSON, XML, and Excel data sources
- **Self-Healing Locators**: Automatically recover from broken selectors
- **Reporting**: Detailed HTML and Allure reports with screenshots and videos
- **CI/CD Integration**: GitHub Actions workflows for continuous testing

## Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- Git
- Basic knowledge of JavaScript and testing concepts

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/playwright-framework.git
   cd playwright-framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Run a sample test to verify your setup:
   ```bash
   npx playwright test src/tests/visual/visualRegressionTest.spec.js --project=chromium
   ```

## Framework Architecture

Our framework follows a modular architecture designed for scalability, maintainability, and reusability:

```
playwright-framework/
├── .github/                  # GitHub Actions workflows
├── allure-results/           # Allure report data
├── playwright-report/        # HTML report
├── src/
│   ├── config/               # Configuration files
│   ├── data/                 # Test data files (YAML, JSON, etc.)
│   ├── fixtures/             # Test fixtures and contexts
│   ├── pages/                # Page Object Models
│   ├── tests/                # Test files
│   │   ├── accessibility/    # Accessibility tests
│   │   ├── api/              # API tests
│   │   ├── e2e/              # End-to-end tests
│   │   ├── localization/     # Localization tests
│   │   ├── performance/      # Performance tests
│   │   ├── visual/           # Visual regression tests
│   │   └── ...
│   └── utils/                # Utility functions and helpers
│       ├── accessibility/    # Accessibility testing utilities
│       ├── api/              # API testing utilities
│       ├── common/           # Common utilities
│       ├── localization/     # Localization utilities
│       ├── performance/      # Performance testing utilities
│       ├── reporting/        # Reporting utilities
│       ├── visual/           # Visual comparison utilities
│       └── web/              # Web interaction utilities
├── test-results/             # Test results and artifacts
├── visual-baselines/         # Visual baseline images
├── visual-diffs/             # Visual difference images
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── package.json              # Project dependencies and scripts
└── playwright.config.js      # Playwright configuration
```

### Key Design Principles

1. **Separation of Concerns**: Tests, page objects, and utilities are separated.
2. **Page Object Model**: UI interactions are encapsulated in page objects.
3. **Data-Driven Testing**: Tests can be parameterized with external data.
4. **Modularity**: Components are designed to be reusable and independent.
5. **Extensibility**: Framework can be extended with new utilities and test types.

## Test Types

Our framework supports multiple test types:

### UI Testing

Tests that interact with the application through the browser interface.

```javascript
// Example UI test
test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('testuser', 'password123');
  await expect(page).toHaveURL(/dashboard/);
});
```

### API Testing

Tests that interact with the application's API endpoints.

```javascript
// Example API test
test('should create a new user', async () => {
  const api = new ApiUtils('https://api.example.com');
  const user = User.createRandom();
  const response = await api.post('/users', user.toJSON());
  expect(response.status).toBe(201);
});
```

### Visual Testing

Tests that compare screenshots to detect visual regressions.

```javascript
// Example visual test
test('homepage should match baseline', async ({ page }) => {
  const visualUtils = new VisualComparisonUtils(page);
  await page.goto('https://example.com');
  await visualUtils.compareScreenshot('homepage');
});
```

### Accessibility Testing

Tests that check for accessibility issues.

```javascript
// Example accessibility test
test('homepage should be accessible', async ({ page }) => {
  const a11y = new AccessibilityUtils(page);
  await page.goto('https://example.com');
  const violations = await a11y.audit();
  expect(violations.length).toBe(0);
});
```

### Performance Testing

Tests that measure and analyze performance metrics.

```javascript
// Example performance test
test('page should load within threshold', async ({ page }) => {
  const perfUtils = new PerformanceUtils(page);
  const metrics = await perfUtils.measurePageLoad('https://example.com');
  expect(metrics.loadTime).toBeLessThan(3000);
});
```

### Localization Testing

Tests that verify application behavior across different languages and locales.

```javascript
// Example localization test
test('should display content in Spanish', async ({ page }) => {
  const l10n = new LocalizationUtils(page);
  await l10n.setLocale('es-ES');
  await page.goto('https://example.com');
  const content = await l10n.extractTextContent();
  expect(content).toContain('Bienvenido');
});
```

## Key Components

### Page Object Model

Page objects encapsulate UI interactions and provide a higher-level API for tests.

```javascript
// Example page object
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = 'https://example.com/login';
    this.usernameInput = '#username';
    this.passwordInput = '#password';
    this.loginButton = 'button[type="submit"]';
  }

  async login(username, password) {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
```

### Data Models

Data models represent entities in the application and provide methods for validation and serialization.

```javascript
// Example usage of User model
const user = new User('johndoe', 'password123');
user.firstName = 'John';
user.lastName = 'Doe';
user.email = 'john.doe@example.com';

// Validate user data
const validationResult = user.validate();
if (!validationResult.valid) {
  console.error(validationResult.errors);
}

// Serialize to JSON
const userData = user.toJSON();
```

### Utility Classes

Utility classes provide reusable functionality for tests.

```javascript
// Example API utility usage
const api = new ApiUtils('https://api.example.com');
const response = await api.get('/users/1');

// Example visual comparison utility usage
const visualUtils = new VisualComparisonUtils(page);
await visualUtils.compareScreenshot('homepage');

// Example web interactions utility usage
const web = new WebInteractions(page);
await web.navigate('https://example.com');
await web.click('#login-button');
```

### Test Fixtures

Fixtures provide setup and teardown functionality for tests.

```javascript
// Example fixture usage
const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    // Setup: Log in
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('testuser', 'password123');
    
    // Use the fixture
    await use(page);
    
    // Teardown: Log out
    const header = new HeaderComponent(page);
    await header.logout();
  }
});

// Use the fixture in a test
test('dashboard should display user info', async ({ loggedInPage }) => {
  const dashboard = new DashboardPage(loggedInPage);
  await expect(dashboard.userInfo).toBeVisible();
});
```

## Writing Tests

### Step 1: Identify the Test Scenario

- Determine what functionality you need to test
- Define the expected behavior
- Identify the test data required

### Step 2: Create or Reuse Page Objects (for UI tests)

- Check if existing page objects can be reused
- Create new page objects if needed
- Define locators and methods for the page

### Step 3: Write the Test

- Create a new file in the appropriate test directory
- Import necessary dependencies and page objects
- Write test cases using the Playwright test framework

### Step 4: Run and Debug

- Run your test with `npx playwright test path/to/your/test.spec.js`
- Use `--debug` flag for step-by-step debugging
- Use `--headed` flag to see the browser during test execution

### Example Test Structure

```javascript
// Import dependencies
const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const User = require('../../utils/api/models/User');

// Test suite
test.describe('User Authentication', () => {
  // Test data
  const user = User.createRandom();
  
  // Before each test
  test.beforeEach(async ({ page }) => {
    // Setup code
  });
  
  // Test case
  test('should login successfully with valid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    // Act
    await loginPage.login(user.username, user.password);
    
    // Assert
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.welcomeMessage).toBeVisible();
    await expect(dashboardPage.welcomeMessage).toContainText(user.firstName);
  });
  
  // After each test
  test.afterEach(async ({ page }) => {
    // Teardown code
  });
});
```

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Specific Test Categories

```bash
# Run visual tests
npm run test:visual

# Run accessibility tests
npm run test:accessibility

# Run API tests
npm run test:api

# Run performance tests
npm run test:performance

# Run localization tests
npm run test:localization
```

### Running Tests with Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Running Tests with UI Mode

```bash
npx playwright test --ui
```

### Running Tests with Debugging

```bash
npx playwright test --debug
```

### Running Tests with Headed Browser

```bash
npx playwright test --headed
```

### Running Tests with Specific Tags

```bash
npx playwright test --grep @smoke
```

## Reporting

### HTML Report

The framework generates HTML reports with test results, screenshots, and videos. Open the report after test execution:

```bash
npm run report
```

### Allure Report

The framework also supports Allure reporting:

```bash
npm run report:allure
```

### Custom Reports

You can generate custom reports using the reporting utilities:

```javascript
const ReportUtils = require('../../utils/reporting/reportUtils');
ReportUtils.generateHtmlReport();
```

## Best Practices

### 1. Test Organization

- Group related tests in the same file
- Use descriptive test names that explain the behavior being tested
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Selector Strategy

- Prefer data attributes for test automation: `data-testid="login-button"`
- Use semantic selectors when possible: `button[type="submit"]`
- Avoid brittle selectors like CSS classes that may change frequently
- Document complex selectors with comments

### 3. Test Independence

- Each test should be independent and not rely on the state from previous tests
- Use `beforeEach` and `afterEach` hooks for setup and teardown
- Reset application state between tests

### 4. Error Handling

- Add meaningful assertions that clearly indicate what is being tested
- Use custom error messages for complex assertions
- Handle expected errors gracefully

### 5. Test Data Management

- Use factory methods to generate test data
- Avoid hardcoding test data in tests
- Use external data sources for data-driven testing

### 6. Performance Considerations

- Keep tests focused and efficient
- Avoid unnecessary actions and assertions
- Use parallel execution when possible

### 7. Maintainability

- Follow DRY (Don't Repeat Yourself) principles
- Extract common functionality into helper methods
- Keep page objects and utilities up-to-date

## Troubleshooting

### Common Issues and Solutions

#### 1. Element Not Found

**Symptoms**: Test fails with "Element not found" or "Timeout waiting for selector"

**Solutions**:
- Check if the selector is correct
- Add explicit waits: `await page.waitForSelector('#element')`
- Check if the element is in an iframe
- Check if the element is dynamically loaded

#### 2. Test Flakiness

**Symptoms**: Tests pass sometimes and fail other times

**Solutions**:
- Add proper waits for application state
- Use retry mechanisms for flaky operations
- Implement self-healing locators
- Check for race conditions

#### 3. Authentication Issues

**Symptoms**: Tests fail due to authentication problems

**Solutions**:
- Check if credentials are correct
- Verify authentication flow
- Use API authentication when possible
- Store and reuse authentication tokens

#### 4. Visual Comparison Failures

**Symptoms**: Visual tests fail due to minor differences

**Solutions**:
- Adjust comparison threshold
- Update baseline images
- Use masking for dynamic content
- Check for environment-specific differences

### Debugging Techniques

1. **Visual Debugging**:
   ```bash
   npx playwright test --headed --debug
   ```

2. **Trace Viewer**:
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

3. **Screenshots and Videos**:
   - Check the `test-results` directory for artifacts

4. **Logging**:
   ```javascript
   console.log('Debug info:', value);
   ```

5. **Playwright Inspector**:
   ```bash
   npx playwright codegen https://example.com
   ```

## Advanced Topics

### 1. Custom Fixtures

Create custom fixtures for complex setup and teardown:

```javascript
// src/fixtures/authFixtures.js
const base = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

exports.test = base.test.extend({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('testuser', 'password123');
    await use(page);
    // Logout or cleanup after test
  }
});
```

### 2. API and UI Integration

Combine API and UI testing for efficient test scenarios:

```javascript
test('should create user via API and verify in UI', async ({ page }) => {
  // Create user via API
  const api = new ApiUtils('https://api.example.com');
  const user = User.createRandom();
  await api.post('/users', user.toJSON());
  
  // Verify user in UI
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(user.username, user.password);
  
  // Assert user is logged in
  const dashboardPage = new DashboardPage(page);
  await expect(dashboardPage.userInfo).toContainText(user.fullName);
});
```

### 3. Parallel Test Execution

Configure parallel execution in `playwright.config.js`:

```javascript
module.exports = {
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  // other config...
};
```

### 4. Test Sharding

Run tests across multiple machines:

```bash
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

### 5. Custom Reporters

Create custom reporters for specialized reporting needs:

```javascript
// src/utils/reporting/customReporter.js
class CustomReporter {
  onBegin(config, suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }
  
  onTestEnd(test, result) {
    console.log(`Test ${test.title}: ${result.status}`);
  }
  
  onEnd(result) {
    console.log(`Finished the run: ${result.status}`);
  }
}

module.exports = CustomReporter;
```

### 6. Visual Comparison Strategies

Implement different visual comparison strategies:

```javascript
// Full page comparison
await visualUtils.compareScreenshot('homepage');

// Element comparison
await visualUtils.compareElementScreenshot('#header', 'header');

// Responsive comparison
await visualUtils.compareResponsiveScreenshots('homepage', [
  { width: 1920, height: 1080 },
  { width: 768, height: 1024 },
  { width: 375, height: 667 }
]);

// Comparison with masking
await visualUtils.compareScreenshot('homepage', {
  mask: ['.dynamic-content', '.ads']
});
```

### 7. Data-Driven Testing

Implement data-driven tests using external data sources:

```javascript
const { readYaml } = require('../../utils/common/dataOrchestrator');
const testData = readYaml('src/data/users.yaml');

for (const user of testData.users) {
  test(`should login with user ${user.username}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);
    await expect(page).toHaveURL(/dashboard/);
  });
}
```

## CI/CD Integration

### GitHub Actions

The framework includes GitHub Actions workflows for continuous integration:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins

Example Jenkins pipeline:

```groovy
pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.32.0-focal'
    }
  }
  stages {
    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Run tests') {
      steps {
        sh 'npm test'
      }
    }
    stage('Generate report') {
      steps {
        sh 'npm run report:allure'
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
      publishHTML(target: [
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright Report'
      ])
    }
  }
}
```

## Working with the User Model

Our framework includes a sophisticated User model for API testing:

```javascript
const User = require('../utils/api/models/User');

// Create a user with individual properties
const user1 = new User('johndoe', 'password123');
user1.firstName = 'John';
user1.lastName = 'Doe';
user1.email = 'john.doe@example.com';

// Create a user from an object
const user2 = new User({
  username: 'janedoe',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com'
});

// Create a random user
const randomUser = User.createRandom();

// Validate user data
const validationResult = user1.validate(true);
if (!validationResult.valid) {
  console.error(validationResult.errors);
}

// Serialize to JSON (excluding password)
const userData = user1.toJSON(false);

// Clone a user
const clonedUser = user1.clone();

// Compare users
const areEqual = user1.equals(clonedUser);
```

The User model provides:

- Private fields with proper encapsulation
- Getters and setters for all properties
- Automatic timestamp tracking
- Validation with customizable strictness
- Serialization with password protection
- Utility methods like `clone()`, `equals()`, and `createRandom()`

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Allure Report Documentation](https://docs.qameta.io/allure/)
- [JavaScript MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Happy testing!