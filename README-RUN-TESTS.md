# Running Tests

This document provides instructions on how to run tests in this repository.

## Running All Tests

To run all tests in the repository, use the following command:

```bash
npm run test:all
```

This will run:
1. Jest unit tests
2. Playwright tests
3. Framework validation tests

If you want to generate a test report after running all tests, use:

```bash
npm run test:all:report
```

## Running Tests One by One

To run all tests one by one (individually), use the following command:

```bash
npm run test:one-by-one
```

This will:
1. Find all Jest unit tests (*.test.js files in the tests directory)
2. Find all Playwright tests (*.spec.js files in the src/tests directory)
3. Run each test file individually
4. Report the results of each test
5. Provide a summary of all test results

Alternatively, you can use the shell script version:

```bash
npm run test:one-by-one:sh
```

For more details on running tests one by one, see [README-ONE-BY-ONE-TESTS.md](README-ONE-BY-ONE-TESTS.md).

## Running Specific Tests

### Jest Unit Tests

To run only the Jest unit tests:

```bash
npm run test:unit
```

### Playwright Tests

To run only the Playwright tests:

```bash
npm run test
```

To run Playwright tests in headed mode:

```bash
npm run test:headed
```

To run Playwright tests in debug mode:

```bash
npm run test:debug
```

To run Playwright tests with UI:

```bash
npm run test:ui
```

### Framework Validation

To run only the framework validation tests:

```bash
npm run validate:framework
```

## Test Verification

To verify all tests:

```bash
npm run verify:all-tests
```

To verify tests and generate a report:

```bash
npm run test:verify
```

## Making the Run All Tests Script Executable

Before running the `test:all` or `test:all:report` commands, make sure the script is executable:

```bash
chmod +x scripts/run-all-tests.sh
```

Similarly, for the run-tests-one-by-one script:

```bash
chmod +x scripts/run-tests-one-by-one.sh
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