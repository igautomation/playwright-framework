# Playwright Testing Framework User Guide

## Table of Contents

1. [Framework Features](#framework-features)
2. [Installation](#installation)
3. [Running Tests](#running-tests)
4. [Framework Architecture](#framework-architecture)
5. [Utility Modules](#utility-modules)
6. [CI/CD Integration](#cicd-integration)
7. [Docker Setup](#docker-setup)
8. [Helper Classes](#helper-classes)
9. [Out-of-the-Box Features](#out-of-the-box-features)
10. [Useful Commands](#useful-commands)

## Framework Features

This comprehensive Playwright testing framework provides a robust set of tools and utilities for end-to-end testing:

1. **API Testing**

   - Path: `/src/utils/api`
   - Purpose: Comprehensive API testing with request handling, authentication, and validation.
   - 🧩 Core Functions: REST client, GraphQL support, schema validation
   - Integration Points: Works with any REST or GraphQL API

2. **UI Testing**

   - Path: `/src/utils/web`
   - Purpose: Robust UI testing with page objects and element interactions.
   - 🧩 Core Functions: Page object model, element interactions, self-healing locators
   - Integration Points: Works with any web application

3. **Salesforce Integration**

   - Path: `/src/utils/salesforce`
   - Purpose: Specialized utilities for Salesforce testing.
   - 🧩 Core Functions: Authentication, object management, API integration
   - Integration Points: Salesforce platform

4. **Performance Testing**

   - Path: `/src/utils/performance`
   - Purpose: Performance metrics & Core Web Vitals (CWV) analysis.
   - 🧩 Core Functions: Navigation timing, resource timing, Core Web Vitals measurement
   - Integration Points: Any web application with performance requirements

5. **Accessibility Testing**

   - Path: `/src/utils/accessibility`
   - Purpose: Automated accessibility compliance checking.
   - 🧩 Core Functions: WCAG compliance checks, violation reporting
   - Integration Points: Any web application requiring accessibility testing

6. **Visual Comparison**

   - Path: `/src/utils/visual`
   - Purpose: Screenshot comparison and visual regression testing.
   - 🧩 Core Functions: Baseline comparison, diff generation, reporting
   - Integration Points: UI components and layouts

7. **Web Scraping**

   - Path: `/src/utils/web`
   - Purpose: Data extraction and web scraping capabilities.
   - 🧩 Core Functions: Table extraction, structured data extraction, DOM snapshots
   - Integration Points: Data-driven testing, content validation

8. **Data Visualization**

   - Path: `/src/utils/visualization`
   - Purpose: Generate charts and visual reports from test data.
   - 🧩 Core Functions: Chart generation, data analysis, report creation
   - Integration Points: Test results, extracted data

9. **Reporting**

   - Path: `/src/utils/reporting`
   - Purpose: Comprehensive test reporting and result visualization.
   - 🧩 Core Functions: HTML reports, PDF generation, scheduled reports
   - Integration Points: CI/CD pipelines, dashboards

10. **Localization Testing**

    - Path: `/src/utils/localization`
    - Purpose: Multi-language testing support.
    - 🧩 Core Functions: Language switching, text validation
    - Integration Points: Internationalized applications

11. **Database Testing**

    - Path: `/src/utils/database`
    - Purpose: Database connection and query execution.
    - 🧩 Core Functions: Query execution, data validation
    - Integration Points: Any database system

12. **CI Integration**

    - Path: `/src/utils/ci`
    - Purpose: CI/CD pipeline integration utilities.
    - 🧩 Core Functions: Test selection, flaky test tracking, quality dashboards
    - Integration Points: GitHub Actions, Jenkins, etc.

13. **Page Object Generator**

    - Path: `/src/utils/generators`
    - Purpose: Automatic generation of page objects from web pages.
    - 🧩 Core Functions: Element extraction, page object template generation
    - Integration Points: Web application development workflow

14. **Test Data Management**

    - Path: `/src/utils/data`
    - Purpose: Test data generation and management.
    - 🧩 Core Functions: Data factories, fixtures, external data sources
    - Integration Points: All test types requiring data

15. **Mobile Testing Support**
    - Path: `/src/utils/mobile`
    - Purpose: Mobile-specific testing utilities.
    - 🧩 Core Functions: Mobile device emulation, responsive testing
    - Integration Points: Mobile web applications

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Standard Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-framework.git
cd playwright-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Docker Installation

```bash
# Build the Docker image
docker-compose build

# Run tests using Docker
docker-compose up
```

## Running Tests

### Basic Test Execution

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test path/to/test.spec.js

# Run tests with specific project
npx playwright test --project=chromium
```

### Test Filtering

```bash
# Run tests with specific tag
npx playwright test --grep "@smoke"

# Run tests excluding specific tag
npx playwright test --grep-invert "@slow"
```

### Test Reporting

```bash
# Generate HTML report
npx playwright show-report

# Generate and open HTML report
npm run report

# Generate coverage report
npm run coverage
```

## Framework Architecture

The framework follows a modular architecture with clear separation of concerns:

```
playwright-framework/
├── src/                    # Source code
│   ├── config/             # Configuration files
│   ├── pages/              # Page objects
│   ├── tests/              # Test files
│   └── utils/              # Utility modules
├── data/                   # Test data
├── reports/                # Test reports
└── scripts/                # Helper scripts
```

### Key Components

1. **Page Objects**: Located in `src/pages/`, these represent web pages with their elements and actions.
2. **Test Files**: Located in `src/tests/`, these contain the actual test scenarios.
3. **Utility Modules**: Located in `src/utils/`, these provide reusable functionality.
4. **Configuration**: Located in `src/config/`, these control the framework behavior.

## Utility Modules

### API Testing

The API testing utilities provide a robust client for testing REST and GraphQL APIs:

```javascript
const { ApiClient } = require('../../utils/api');

// Create API client
const apiClient = new ApiClient('https://api.example.com');

// Make requests
const response = await apiClient.get('/users/1');
const user = await apiClient.post('/users', { name: 'John', job: 'Developer' });
```

### Performance Testing

The performance utilities help measure and analyze web page performance:

```javascript
const { runPerformanceTest } = require('../../utils/performance/performanceUtils');

// Run performance test
const results = await runPerformanceTest(page, 'https://example.com', {
  reportPath: './reports/performance/example-report.html',
});

// Access metrics
console.log(`Page load time: ${results.pageLoad.measureTiming.duration}ms`);
console.log(`First contentful paint: ${results.pageLoad.firstContentfulPaint.startTime}ms`);
```

### Accessibility Testing

The accessibility utilities help identify accessibility issues:

```javascript
const { checkAccessibility } = require('../../utils/accessibility/accessibilityUtils');

// Check accessibility
const result = await checkAccessibility(page, {
  includedImpacts: ['critical', 'serious'],
});

// Handle results
if (!result.passes) {
  console.log(`Found ${result.violations.length} accessibility violations`);
}
```

### Visual Comparison

The visual comparison utilities help detect visual regressions:

```javascript
const VisualComparisonUtils = require('../../utils/visual/visualComparisonUtils');

// Create visual comparison utility
const visualUtils = new VisualComparisonUtils(page);

// Compare screenshot with baseline
const result = await visualUtils.compareScreenshot('homepage');

// Check result
if (!result.match) {
  console.log(`Visual difference detected: ${result.diffPercentage}%`);
}
```

### Web Scraping

The web scraping utilities help extract data from web pages:

```javascript
const WebScrapingUtils = require('../../utils/web/webScrapingUtils');

// Create web scraping utility
const scraper = new WebScrapingUtils(page);

// Extract table data
const products = await scraper.extractTableData('#products-table');

// Extract structured data
const productDetails = await scraper.extractStructuredData({
  name: '.product-name',
  price: '.product-price',
  description: '.product-description',
});
```

## CI/CD Integration

### GitHub Actions

The framework includes GitHub Actions workflows for automated testing:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins Integration

To integrate with Jenkins, create a Jenkinsfile:

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.40.0-focal'
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
                sh 'npx playwright show-report'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**'
        }
    }
}
```

## Docker Setup

The framework includes Docker configuration for containerized testing:

### Docker Compose

```yaml
# docker-compose.yml
services:
  playwright:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ./test-results:/app/test-results
      - ./playwright-report:/app/playwright-report
      - ./reports:/app/reports
    environment:
      - BASE_URL=${BASE_URL:-https://demo.playwright.dev}
      - HEADLESS=${HEADLESS:-true}
```

### Dockerfile

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV CI=true
ENV HEADLESS=true

# Default command
CMD ["npm", "test"]
```

### Running with Docker

```bash
# Build and run with Docker Compose
docker-compose up

# Run with specific environment variables
BASE_URL=https://example.com HEADLESS=true docker-compose up
```

## Helper Classes

### Page Object Base Class

```javascript
// src/pages/BasePage.js
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(`${process.env.BASE_URL}${path}`);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return await this.page.title();
  }
}

module.exports = BasePage;
```

### Test Data Factory

```javascript
// src/utils/data/testDataFactory.js
class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      name: `User ${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      role: 'user',
      ...overrides,
    };
  }

  static createProduct(overrides = {}) {
    return {
      name: `Product ${Date.now()}`,
      price: Math.floor(Math.random() * 100) + 1,
      category: 'electronics',
      ...overrides,
    };
  }
}

module.exports = TestDataFactory;
```

## Out-of-the-Box Features

### Self-Healing Locators

The framework includes self-healing locators that can adapt to minor UI changes:

```javascript
// src/utils/web/SelfHealingLocator.js
const { SelfHealingLocator } = require('../../utils/web');

// Create a self-healing locator
const loginButton = new SelfHealingLocator(page, [
  '#login-button',
  '.login-btn',
  'button:has-text("Login")',
  'button.btn-primary',
]);

// Use the locator
await loginButton.click();
```

### Test Data Management

```javascript
// src/utils/data/dataOrchestrator.js
const { DataOrchestrator } = require('../../utils/common');

// Create data orchestrator
const dataOrchestrator = new DataOrchestrator();

// Load test data
const users = await dataOrchestrator.loadData('users.json');

// Use test data in tests
for (const user of users) {
  await test.step(`Test with user ${user.name}`, async () => {
    // Test logic using user data
  });
}
```

### Error Handling

```javascript
// src/utils/common/errorHandler.js
const { errorHandler } = require('../../utils/common');

// Wrap test in error handler
await errorHandler(
  async () => {
    // Test logic that might throw errors
  },
  {
    retries: 3,
    onError: error => console.log(`Error occurred: ${error.message}`),
  }
);
```

## Useful Commands

### Test Execution

```bash
# Run all tests
npm test

# Run tests with specific browser
npx playwright test --project=firefox

# Run tests in parallel with 4 workers
npx playwright test --workers=4

# Run tests with UI mode
npx playwright test --ui

# Run tests with debug mode
npx playwright test --debug

# Run tests with headed browsers
npx playwright test --headed
```

### Test Generation

```bash
# Generate tests with Playwright Codegen
npx playwright codegen https://example.com

# Generate page objects
node bin/generate-page https://example.com LoginPage
```

### Reporting

```bash
# Show HTML report
npx playwright show-report

# Generate report in different formats
npx playwright test --reporter=html,json,dot

# Generate and open coverage report
npm run coverage
```

### Docker Commands

```bash
# Run tests in Docker
docker-compose up

# Run specific test in Docker
docker-compose run playwright npx playwright test path/to/test.spec.js

# Run tests with environment variables
docker-compose run -e BASE_URL=https://example.com playwright npm test
```

### Utility Scripts

```bash
# Consolidate documentation
node scripts/consolidate-docs.js

# Run test runner script
bash scripts/test-runner.sh

# Generate page objects
node bin/generate-page https://example.com LoginPage

# Generate selectors
node bin/generate-selectors https://example.com "#login-form"
```

---

This user guide provides an overview of the Playwright testing framework. For more detailed information, refer to the specific documentation files in the `docs/` directory.
