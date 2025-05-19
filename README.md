# Playwright Test Framework

A comprehensive, modular test automation framework built with Playwright.

## Features

- **Page Object Model**: Structured approach to creating maintainable tests
- **Data-Driven Testing**: Run tests with different data sets
- **API Testing**: Test REST and GraphQL APIs
- **Visual Testing**: Compare screenshots for visual regression
- **Accessibility Testing**: Validate WCAG compliance
- **Cross-Browser Testing**: Run tests on Chrome, Firefox, and Safari
- **Mobile Testing**: Test on mobile viewports
- **Performance Testing**: Measure and validate performance metrics
- **Reporting**: Generate comprehensive test reports

## Directory Structure

```
playwright-framework/
├── scripts/               # Utility scripts
│   ├── runners/           # Test runner scripts
│   ├── setup/             # Setup scripts
│   ├── utils/             # Utility scripts
│   └── make-executable/   # Scripts to make other scripts executable
├── src/
│   ├── config/            # Configuration files
│   │   └── playwright.config.js  # Playwright configuration
│   ├── data/              # Test data
│   │   ├── csv/           # CSV test data
│   │   └── json/          # JSON test data
│   ├── fixtures/          # Test fixtures
│   │   └── base-fixtures.js  # Base fixtures for tests
│   ├── pages/             # Page objects
│   │   ├── BasePage.js    # Base page object
│   │   └── components/    # Reusable page components
│   ├── tests/             # Test files
│   │   ├── accessibility/ # Accessibility tests
│   │   ├── api/           # API tests
│   │   ├── e2e/           # End-to-end tests
│   │   ├── integration/   # Integration tests
│   │   ├── performance/   # Performance tests
│   │   ├── unit/          # Unit tests
│   │   └── visual/        # Visual regression tests
│   └── utils/             # Utility functions
│       ├── accessibility/ # Accessibility testing utilities
│       ├── api/           # API testing utilities
│       ├── common/        # Common utilities
│       └── web/           # Web testing utilities
├── reports/               # Test reports
│   ├── allure/            # Allure reports
│   ├── html/              # HTML reports
│   └── screenshots/       # Test screenshots
└── docs/                  # Documentation
    ├── api/               # API documentation
    ├── guides/            # User guides
    └── examples/          # Example code
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-framework.git
cd playwright-framework

# Install dependencies
npm install

# Install browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:api
npm run test:e2e
npm run test:visual
npm run test:accessibility
npm run test:performance
npm run test:unit
npm run test:integration

# Run tests with specific browsers
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:mobile

# Run tests with UI mode
npm run test:ui
```

## Test Types

### API Tests

Tests for API endpoints using the API client:

```javascript
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api/apiUtils');

test('GET users endpoint returns correct data', async () => {
  const apiClient = new ApiClient('https://api.example.com');
  const response = await apiClient.get('/users');
  expect(response.data).toBeDefined();
});
```

### E2E Tests

End-to-end tests using page objects:

```javascript
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('../../pages/TodoPage');

test('should allow adding new todos', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  await todoPage.addTodo('Buy groceries');
  const todos = await todoPage.getTodos();
  expect(todos).toContain('Buy groceries');
});
```

### Visual Tests

Visual regression tests using screenshot comparison:

```javascript
const { test, expect } = require('@playwright/test');
const ScreenshotUtils = require('../../utils/web/screenshotUtils');

test('homepage visual regression test', async ({ page }) => {
  const screenshotUtils = new ScreenshotUtils(page);
  await page.goto('https://example.com');
  await screenshotUtils.takeScreenshot('homepage');
  // Compare with baseline
});
```

### Accessibility Tests

Tests for accessibility compliance:

```javascript
const { test, expect } = require('@playwright/test');
const { checkAccessibility } = require('../../utils/accessibility/accessibilityUtils');

test('homepage should not have critical accessibility violations', async ({ page }) => {
  await page.goto('https://example.com');
  const result = await checkAccessibility(page);
  expect(result.passes).toBeTruthy();
});
```

## Utilities

The framework provides several utility classes to help with testing:

- **ApiClient**: Helper methods for API testing
- **WebInteractions**: Helper methods for web interactions
- **ScreenshotUtils**: Utilities for taking and comparing screenshots
- **TestDataFactory**: Generate test data for tests
- **Logger**: Logging utilities for tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.