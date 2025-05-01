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

```bash
# Run all tests
npm test

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
