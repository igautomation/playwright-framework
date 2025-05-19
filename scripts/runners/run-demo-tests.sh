#!/bin/bash

# Script to run demo tests
echo "Running demo tests..."

# Run only demo tests
npx playwright test "src/tests/demo/" --project=chromium