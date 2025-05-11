#!/bin/bash

# Build the Docusaurus documentation site

echo "Building Playwright Framework documentation..."

# Navigate to the Docusaurus directory
cd docs/docusaurus

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the site
echo "Building the site..."
npm run build

# Create assets directory if it doesn't exist
mkdir -p build/assets

# Copy any missing assets
if [ -d "../../assets" ]; then
  echo "Copying assets..."
  cp -r ../../assets/* build/assets/
fi

echo "Documentation built successfully!"
echo "To view the documentation, run: npm run serve"

