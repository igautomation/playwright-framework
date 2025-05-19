#!/bin/bash

# Script to run end-to-end tests
echo "Running end-to-end tests..."

# Run only e2e tests
npx playwright test "src/tests/e2e/" --project=chromium