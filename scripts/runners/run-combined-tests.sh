#!/bin/bash

# Script to run combined API and UI tests
echo "Running combined API and UI tests..."

# Run combined tests
npx playwright test "src/tests/combined/" --project=chromium