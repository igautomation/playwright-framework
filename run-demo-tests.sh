#!/bin/bash

# Make the script executable
chmod +x "$0"

echo "Running all demo tests..."
npx playwright test src/tests/demo/