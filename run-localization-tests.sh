#!/bin/bash

# Make the script executable
chmod +x "$0"

echo "Running localization tests..."
npx playwright test src/tests/localization/localizationTest.spec.js --project=chromium