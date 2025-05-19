#!/bin/bash

# Make the script executable
chmod +x $(dirname "$0")/*.sh

# Run only API tests
echo "Running API tests..."
npx playwright test "src/tests/api/**/*.spec.js" --project=api