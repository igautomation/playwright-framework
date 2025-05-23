# Playwright Test Framework

A comprehensive test automation framework built with Playwright for web, API, visual, and accessibility testing.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
  - [Basic Commands](#basic-commands)
  - [Running Specific Tests](#running-specific-tests)
  - [Test Reports](#test-reports)
- [Project Structure](#project-structure)
- [Test Types](#test-types)
  - [API Tests](#api-tests)
  - [UI Tests](#ui-tests)
  - [Accessibility Tests](#accessibility-tests)
  - [Visual Tests](#visual-tests)
  - [Combined Tests](#combined-tests)
- [Framework Utilities](#framework-utilities)
  - [WebInteractions](#webinteractions)
  - [ApiUtils](#apiutils)
  - [Accessibility Utils](#accessibility-utils)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Playwright Configuration](#playwright-configuration)
- [CI/CD Integration](#cicd-integration)
- [Docker Support](#docker-support)
- [Maintenance](#maintenance)
- [Contributing](#contributing)
- [License](#license)

## Features

- **API Testing**: Comprehensive API testing with schema validation and data-driven approaches
- **UI Testing**: Page object model implementation for UI tests
- **Accessibility Testing**: Automated accessibility testing with axe-core
- **Visual Testing**: Visual comparison testing
- **Data-Driven Testing**: Support for multiple data sources (JSON, CSV, YAML)
- **Environment-Based Configuration**: Run tests against different environments
- **Docker Support**: Run tests in containerized environments
- **CI/CD Integration**: GitHub Actions workflows for continuous testing
- **Reporting**: HTML reports, Allure reports, and custom dashboards
- **Framework Health Checks**: Validate framework integrity

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Browsers (automatically installed by Playwright)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-framework.git

# Navigate to the project directory
cd playwright-framework

# Install dependencies
npm install

# Install browsers
npx playwright install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy from example
cp .env.example .env
```

Key environment variables:

```
# API Configuration
API_BASE_URL=https://reqres.in/api
API_KEY=reqres-free-v1

# Web Configuration
BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_URL=https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
TODO_APP_URL=https://demo.playwright.dev/todomvc

# Credentials
USERNAME=Admin
PASSWORD=admin123
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with UI mode
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

### Running Specific Tests

```bash
# Run API tests
npm run test:api

# Run UI tests
npm run test:ui

# Run accessibility tests
npm run test:accessibility

# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression
```

### Test Reports

```bash
# Show HTML report
npm run report

# Generate and open Allure report
npm run report:allure
```

## Project Structure

```
playwright-framework/
├── .github/                # GitHub workflows
├── docs/                   # Documentation
├── reports/                # Test reports
├── scripts/                # Utility scripts
│   ├── runners/            # Test runners
│   ├── setup/              # Setup scripts
│   └── utils/              # Utility scripts
├── src/
│   ├── config/             # Configuration files
│   ├── data/               # Test data
│   ├── pages/              # Page objects
│   ├── tests/              # Test files
│   │   ├── accessibility/  # Accessibility tests
│   │   ├── api/            # API tests
│   │   ├── combined/       # Combined API/UI tests
│   │   ├── core/           # Core functionality tests
│   │   └── e2e/            # End-to-end tests
│   └── utils/              # Utility functions
│       ├── accessibility/  # Accessibility utilities
│       ├── api/            # API utilities
│       ├── common/         # Common utilities
│       └── web/            # Web utilities
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── global-setup.js         # Global setup for tests
├── playwright.config.js    # Playwright configuration
└── package.json            # Project dependencies
```

## Test Types

### API Tests

API tests are located in `src/tests/api/` and use the `ApiUtils` class for making requests.

Example API test:

```javascript
test('Get user by ID', async ({ request }) => {
  const apiUtils = new ApiUtils(request, process.env.API_BASE_URL);
  const response = await apiUtils.get(`/users/${process.env.TEST_USER_ID}`);
  
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.data).toHaveProperty('id', parseInt(process.env.TEST_USER_ID));
});
```

### UI Tests

UI tests use the Page Object Model pattern and are located in `src/tests/core/` and `src/tests/e2e/`.

Example UI test:

```javascript
test('Login with valid credentials', async ({ page }) => {
  await page.goto(process.env.ORANGEHRM_URL);
  await page.getByPlaceholder('Username').fill(process.env.USERNAME);
  await page.getByPlaceholder('Password').fill(process.env.PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  
  await page.waitForURL('**/dashboard/index');
  await expect(page.locator('.oxd-topbar-header-title')).toBeVisible();
});
```

### Accessibility Tests

Accessibility tests use axe-core to validate web pages against WCAG guidelines.

Example accessibility test:

```javascript
test('Page should not have critical accessibility violations', async ({ page }) => {
  await page.goto(process.env.ORANGEHRM_URL);
  
  const { passes } = await checkAccessibility(page, {
    includedImpacts: ['critical', 'serious']
  });
  
  expect(passes).toBeTruthy();
});
```

### Visual Tests

Visual tests compare screenshots against baseline images to detect visual regressions.

### Combined Tests

Combined tests demonstrate how to mix API and UI testing approaches.

Example combined test:

```javascript
test('Create user via API and verify in UI', async ({ page, request }) => {
  // Create user via API
  const apiUtils = new ApiUtils(request, process.env.API_BASE_URL);
  const response = await apiUtils.post('/users', {
    name: 'John Doe',
    job: 'QA Engineer'
  });
  
  expect(response.status()).toBe(201);
  const userData = await response.json();
  
  // Verify user in UI
  await page.goto(process.env.BASE_URL);
  // UI verification steps...
});
```

## Framework Utilities

### WebInteractions

The `WebInteractions` class provides helper methods for common web interactions:

```javascript
const webInteractions = new WebInteractions(page);

// Fill form fields
await webInteractions.fillForm({
  [selectors.usernameInput]: username,
  [selectors.passwordInput]: password
});

// Click elements
await webInteractions.click(selectors.loginButton);

// Wait for elements
await webInteractions.waitForElement(selector);
```

### ApiUtils

The `ApiUtils` class simplifies API testing:

```javascript
const apiUtils = new ApiUtils(request, baseUrl);

// GET request
const response = await apiUtils.get('/users', { params: { page: 1 } });

// POST request
const createResponse = await apiUtils.post('/users', { name: 'John', job: 'Developer' });

// PUT request
const updateResponse = await apiUtils.put(`/users/${id}`, { name: 'Updated Name' });
```

### Accessibility Utils

Accessibility utilities help with testing web accessibility:

```javascript
// Check accessibility
const { passes, violations } = await checkAccessibility(page);

// Generate accessibility report
const reportPath = await generateAccessibilityReport(page, 'reports/accessibility/report');
```

## Configuration

### Environment Variables

Key environment variables:

- `API_BASE_URL`: Base URL for API tests
- `BASE_URL`: Base URL for UI tests
- `USERNAME`, `PASSWORD`: Login credentials
- `NODE_ENV`: Environment (dev, qa, prod)
- `HEADLESS`: Run tests in headless mode (true/false)

### Playwright Configuration

The `playwright.config.js` file contains configuration for:

- Browsers (Chromium, Firefox, WebKit)
- Test timeouts
- Parallelism
- Screenshots and videos
- Reporting

## CI/CD Integration

GitHub Actions workflows are provided for:

- Running tests on push/pull request
- Framework validation
- Linting
- Docker-based testing

## Docker Support

Run tests in Docker:

```bash
# Build Docker image
docker build -t playwright-framework .

# Run tests in Docker
docker run --rm -v $(pwd)/reports:/app/reports playwright-framework
```

## Maintenance

- Run framework health check: `node scripts/utils/framework-health-check.js`
- Validate tests: `npm run validate`
- Fix common issues: `node scripts/utils/fix-credentials.js`

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.