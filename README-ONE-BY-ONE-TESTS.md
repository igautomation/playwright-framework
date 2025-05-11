# Running Tests One by One

This document provides instructions on how to run tests one by one in this repository.

## Overview

The repository now includes scripts that allow you to run each test file individually. This is useful for:

- Debugging specific test failures
- Isolating test issues
- Understanding test dependencies
- Verifying test stability

## Available Commands

Two methods are provided to run tests one by one:

### Using Node.js Script

```bash
npm run test:one-by-one
```

This command uses a Node.js script to find and run all test files individually.

### Using Shell Script

```bash
npm run test:one-by-one:sh
```

This command uses a shell script to find and run all test files individually.

## Making the Shell Script Executable

If you want to run the shell script directly (without npm), make it executable first:

```bash
chmod +x scripts/run-tests-one-by-one.sh
```

Then you can run it directly:

```bash
./scripts/run-tests-one-by-one.sh
```

## Test Output

The scripts will:

1. Find all Jest unit tests (*.test.js files in the tests directory)
2. Find all Playwright tests (*.spec.js files in the src/tests directory)
3. Run each test file individually
4. Report the results of each test
5. Provide a summary of all test results

## Example Output

```
=== Running All Tests One By One ===
Finding all test files...
Found 5 Jest tests and 30 Playwright tests

=== Running Jest Tests ===
Running Jest test: tests/github-actions-update.test.js
✓ Test passed: tests/github-actions-update.test.js

Running Jest test: tests/run-all-tests.test.js
✓ Test passed: tests/run-all-tests.test.js

...

=== Running Playwright Tests ===
Running Playwright test: src/tests/api/reqres-api.spec.js
✓ Test passed: src/tests/api/reqres-api.spec.js

...

=== Test Summary ===
Jest Tests: 5/5 passed, 0 failed
Playwright Tests: 28/30 passed, 2 failed
Total: 33/35 passed, 2 failed
```

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed (`npm install`)
2. Verify that the test files exist in the expected locations
3. Check that the scripts have the necessary permissions
4. Review any error messages for specific test failures