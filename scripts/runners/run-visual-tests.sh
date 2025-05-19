#!/bin/bash

# Script to run visual regression tests
echo "Running visual regression tests..."

# Run only visual tests
npx playwright test "src/tests/visual/" --project=chromium