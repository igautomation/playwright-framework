#!/bin/bash

# Script to run performance tests
echo "Running performance tests..."

# Run only performance tests
npx playwright test "src/tests/performance/" --project=chromium