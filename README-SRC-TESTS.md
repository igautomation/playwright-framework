# Running src/tests One by One

This document explains how to run all tests under the `src/tests` directory one by one.

## Overview

The framework provides scripts to run all tests in the `src/tests` directory individually. This is useful for:

1. Identifying flaky tests
2. Isolating test failures
3. Debugging specific test issues
4. Verifying test independence

## Available Commands

### Using npm scripts

```bash
# Run all src/tests one by one using JavaScript
npm run test:src-one-by-one

# Run all src/tests one by one using shell script
npm run test:src-one-by-one:sh
```

### Direct script execution

```bash
# Using Node.js
node scripts/run-src-tests-one-by-one.js

# Using Bash
bash scripts/run-src-tests-one-by-one.sh
```

## How It Works

The scripts perform the following steps:

1. Find all test files in the `src/tests` directory with the `.spec.js` extension
2. Run each test file individually using Playwright
3. Track the results (pass/fail) for each test
4. Display a summary of the results at the end

## Example Output

```
=== Running All src/tests Tests One By One ===
Finding all test files in src/tests...
Found 10 Playwright tests in src/tests

=== Running src/tests Playwright Tests ===
Running Playwright test: src/tests/example.spec.js
✓ Test passed: src/tests/example.spec.js

Running Playwright test: src/tests/framework-validation.spec.js
✓ Test passed: src/tests/framework-validation.spec.js

Running Playwright test: src/tests/combined-test-suite.spec.js
✓ Test passed: src/tests/combined-test-suite.spec.js

...

=== Test Summary ===
Playwright Tests: 9/10 passed, 1 failed
```

## Customizing the Scripts

You can modify the scripts to add additional functionality:

- Change the test file pattern
- Add specific test filters
- Modify the reporting format
- Add retry logic for failed tests
- Generate detailed reports

## Troubleshooting

If you encounter issues running the scripts:

1. Make sure the scripts are executable:
   ```bash
   chmod +x scripts/run-src-tests-one-by-one.sh
   ```

2. Verify that Playwright is installed:
   ```bash
   npx playwright --version
   ```

3. Check that test files exist in the `src/tests` directory:
   ```bash
   find src/tests -name "*.spec.js"
   ```

4. If a specific test is failing, try running it directly:
   ```bash
   npx playwright test src/tests/failing-test.spec.js --debug
   ```

## Related Documentation

- [HOW-TO-RUN-TESTS.md](HOW-TO-RUN-TESTS.md) - General test running instructions
- [README-ONE-BY-ONE-TESTS.md](README-ONE-BY-ONE-TESTS.md) - Running all tests one by one