#!/bin/bash

# Script to run all tests in the repository
echo "Running all tests in the repository..."

# Set error handling
set -e

# Make all shell scripts in the scripts directory executable
echo "Making all shell scripts executable..."
chmod +x /workspace/scripts/*.sh
echo "All shell scripts are now executable."

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

# Step 4: Run src/tests one by one
echo "Step 4: Running src/tests one by one..."
npm run test:src-one-by-one
echo "src/tests one by one completed successfully."

echo "All tests completed successfully!"