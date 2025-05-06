<<<<<<< HEAD
# Salesforce Playwright Test Automation Framework

A comprehensive, production-grade test automation framework for Salesforce applications using Playwright.

## 🔧 Features

- **Page Object Model** for Salesforce UI components
- **API Integration** with Salesforce REST API
- **Multi-environment** configuration support
- **Jira/Xray** integration for test case management
- **Allure Reporting** with screenshots and videos
- **CI/CD Integration** with GitHub Actions
- **Advanced Testing** features like smart retries and flaky test handling

## 📋 Prerequisites

- Node.js 18+
- Salesforce account with API access
- Connected App in Salesforce (for API access)
- Jira/Xray for test management (optional)

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your Salesforce credentials.

4. Run tests:
=======
# Playwright Framework

A comprehensive framework for web automation, testing, and reporting using Playwright.

## Overview

This framework integrates [Playwright](https://playwright.dev/) to provide powerful capabilities for:

- Screenshot capture
- PDF generation
- Accessibility testing
- Responsive design testing
- Network mocking
- Debugging with traces
- Error handling

## Features

### PlaywrightService

A unified service for browser automation tasks:

```javascript
const { PlaywrightService } = require('./src/utils/common');

const playwrightService = new PlaywrightService();

// Capture screenshot
await playwrightService.captureScreenshot('https://example.com', {
  path: 'screenshot.png',
  fullPage: true
});

// Generate PDF
await playwrightService.generatePdf('https://example.com', {
  path: 'document.pdf',
  format: 'A4'
});

// Run accessibility audit
const accessibilityResults = await playwrightService.runAccessibilityAudit('https://example.com');
```

### Enhanced Error Handling

Robust error handling with retry mechanisms, timeouts, and graceful degradation:

```javascript
const { PlaywrightErrorHandler } = require('./src/utils/common');

// Retry mechanism
const retryableFunction = PlaywrightErrorHandler.withRetry(
  async () => {
    // Operation that might fail intermittently
  },
  { maxRetries: 3, retryDelay: 1000 }
);

// Timeout handling
const timeoutFunction = PlaywrightErrorHandler.withTimeout(
  async () => {
    // Operation that might hang
  },
  5000, // 5 second timeout
  { action: 'performing operation' }
);

// Graceful degradation
const gracefulFunction = PlaywrightErrorHandler.withGracefulDegradation(
  // Primary function
  async () => {
    // Operation that might fail
  },
  // Fallback function
  async (args, error) => {
    // Alternative implementation
  }
);
```

### Integration with Reporting System

The framework integrates with a reporting system for generating charts, tables, and reports:

- Enhanced screenshot capabilities for charts and tables
- PDF generation for reports
- Accessibility testing for reports
- Responsive design testing for reports

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-framework.git

# Install dependencies
cd playwright-framework
npm install
```

## Usage

### Running Examples

```bash
# Run all examples
npm run examples:playwright

# Run specific examples
npm run examples:screenshot
npm run examples:pdf
npm run examples:accessibility
npm run examples:responsive
npm run examples:trace
npm run examples:network
npm run examples:error
```

### Running Tests
>>>>>>> 51948a2 (Main v1.0)

```bash
# Run all tests
npm test

<<<<<<< HEAD
# Run UI tests only
npm run test:ui

# Run API tests only
npm run test:api

# Run smoke tests
npm run test:smoke
```

## 📁 Project Structure

```
├── tests/               # Test files
│   ├── ui/              # UI tests
│   ├── api/             # API tests
│   └── hybrid/          # Hybrid tests using both UI and API
├── pages/               # Page Objects for Salesforce UI
├── data/                # Test data
├── utils/               # Utilities and helpers
├── config/              # Environment configuration
├── reports/             # Test reports
├── .github/workflows/   # CI/CD configurations
├── playwright.config.js # Playwright configuration
└── cli.js               # CLI utility
```

## 🔄 Test Execution

The framework supports various test execution modes:

```bash
# Run specific test file
npx playwright test tests/ui/login.spec.js

# Run tests with specific tag
npx playwright test --grep @smoke

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with UI mode
npm run test:ui

# Run tests with debug mode
npm run test:debug
```

## 📊 Reporting

Generate and view Allure reports:

```bash
npm run test:report
```

## 💻 CLI Utility

The framework includes a CLI utility for common tasks:

```bash
# Show help
node cli.js --help

# Run smoke tests
node cli.js run:smoke

# Run tests with specific browser
node cli.js run --browser=firefox

# Fetch test cases from Xray
node cli.js xray:fetch

# Clean reports and artifacts
node cli.js clean
```

## 🔗 Jira/Xray Integration

Connect tests to Jira test cases using tags:

```javascript
test('should create contact via API and verify via UI @ui @api @SFPROJ-123', async ({ page }) => {
  // Test implementation
});
```

## 🌐 Environment Configuration

The framework supports multiple environments:

- Create environment-specific `.env` files: `.env.development`, `.env.qa`, etc.
- Run tests with specific environment:

```bash
NODE_ENV=qa npm test
```

## 🤝 Contributing

1. Create feature branches from `main`
2. Follow the coding standards
3. Run linting and tests before pushing
4. Create Pull Requests for review

## 📄 License

MIT
=======
# Run tests in watch mode
npm run test:watch
```

### Starting the Dashboard

```bash
npm run dashboard
```

## Documentation

- [Playwright Integration Guide](docs/playwright-integration-guide.md)
- [Error Handling Guide](docs/error-handling-guide.md)
- [Report Templates Guide](docs/report-templates-guide.md)
- [Report History Guide](docs/report-history-guide.md)

## Examples

Check out the [examples](examples/playwright) directory for practical examples of using the framework.

## License

MIT
>>>>>>> 51948a2 (Main v1.0)
