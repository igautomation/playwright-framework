#!/bin/bash

# Script to run all tests in the repository
echo "Running all tests in the repository..."

# Set error handling
set -e

# Step 1: Run Jest unit tests
echo "Step 1: Running Jest unit tests..."
npm run test:unit
echo "Jest unit tests completed successfully."

# Step 2: Run Playwright tests
echo "Step 2: Running Playwright tests..."
npm run test
echo "Playwright tests completed successfully."

# Step 3: Run framework validation
echo "Step 3: Running framework validation..."
npm run validate:framework
echo "Framework validation completed successfully."

# Step 4: Generate test report (optional)
if [ "$1" == "--generate-report" ]; then
  echo "Generating test report..."
  npm run report
  echo "Test report generated successfully."
fi

echo "All tests completed successfully!"