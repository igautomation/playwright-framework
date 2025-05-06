#!/bin/bash

echo "🐳 Running framework validation in Docker..."

# Build the Docker image
docker build -t playwright-framework-validation -f Dockerfile.validation .

# Run the validation
docker run --rm \
  -v "$(pwd)/reports:/app/reports" \
  -v "$(pwd)/test-results:/app/test-results" \
  playwright-framework-validation \
  bash -c "node scripts/framework-health-check.js && npx playwright test --grep @validation && node scripts/generate-validation-dashboard.js"

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ Framework validation passed!"
  exit 0
else
  echo "❌ Framework validation failed!"
  exit 1
fi