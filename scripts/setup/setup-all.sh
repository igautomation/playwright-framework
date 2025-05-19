#!/bin/bash

# Script to set up all features of the framework

echo "Setting up all features of the Playwright Framework..."

# Make sure all scripts are executable
chmod +x scripts/*.js scripts/*.sh

# Set up accessibility testing
echo "Setting up accessibility testing..."
node scripts/setup-accessibility.js

# Set up performance testing
echo "Setting up performance testing..."
node scripts/setup-performance.js

# Update GitHub workflow
echo "Updating GitHub workflow..."
node scripts/update-github-workflow.js

# Generate PDF guide
echo "Generating PDF guide..."
node scripts/generate-pdf-guide.js

echo "All features have been set up successfully!"
echo "You can now run the following commands:"
echo "  - npm test                  # Run all tests"
echo "  - npm run test:smoke        # Run smoke tests"
echo "  - npm run test:api          # Run API tests"
echo "  - npm run test:visual       # Run visual tests"
echo "  - npm run test:accessibility # Run accessibility tests"
echo "  - npm run test:performance  # Run performance tests"
echo "  - npm run docs              # Start documentation site"
echo "  - npm run docs:build        # Build documentation site"
echo "  - npm run docs:deploy       # Deploy documentation site"