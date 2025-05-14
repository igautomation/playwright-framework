#!/bin/bash

# Make the script executable
chmod +x "$0"

echo "Running combined tests..."
npx playwright test src/tests/combined/

echo "Tests completed!"