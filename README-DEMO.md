# Playwright Framework Demo

This document provides instructions for running the demo test scenario that showcases the key features of our enterprise-grade Playwright framework.

## Demo Test Scenario

The demo test scenario tests the OrangeHRM application and demonstrates the following features:

1. **Page Object Model**: Clean separation of test logic and page-specific code
2. **Test Data Factory**: Dynamic generation of test data
3. **API Testing**: POJO models with getters/setters
4. **UI Testing**: Reusable web interactions
5. **Accessibility Testing**: Integration with accessibility testing
6. **Performance Testing**: Measurement of page load metrics
7. **Web Scraping**: Extraction of structured data from web pages
8. **Schema Validation**: Validation of API responses against JSON schemas
9. **Self-Healing Locators**: Automatic recovery from broken locators
10. **Reporting**: Comprehensive test reports

## Running the Demo

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)
- Playwright browsers installed

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/playwright-framework.git
   cd playwright-framework
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Playwright browsers:

   ```bash
   npx playwright install --with-deps
   ```

4. Create a `.env` file:

   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with the following values:
   ```
   BASE_URL=https://opensource-demo.orangehrmlive.com/web/index.php
   API_URL=https://opensource-demo.orangehrmlive.com/web/index.php
   USERNAME=Admin
   PASSWORD=admin123
   ```

### Run the Demo Tests

Run all demo tests:

```bash
npx playwright test src/tests/demo/orangehrm-e2e.spec.js
```

Run a specific test:

```bash
npx playwright test src/tests/demo/orangehrm-e2e.spec.js:22 # Login and verify dashboard
```

Run tests with specific tags:

```bash
npx playwright test --grep @demo
```

Run tests in headed mode:

```bash
npx playwright test src/tests/demo/orangehrm-e2e.spec.js --headed
```

### Demo Test Files

- **Page Objects**:

  - `src/pages/BasePage.js`: Base page object with common functionality
  - `src/pages/orangehrm/LoginPage.js`: Login page object
  - `src/pages/orangehrm/DashboardPage.js`: Dashboard page object

- **API Models**:

  - `src/utils/api/models/Employee.js`: Employee POJO model

- **Utilities**:

  - `src/utils/common/testDataFactory.js`: Test data generation
  - `src/utils/web/accessibilityUtils.js`: Accessibility testing
  - `src/utils/web/performanceUtils.js`: Performance testing
  - `src/utils/web/webScrapingUtils.js`: Web scraping
  - `src/utils/api/schemaValidator.js`: API schema validation

- **Test Files**:

  - `src/tests/demo/orangehrm-e2e.spec.js`: End-to-end tests

- **Schemas**:
  - `data/schemas/employee.schema.json`: Employee schema for validation

## Demo Test Cases

1. **Login and verify dashboard**:

   - Uses Page Object Model
   - Performs UI testing
   - Verifies dashboard elements

2. **API and UI integration test**:

   - Uses POJO models
   - Validates data against schema
   - Integrates API and UI testing

3. **Web scraping and DOM analysis**:

   - Extracts structured data from web pages
   - Saves DOM snapshots
   - Analyzes page structure

4. **Accessibility testing**:

   - Checks for accessibility violations
   - Generates accessibility reports

5. **Performance testing**:
   - Measures page load time
   - Analyzes resource loading
   - Generates performance reports

## Viewing Reports

After running the tests, you can view the reports:

- **HTML Report**:

  ```bash
  npx playwright show-report
  ```

- **Accessibility Report**:

  ```bash
  open reports/accessibility/
  ```

- **Performance Report**:
  ```bash
  open reports/performance/
  ```
