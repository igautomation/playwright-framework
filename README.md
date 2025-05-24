# Playwright Framework with Salesforce Page Object Generation

A comprehensive test automation framework using Playwright with built-in Salesforce page object generation capabilities.

## Features

- **Page Object Generation**: Automatically generate page objects from Salesforce pages
- **Test Case Generation**: Create test cases with common scenarios
- **Docker Support**: Run tests in containers
- **CI/CD Integration**: GitHub Actions workflows
- **Reporting**: Multiple reporting options including Allure
- **Cross-browser Testing**: Chrome, Firefox, Safari, and mobile browsers

## Prerequisites

- Node.js (v16 or higher)
- Playwright (`npm install @playwright/test`)
- Salesforce CLI (`npm install @salesforce/cli`)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-framework.git
cd playwright-framework

# Install dependencies
npm install

# Install browsers
npx playwright install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file to set your Salesforce credentials and other configuration options.

## Salesforce Page Object Generation

### Extract DOM Elements

```bash
# Using npm script
npm run sf:extract -- --url "https://your-org.lightning.force.com/lightning/o/Contact/new"

# Using CLI directly
node src/utils/generators/sf-session-extractor.js --url "https://your-org.lightning.force.com/lightning/o/Contact/new"
```

### Generate Page Objects

```bash
# Using npm script
npm run sf:generate -- --name ContactPage --url "/lightning/o/Contact/new"

# Using CLI directly
node src/utils/generators/sf-page-generator.js --name ContactPage --url "/lightning/o/Contact/new"
```

### Complete Workflow

```bash
# Using npm script
npm run sf:workflow -- --url "https://your-org.lightning.force.com/lightning/o/Contact/new" --name ContactPage

# Using CLI directly
./run-sf-workflow.sh --url "https://your-org.lightning.force.com/lightning/o/Contact/new" --name ContactPage
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/pages/ContactPage.spec.js

# Run with UI mode
npm run test:ui

# Run Salesforce generator tests
npm run test:generators
```

## Docker Support

```bash
# Build and run tests in Docker
docker-compose up --build

# Run specific tests in Docker
docker-compose run playwright npm test -- tests/pages/ContactPage.spec.js
```

## CI/CD Integration

The framework includes GitHub Actions workflows:

- **CI**: Runs on every push and pull request
- **Salesforce Generators**: Tests the Salesforce page object generators

## Project Structure

```
playwright-framework/
├── src/
│   ├── pages/           # Generated page objects
│   │   ├── BasePage.js  # Base class for all pages
│   │   └── ...
│   └── utils/
│       └── generators/  # Generator utilities
│           ├── config.js
│           ├── selectors.js
│           ├── sf-page-generator.js
│           ├── sf-session-extractor.js
│           └── ...
├── tests/
│   ├── generators/      # Tests for generator utilities
│   └── pages/           # Generated test classes
├── .env.example         # Example environment variables
├── docker-compose.yml   # Docker configuration
├── Dockerfile           # Docker build file
├── playwright.config.js # Playwright configuration
└── run-sf-workflow.sh   # Main workflow script
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.