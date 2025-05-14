# How to Run Tests in This Repository

This document provides detailed instructions on how to run tests in this repository.

## Prerequisites

Before running the tests, make sure you have the following installed:

1. Node.js (version 14 or higher)
2. npm (usually comes with Node.js)

## Installation

1. Clone the repository (if you haven't already)
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

### Option 1: Using the run-all-tests-now.sh Script

The simplest way to run all tests is to use the provided shell script:

1. Make the script executable:

```bash
chmod +x run-all-tests-now.sh
```

2. Run the script:

```bash
./run-all-tests-now.sh
```

This script will:
- Make all shell scripts in the scripts directory executable
- Run Jest unit tests
- Run Playwright tests
- Run framework validation tests

### Option 2: Using the run-tests.sh Script

To run only the Playwright tests:

1. Make the script executable:

```bash
chmod +x run-tests.sh
```

2. Run the script:

```bash
./run-tests.sh
```

This script will:
- Make all shell scripts in the scripts directory executable
- Run the tests using `npm test`

### Option 3: Using npm Scripts

You can also run the tests using npm scripts defined in package.json:

#### Run All Tests

To run all tests in the repository:

```bash
npm run test:all
```

This will run:
1. Jest unit tests
2. Playwright tests
3. Framework validation tests

If you want to generate a test report after running all tests:

```bash
npm run test:all:report
```

#### Run Only Playwright Tests

To run only the Playwright tests:

```bash
npm test
```

or

```bash
npm run test
```

#### Run Tests in Headed Mode

To run Playwright tests in headed mode (with browser UI visible):

```bash
npm run test:headed
```

#### Run Tests in Debug Mode

To run Playwright tests in debug mode:

```bash
npm run test:debug
```

#### Run Tests with UI

To run Playwright tests with the Playwright UI:

```bash
npm run test:ui
```

#### Run Tests One by One

To run all tests one by one (individually):

```bash
npm run test:one-by-one
```

Alternatively, you can use the shell script version:

```bash
npm run test:one-by-one:sh
```

#### Run src/tests One by One

To run all tests in the src/tests directory one by one:

```bash
npm run test:src-one-by-one
```

Alternatively, you can use the shell script version:

```bash
npm run test:src-one-by-one:sh
```

#### Run Only Unit Tests

To run only the Jest unit tests:

```bash
npm run test:unit
```

### Option 4: Using Node.js

You can also run the tests using Node.js directly:

```bash
node run-tests.js
```

This script will:
- Make all shell scripts in the scripts directory executable
- Run the tests using `npm test`

### Option 5: Using the Playwright CLI

You can use the Playwright CLI directly for more control:

#### Run All Tests

```bash
npx playwright test
```

#### Run a Specific Test File

```bash
npx playwright test path/to/test.spec.js
```

#### Run Tests with a Specific Tag

```bash
npx playwright test --grep @smoke
```

#### Run Tests in a Specific Project

```bash
npx playwright test --project=chromium
```

#### List All Available Tests

```bash
npx playwright test --list
```

#### Run Tests in Parallel

```bash
npx playwright test --workers=4
```

#### Run Tests with a Specific Reporter

```bash
npx playwright test --reporter=html
```

## Test Reports

To generate test reports:

```bash
npm run report
```

## Test Coverage

To analyze test coverage:

```bash
npm run coverage
```

## Dashboard

To generate a test quality dashboard:

```bash
npm run dashboard
```

## Troubleshooting

If you encounter any issues running the tests, try the following:

1. Make sure all dependencies are installed:

```bash
npm install
```

2. Make sure Playwright browsers are installed:

```bash
npx playwright install
```

3. Make sure all shell scripts are executable:

```bash
chmod +x scripts/*.sh
chmod +x run-tests.sh
chmod +x run-all-tests-now.sh
```

4. Check for any error messages in the console output

5. Try running a specific test file to isolate the issue:

```bash
npx playwright test src/tests/example.spec.js
```

6. Run tests in debug mode for more detailed output:

```bash
npm run test:debug
```

7. Check the Playwright configuration in playwright.config.js

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [README-RUN-TESTS.md](README-RUN-TESTS.md) - Additional information on running tests
- [README-ONE-BY-ONE-TESTS.md](README-ONE-BY-ONE-TESTS.md) - Information on running tests one by one
- [README-SRC-TESTS.md](README-SRC-TESTS.md) - Information on running src/tests one by one