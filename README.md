# Playwright Framework

Enterprise-grade test automation framework built with Playwright.

## Quick Start

To verify that the test framework is working correctly, run:

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run the verification test
npm run verify:framework
```

### Docker Verification

To verify that Docker is working correctly with this framework, run:

```bash
# Make the Docker verification script executable
chmod +x run-docker-verify.sh

# Run the Docker verification
./run-docker-verify.sh
```

This will:
1. Check if Docker is installed and running
2. Build the Docker image
3. Run verification tests in Docker
4. Report the results

For more detailed instructions on verifying the test framework, see [README-VERIFICATION.md](README-VERIFICATION.md).

## Running Tests

To run the tests in this repository, see [HOW-TO-RUN-TESTS.md](HOW-TO-RUN-TESTS.md) for comprehensive instructions.

For running UI tests specifically, see [README-UI-TESTS.md](README-UI-TESTS.md) for detailed instructions on running and fixing UI tests.

For Docker-related instructions and verification, see [README-DOCKER.md](README-DOCKER.md) for detailed information on using Docker with this framework.

## Features

- Comprehensive CLI for test execution and management
- Advanced test verification and validation
- Test coverage analysis without instrumentation
- Test linting with best practices enforcement
- Multiple report formats (HTML, JSON, Markdown)
- CI/CD integration (GitHub Actions, Jenkins, GitLab)
- Docker support for containerized test execution
- Test quality dashboard with historical trends
- Self-healing locators
- Visual testing capabilities
- API testing support
- Performance testing utilities
- Accessibility testing

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Install specific browsers if needed
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Verify browser installations
node scripts/verify-browsers.js

# Run framework health check
node scripts/framework-health-check.js
```

## Available Commands

### Test Execution

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui

# Run specific test file
npx playwright test path/to/test.spec.js

# Run tests with specific tag
npx playwright test --grep @smoke

# Run tests in specific project
npx playwright test --project=chromium

# List all available tests
npx playwright test --list

# Run tests in parallel
npx playwright test --workers=4

# Run tests with specific reporter
npx playwright test --reporter=html

# List all available tests without running them
npx playwright test --list

# List tests with specific project
npx playwright test --list --project=chromium

# List tests with specific tag
npx playwright test --list --grep=@smoke

# List tests using npm script
npm run test:list

# List tests using CLI command
npx playwright-framework list-tests

# List tests using CLI command with project filter
npx playwright-framework list-tests --project=chromium

# List tests using CLI command with tag filter
npx playwright-framework list-tests --tags=@smoke

# List tests using shell script
./list-tests.sh

# List tests using shell script with project filter
./list-tests.sh --project=chromium

# List tests using shell script with tag filter
./list-tests.sh --tags=@smoke

# Run tests with specific configuration
npx playwright test --config=custom-config.js

# Run tests with specific environment variables
BASE_URL=https://example.com npx playwright test

# Run tests with specific timeout
npx playwright test --timeout=60000

# Run tests with retries
npx playwright test --retries=3

# Run tests with specific shard
npx playwright test --shard=1/3

# Run all tests one by one
npm run test:one-by-one

# Run all tests one by one using shell script
npm run test:one-by-one:sh

# Run all src/tests one by one
npm run test:src-one-by-one

# Run all src/tests one by one using shell script
npm run test:src-one-by-one:sh
```

### Test Verification

```bash
# Verify test files for best practices
npm run verify
# or with options
npx playwright-framework verify-tests --dir src/tests --pattern "**/*.spec.js"

# Lint test files
npm run lint
# or with options
npx playwright-framework test-lint --dir src/tests --pattern "**/*.spec.js"

# Lint test files and fix issues automatically
npm run lint:fix
# or with options
npx playwright-framework test-lint --dir src/tests --pattern "**/*.spec.js" --fix

# Analyze test coverage
npm run coverage
# or with options
npx playwright-framework test-coverage-analyze --test-dir src/tests --source-dir src --threshold 80 --open

# Generate test reports
npm run report
# or with options
npx playwright-framework test-report --output-dir reports --types html,json,markdown --open

# Generate test quality dashboard
npm run dashboard
# or with options
npx playwright-framework test-dashboard --add-run --open

# Set up CI/CD integration
npm run ci:setup
# or with options
npx playwright-framework ci-setup --system github --name "Playwright Tests"

# Run framework self-test
npm run self-test
```

### CLI Help Commands

```bash
# Show main help
npx playwright-framework --help

# Show help for specific command
npx playwright-framework verify-tests --help
npx playwright-framework test-lint --help
npx playwright-framework test-report --help
npx playwright-framework test-coverage-analyze --help
npx playwright-framework ci-setup --help
npx playwright-framework test-dashboard --help
```

## Test Verification Options

### Verify Tests

```bash
npx playwright-framework verify-tests [options]

Options:
  -d, --dir <directory>    Test directory to verify
  -p, --pattern <pattern>  File pattern to match
  --ignore-errors          Continue even if errors are found
```

### Test Lint

```bash
npx playwright-framework test-lint [options]

Options:
  -d, --dir <directory>    Test directory to lint
  -p, --pattern <pattern>  File pattern to match
  --fix                    Automatically fix issues when possible
  --ignore-errors          Continue even if errors are found
```

### Test Report

```bash
npx playwright-framework test-report [options]

Options:
  -o, --output-dir <directory>   Output directory for reports
  -t, --types <types>            Report types to generate (comma-separated)
  -r, --results-dir <directory>  Test results directory
  --open                         Open reports after generation
  -v, --verbose                  Show verbose output
```

### Test Coverage Analysis

```bash
npx playwright-framework test-coverage-analyze [options]

Options:
  --test-dir <directory>        Test directory
  --source-dir <directory>      Source directory to analyze
  -o, --output-dir <directory>  Output directory for coverage reports
  -t, --threshold <percentage>  Coverage threshold percentage
  --exclude <patterns>          Comma-separated patterns to exclude
  --ignore-threshold            Continue even if coverage is below threshold
  --open                        Open coverage report after generation
```

### CI Setup

```bash
npx playwright-framework ci-setup [options]

Options:
  -s, --system <system>         CI system (github, jenkins, gitlab)
  -n, --name <name>             Workflow/pipeline name
  -b, --branches <branches>     Comma-separated list of branches to trigger on
  --node-version <version>      Node.js version
  --test-command <command>      Test command
  --report-command <command>    Report command
```

### Test Dashboard

```bash
npx playwright-framework test-dashboard [options]

Options:
  -d, --data-dir <directory>     Dashboard data directory
  -o, --output <path>            Output file path
  --add-run                      Add current test run to dashboard
  -r, --results-dir <directory>  Test results directory
  --run-id <id>                  Run ID
  --history-size <size>          Number of runs to keep in history
  --open                         Open dashboard after generation
```

## Environment Variables

The framework supports the following environment variables:

```
# URLs
BASE_URL=https://example.com
API_URL=https://api.example.com

# Authentication
USERNAME=testuser
PASSWORD=testpass
API_KEY=your-api-key
AUTH_TOKEN=your-auth-token

# Timeouts (in milliseconds)
DEFAULT_TIMEOUT=30000
SHORT_TIMEOUT=5000
LONG_TIMEOUT=60000
PAGE_LOAD_TIMEOUT=30000
ANIMATION_TIMEOUT=1000

# Test Data
TEST_DATA_PATH=src/data

# Visual Testing
VISUAL_BASELINE_DIR=visual-baselines
VISUAL_DIFF_DIR=visual-diffs
VISUAL_THRESHOLD=0.1

# Browser Configuration
HEADLESS=true
SLOW_MO=0
DEFAULT_BROWSER=chromium

# Reporting
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
ALLURE_RESULTS_DIR=allure-results

# Feature Flags
SELF_HEALING=true
RETRY_ON_FAILURE=true
PARALLEL_EXECUTION=true
```

## Sample Applications

This framework includes tests for the following sample applications:

### API Testing Sample

[Reqres.in](https://reqres.in/) - A hosted REST API service that provides realistic responses for testing.

Features used in our tests:
- GET /users - List users
- GET /users/{id} - Get a single user
- POST /users - Create a user
- PUT /users/{id} - Update a user
- PATCH /users/{id} - Partially update a user
- DELETE /users/{id} - Delete a user
- POST /register - Register a user
- POST /login - Login a user

### UI Testing Sample

[OrangeHRM Demo](https://opensource-demo.orangehrmlive.com/web/index.php/auth/login) - An open-source HR management system demo.

Default credentials:
- Username: Admin
- Password: admin123

Features used in our tests:
- Login functionality
- Dashboard navigation
- Admin page access
- Forgot password flow
- Error handling

## Writing Tests

### Basic Test Structure

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature: Example Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code before each test
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  });

  test('should perform an action', async ({ page }) => {
    // Test code
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.oxd-topbar-header')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Teardown code after each test
  });
});
```

### Using Page Objects

```javascript
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/orangehrm/LoginPage');
const { DashboardPage } = require('../pages/orangehrm/DashboardPage');

test.describe('OrangeHRM Authentication', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test('should login successfully', async () => {
    await loginPage.login('Admin', 'admin123');
    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
  });
});
```

### API Testing

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Reqres.in API Tests', () => {
  test('should create a user', async ({ request }) => {
    const userData = {
      name: 'John Doe',
      job: 'QA Engineer'
    };
    
    const response = await request.post('https://reqres.in/api/users', {
      data: userData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    expect(response.status()).toBe(201);
    
    const body = await response.json();
    expect(body.name).toBe(userData.name);
    expect(body.job).toBe(userData.job);
  });
});
```

### Combined API and UI Testing

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Combined API and UI Tests', () => {
  test('should get users from API and login to OrangeHRM', async ({ page, request }) => {
    // 1. Get users from reqres.in API
    const response = await request.get('https://reqres.in/api/users?page=1');
    const apiResponse = await response.json();
    
    // 2. Verify API response
    expect(apiResponse.page).toBe(1);
    expect(apiResponse.data.length).toBeGreaterThan(0);
    
    // 3. Navigate to OrangeHRM and login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 4. Verify successful login
    await expect(page.locator('.oxd-topbar-header')).toBeVisible();
  });
});
```

### Visual Testing

```javascript
const { test } = require('@playwright/test');
const { VisualComparisonUtils } = require('../utils/visual/visualComparisonUtils');

test.describe('Visual Tests', () => {
  let visualUtils;

  test.beforeEach(async ({ page }) => {
    visualUtils = new VisualComparisonUtils(page);
    await page.goto('https://example.com');
  });

  test('homepage should match baseline', async ({ page }) => {
    await visualUtils.compareScreenshot('homepage');
  });

  test('component should match baseline', async ({ page }) => {
    await visualUtils.compareElement('.header', 'header-component');
  });
});
```

## Best Practices

### Test Organization

- Group tests by feature or functionality
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated
- Use beforeEach/afterEach for setup and teardown
- Use tags to categorize tests (@smoke, @regression, etc.)

### Test Data Management

- Use test data factories for generating dynamic data
- Store static test data in separate files (JSON, YAML, CSV)
- Avoid hardcoding test data in test files
- Clean up test data after tests when necessary
- Use unique identifiers for test data to avoid conflicts

### Error Handling

- Use try/catch blocks for expected errors
- Add proper assertions for error scenarios
- Use custom error handlers for better error messages
- Log relevant information for debugging

### Performance Considerations

- Minimize browser instances by reusing contexts
- Use request interception to mock network requests when appropriate
- Parallelize tests when possible
- Use proper timeouts and avoid fixed waits

## Troubleshooting

### Common Issues

1. **Browser not installed**
   ```bash
   npx playwright install
   ```

2. **Missing dependencies**
   ```bash
   npm install --save fast-xml-parser node-fetch @faker-js/faker exceljs js-yaml pixelmatch pngjs
   ```

3. **Test discovery issues**
   - Ensure test files end with `.spec.js`
   - Check that test files are in the correct directory
   - Verify that test files import the Playwright test library

4. **Test execution issues**
   - Check for proper setup in beforeEach/beforeAll hooks
   - Verify that selectors are correct and unique
   - Increase timeouts for slow operations
   - Use debug mode to step through tests

5. **Visual testing issues**
   - Ensure baseline images exist
   - Check threshold values for comparison
   - Verify that screenshots are taken in consistent environments

### Debugging Tips

- Use `test.debug()` to pause test execution
- Use `page.pause()` to open the inspector
- Add `await page.screenshot({ path: 'debug.png' })` for visual debugging
- Use `console.log()` with `--debug` flag for detailed logs
- Check test videos and screenshots in the test results directory

## Project Structure

```
playwright-framework/
├── src/
│   ├── cli/            # CLI commands
│   │   ├── commands/   # Command implementations
│   │   └── index.js    # CLI entry point
│   ├── config/         # Configuration files
│   │   ├── env/        # Environment-specific configs
│   │   └── playwright.config.js # Main config
│   ├── data/           # Test data
│   │   ├── csv/        # CSV test data
│   │   ├── json/       # JSON test data
│   │   └── yaml/       # YAML test data
│   ├── pages/          # Page objects
│   │   ├── components/ # Reusable page components
│   │   └── locators/   # Page locators
│   ├── tests/          # Test files
│   │   ├── api/        # API tests
│   │   ├── e2e/        # End-to-end tests
│   │   ├── ui/         # UI tests
│   │   └── visual/     # Visual tests
│   └── utils/          # Utility functions
│       ├── ci/         # CI/CD integration utilities
│       ├── common/     # Common utilities
│       ├── reporting/  # Reporting utilities
│       └── web/        # Web testing utilities
├── reports/            # Test reports
│   ├── html/           # HTML reports
│   ├── allure/         # Allure reports
│   └── dashboard/      # Dashboard reports
├── scripts/            # Helper scripts
├── playwright.config.js # Playwright configuration
└── package.json
```

## Dependencies

The framework requires the following dependencies:

```bash
# Core dependencies
npm install --save @playwright/test playwright

# Test verification dependencies
npm install --save @babel/parser @babel/traverse glob eslint eslint-plugin-jest eslint-plugin-playwright

# Data handling dependencies
npm install --save fast-xml-parser node-fetch @faker-js/faker exceljs js-yaml

# Visual testing dependencies
npm install --save pixelmatch pngjs

# Reporting dependencies
npm install --save allure-playwright

# CLI dependencies
npm install --save commander dotenv-safe
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT