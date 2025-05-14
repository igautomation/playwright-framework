# Demo-Verify Tests

This document provides instructions for running the demo-verify tests.

## What are Demo-Verify Tests?

The demo-verify tests are simple tests that verify basic functionality of the test framework. They are designed to be fast and reliable, making them ideal for quick verification of the test environment.

## Running Demo-Verify Tests

You can run the demo-verify tests using the following command:

```bash
npm run test:demo-verify
```

Or directly with:

```bash
bash run-demo-verify-tests.sh
```

## Test Implementation

The demo-verify tests use a mock HTML content instead of accessing external websites. This ensures that the tests are reliable and don't depend on external resources or network connectivity.

## Modifying Tests

If you need to modify the tests, you can find them in the `src/tests/demo-verify` directory.