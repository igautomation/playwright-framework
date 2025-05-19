#!/bin/bash

# Script to run demo verification tests
echo "Running demo verification tests..."

# Run only demo-verify tests
npx playwright test "src/tests/demo-verify/" --project=chromium