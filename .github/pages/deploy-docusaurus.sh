#!/bin/bash
# .github/pages/deploy-docusaurus.sh

# Navigate to the Docusaurus directory
cd docs/docusaurus

# Install dependencies
npm install

# Build the Docusaurus site
npm run build

# Deploy to GitHub Pages
# Assumes the build output is in docs/docusaurus/build
npx docusaurus deploy --out-dir build --skip-build