#!/bin/bash

# Make the script executable
chmod +x "$0"

echo "Running all demo-verify tests..."
npx playwright test src/tests/demo-verify/ --reporter=list

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "All demo-verify tests passed successfully!"
  exit 0
else
  echo "Some demo-verify tests failed. Please check the output above for details."
  exit 1
fi