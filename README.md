# Playwright Test Framework

A comprehensive test automation framework using Playwright with support for standard web applications and Salesforce.

## Features

- Page Object Generation for standard web applications and Salesforce
- Modal/Dialog detection and handling
- Environment-specific configuration (Dev, QA, Prod)
- DOM collections support (tables, lists, grids)
- Test generation

## Environment Configuration

The framework supports multiple environments through environment-specific configuration files:

- `.env.example` - Template with all available configuration options
- `.env.dev` - Development environment configuration
- `.env.qa` - QA environment configuration
- `.env.prod` - Production environment configuration
- `.env` - Local overrides (not committed to version control)

To select an environment, set the `NODE_ENV` variable:

```bash
# For development
NODE_ENV=dev npx playwright test

# For QA
NODE_ENV=qa npx playwright test

# For production
NODE_ENV=prod npx playwright test
```

## Page Object Generation

Generate page objects from existing web pages:

```bash
# Standard web application
node src/utils/generators/generate-page.js --url https://example.com/page --name ExamplePage

# Salesforce application
node src/utils/generators/generate-page.js --url https://myorg.lightning.force.com/page --name SfPage --salesforce

# With authentication
node src/utils/generators/generate-page.js --url https://myorg.lightning.force.com/page --name SfPage --salesforce --username user@example.com --password mypassword

# Generate test files
node src/utils/generators/generate-page.js --url https://example.com/page --name ExamplePage --generate-tests
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/pages/OrangeHRMLogin.spec.js

# Run with specific browser
npx playwright test --project=chromium

# Run in debug mode
npx playwright test --debug
```

## Project Structure

```
playwright-framework/
├── auth/                  # Authentication storage
├── src/
│   ├── pages/             # Page objects
│   └── utils/
│       ├── generators/    # Page object generators
│       └── config.js      # Centralized configuration
├── tests/
│   └── pages/             # Test files
├── .env.example           # Environment template
├── .env.dev               # Development environment
├── .env.qa                # QA environment
├── .env.prod              # Production environment
└── playwright.config.js   # Playwright configuration
```