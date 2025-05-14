#!/bin/bash

# Script to run all performance tests and report results

echo "Running all performance tests..."

# Create directories for reports if they don't exist
mkdir -p ./reports/performance
mkdir -p ./traces

# Run tests with @performance tag
npx playwright test --grep="@performance" --reporter=list,html

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "All performance tests passed!"
  exit 0
else
  echo "Some performance tests failed. Check the HTML report for details."
  exit 1
fi