#!/bin/bash

# Deploy the Playwright Framework documentation to GitHub Pages

echo "Deploying Playwright Framework documentation..."

# Navigate to the Docusaurus directory
cd docs/docusaurus

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the site
echo "Building the documentation site..."
npm run build

# Create assets directory if it doesn't exist
mkdir -p build/assets

# Copy any missing assets
if [ -d "../../assets" ]; then
  echo "Copying assets..."
  cp -r ../../assets/* build/assets/
fi

# Deploy to GitHub Pages
echo "Deploying to GitHub Pages..."
GIT_USER=$(git config user.name) \
  CURRENT_BRANCH=main \
  USE_SSH=true \
  npm run deploy

echo "Documentation deployed successfully!"
echo "Visit https://your-org.github.io/playwright-framework/ to view the documentation."
