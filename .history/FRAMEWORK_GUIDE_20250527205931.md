# Playwright Framework User Guide

## 1. Complete Framework Feature Listing

The Playwright Framework is a comprehensive end-to-end testing solution with the following key capabilities:

- **UI Testing**: Automated browser testing with cross-browser support
- **API Testing**: REST and GraphQL API testing capabilities
- **Visual Testing**: Screenshot comparison and visual regression testing
- **Accessibility Testing**: Automated accessibility audits
- **Performance Testing**: Core Web Vitals and performance metrics
- **Data-Driven Testing**: Support for multiple data formats (CSV, JSON, YAML)
- **Self-Healing Locators**: Automatic recovery from broken selectors
- **Reporting**: Customizable HTML, Allure, and dashboard reports
- **CI/CD Integration**: GitHub Actions workflows and Docker support
- **Documentation**: Auto-generated documentation with Docusaurus
- **Salesforce Integration**: Specialized utilities for Salesforce testing
- **Mobile Testing**: Mobile browser emulation capabilities
- **Localization Testing**: Multi-language support
- **Scheduling**: Test execution scheduling and history tracking

## 2. Framework Features Explained

### 1. UI Testing

- **Path**: `/src/tests/e2e`
- **Purpose**: Automated browser-based UI testing across multiple browsers
- **🧩 Core Functions**: Page object models, component testing, form interactions
- **Integration Points**: Works with visual testing, accessibility testing
- **Useful Commands**:
  ```bash
  npm run test:e2e
  npm run test:ui -- --project=chromium
  ```

### 2. API Testing

- **Path**: `/src/utils/api`, `/src/tests/api`
- **Purpose**: Test REST and GraphQL APIs with schema validation
- **🧩 Core Functions**: Request building, response validation, authentication
- **Integration Points**: Can be combined with UI tests for end-to-end flows
- **Useful Commands**:
  ```bash
  npm run test:api
  npm run test:api:rest
  ```

### 3. Visual Testing

- **Path**: `/src/utils/visual`
- **Purpose**: Screenshot comparison and visual regression detection
- **🧩 Core Functions**: Baseline creation, visual diff generation, reporting
- **Integration Points**: Works with UI testing components
- **Useful Commands**:
  ```bash
  npm run test:visual
  npm run visual:update-baseline
  ```

### 4. Accessibility Testing

- **Path**: `/src/utils/accessibility`, `/src/tests/accessibility`
- **Purpose**: Automated accessibility audits using axe-core
- **🧩 Core Functions**: WCAG compliance checking, violation reporting
- **Integration Points**: Integrated with UI testing and reporting
- **Useful Commands**:
  ```bash
  npm run test:accessibility
  npm run accessibility:report
  ```

### 5. Self-Healing Locators

- **Path**: `/src/utils/web/SelfHealingLocator.js`
- **Purpose**: Automatically recover from broken selectors
- **🧩 Core Functions**: Alternative selector strategies, DOM proximity analysis
- **Integration Points**: Used by page objects and UI tests
- **Useful Commands**:
  ```bash
  npm run locator:heal
  npm run locator:status
  ```

### 6. Reporting

- **Path**: `/src/utils/reporting`
- **Purpose**: Generate test reports in various formats
- **🧩 Core Functions**: HTML reports, Allure integration, dashboard generation
- **Integration Points**: Used by all test types for result visualization
- **Useful Commands**:
  ```bash
  npm run report:generate
  npm run report:dashboard
  npm run report:history
  ```

### 7. Data Management

- **Path**: `/src/utils/data`, `/data`
- **Purpose**: Test data management and generation
- **🧩 Core Functions**: Data loading from multiple formats, data generation
- **Integration Points**: Used by all test types for test data
- **Useful Commands**:
  ```bash
  npm run data:generate
  npm run data:extract
  ```

### 8. CI/CD Integration

- **Path**: `/.github/workflows`
- **Purpose**: Automated test execution in CI/CD pipelines
- **🧩 Core Functions**: GitHub Actions workflows, Docker container execution
- **Integration Points**: Connects with reporting and test execution
- **Useful Commands**:
  ```bash
  npm run ci:test
  npm run docker:test
  ```

### 9. Documentation

- **Path**: `/docs`, `/docs-site`
- **Purpose**: Framework documentation and guides
- **🧩 Core Functions**: Docusaurus site, markdown documentation
- **Integration Points**: Deployed via GitHub Pages
- **Useful Commands**:
  ```bash
  npm run docs:build
  npm run docs:deploy
  ```

### 10. Salesforce Integration

- **Path**: `/src/utils/salesforce`, `/src/tests/salesforce`
- **Purpose**: Specialized utilities for Salesforce testing
- **🧩 Core Functions**: Salesforce API integration, UI automation
- **Integration Points**: Works with API and UI testing components
- **Useful Commands**:
  ```bash
  npm run test:salesforce
  npm run sf:generate-page
  ```

### 11. Mobile Testing

- **Path**: `/src/utils/mobile`
- **Purpose**: Mobile browser emulation and testing
- **🧩 Core Functions**: Device emulation, responsive testing
- **Integration Points**: Extends UI testing capabilities
- **Useful Commands**:
  ```bash
  npm run test:mobile
  npm run test:responsive
  ```

### 12. Localization Testing

- **Path**: `/src/utils/localization`, `/locales`
- **Purpose**: Multi-language testing support
- **🧩 Core Functions**: Language switching, translation validation
- **Integration Points**: Works with UI testing
- **Useful Commands**:
  ```bash
  npm run test:l10n
  npm run test:i18n
  ```

### 13. Performance Utility

- **Path**: `/src/utils/performance`
- **Purpose**: Performance metrics & Core Web Vitals (CWV) analysis
- **🧩 Core Functions**: Navigation timing, resource timing, CWV metrics
- **Integration Points**: Works with UI testing and reporting
- **Useful Commands**:
  ```bash
  npm run test:performance
  npm run performance:report
  ```

### 14. Test Scheduling

- **Path**: `/src/utils/scheduler`
- **Purpose**: Schedule test execution and track history
- **🧩 Core Functions**: Cron-based scheduling, report history
- **Integration Points**: Works with reporting and test execution
- **Useful Commands**:
  ```bash
  npm run schedule:create
  npm run schedule:list
  npm run schedule:run
  ```

## 3. Using the Framework Without Code Exposure

The framework can be used by end clients without exposing the underlying code through:

1. **CLI Interface**:

   - The framework provides a command-line interface for running tests
   - Commands are documented in the `cli-guide.md` file
   - Example: `npx playwright-framework run --suite=smoke`

2. **Configuration Files**:

   - Tests can be configured through external configuration files
   - No code changes required for test customization
   - Example: Create a `test-config.json` file with test parameters

3. **Docker Containers**:

   - Pre-built Docker images with the framework installed
   - Run tests with simple Docker commands
   - Example: `docker run playwright-framework:latest npm run test:e2e`

4. **Dashboard Interface**:
   - Web-based dashboard for test execution and reporting
   - Start the dashboard with `npm run dashboard`
   - Access at http://localhost:3000

## 4. CI/CD - GitHub Setup

The framework includes pre-configured GitHub Actions workflows:

1. **Main Workflow** (`ci.yml`):

   - Triggered on push to main branch and pull requests
   - Runs linting, unit tests, and e2e tests
   - Generates and uploads test reports

2. **Scheduled Tests** (`test-workflow.yml`):

   - Runs daily at midnight
   - Executes full test suite
   - Sends notification on failures

3. **Documentation Deployment** (`deploy-docs.yml`):

   - Builds and deploys documentation to GitHub Pages
   - Triggered on changes to documentation files

4. **Framework Validation** (`framework-validation.yml`):
   - Validates framework integrity
   - Runs self-tests to ensure framework components work correctly

To set up in a new repository:

1. Copy the `.github/workflows` directory to your repository
2. Configure secrets for authentication (if needed)
3. Adjust workflow triggers as needed

## 5. Docker Setup

The framework includes Docker support for containerized execution:

1. **Basic Usage**:

   ```bash
   docker build -t playwright-framework .
   docker run playwright-framework npm run test
   ```

2. **Docker Compose**:

   ```bash
   docker-compose up
   ```

3. **Custom Configuration**:

   - Mount volumes for test results:
     ```bash
     docker run -v $(pwd)/reports:/app/reports playwright-framework
     ```
   - Pass environment variables:
     ```bash
     docker run -e BASE_URL=https://example.com playwright-framework
     ```

4. **CI Integration**:
   - The Docker container can be used in any CI system
   - Example GitHub Actions configuration included

## 6. Helper Classes

The framework provides several helper classes to simplify test development:

1. **PlaywrightService**:

   - Browser automation utilities
   - Screenshot and PDF generation
   - Network interception

2. **ApiClient**:

   - REST and GraphQL API requests
   - Response validation
   - Authentication handling

3. **DataOrchestrator**:

   - Test data management
   - Data generation and transformation
   - Multiple format support

4. **ReportingUtils**:

   - Custom report generation
   - Test result aggregation
   - Visual report components

5. **SelfHealingLocator**:
   - Resilient element selection
   - Automatic locator healing
   - Selector strategy management

## 7. Out of the Box Features

The framework provides several ready-to-use features:

1. **Cross-Browser Testing**:

   - Chrome, Firefox, Safari, and Edge support
   - Consistent behavior across browsers
   - Parallel execution

2. **Visual Regression**:

   - Automatic screenshot comparison
   - Visual diff highlighting
   - Baseline management

3. **Accessibility Compliance**:

   - WCAG 2.1 compliance checking
   - Detailed violation reporting
   - Remediation suggestions

4. **Performance Metrics**:

   - Core Web Vitals measurement
   - Performance regression detection
   - Detailed timing analysis

5. **Comprehensive Reporting**:

   - HTML, Allure, and custom reports
   - Test history tracking
   - Failure analysis

6. **Test Data Management**:

   - CSV, JSON, YAML, and XML support
   - Data generation utilities
   - External data source integration

7. **CI/CD Integration**:
   - GitHub Actions workflows
   - Docker container support
   - Jenkins pipeline examples

## Getting Started

1. **Installation**:

   ```bash
   git clone https://github.com/your-org/playwright-framework.git
   cd playwright-framework
   npm install
   npx playwright install
   ```

2. **Running Tests**:

   ```bash
   npm run test                # Run all tests
   npm run test:e2e            # Run UI tests
   npm run test:api            # Run API tests
   npm run test:visual         # Run visual tests
   ```

3. **Viewing Reports**:

   ```bash
   npm run report:open         # Open HTML report
   npm run dashboard           # Start reporting dashboard
   ```

4. **Creating Tests**:
   - Use the test generators:
     ```bash
     npm run generate:test
     npm run generate:page
     ```
   - Follow examples in the `/examples` directory

## Additional Resources

- **Documentation**: Available in the `/docs` directory and via the documentation site
- **Examples**: Check the `/examples` directory for sample tests
- **Support**: File issues on the GitHub repository
