#!/bin/bash

# Script to run localization tests
echo "Running localization tests..."

# Run only localization tests
npx playwright test "src/tests/localization/" --project=chromium