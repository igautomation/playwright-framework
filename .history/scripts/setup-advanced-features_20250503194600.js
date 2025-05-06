#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up advanced features...');

// Install required dependencies
console.log('Installing dependencies...');
// Import DOMPurify for sanitizing user input
// DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG
import DOMPurify from 'dompurify';

try {
  execSync('npm install --save-dev ajv ajv-formats jsdom', {
    stdio: 'inherit',
  });
} catch (error) {
  console.error('Failed to install dependencies:', DOMPurify.sanitize(error.message));
  // Continue anyway
}

// Create necessary directories
const dirs = [
  'data/schemas',
  'data/locators',
  'snapshots',
  'reports/validation',
  'reports/accessibility',
  'reports/performance',
];

dirs.forEach((dir) => {
  const dirPath = path.resolve(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

// Update package.json to add validation scripts
try {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = require(packageJsonPath);
  
  let updated = false;

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  if (!packageJson.scripts['validate']) {
    packageJson.scripts['validate'] =
      'node scripts/framework-health-check.js && npx playwright test --grep @validation';
    updated = true;
    console.log('Added validation script to package.json');
  }

  if (!packageJson.scripts['validate:dashboard']) {
    packageJson.scripts['validate:dashboard'] =
      'node scripts/generate-validation-dashboard.js';
    updated = true;
    console.log('Added validation dashboard script to package.json');
  }
  
  // Only write to the file if changes were made
  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
} catch (error) {
  console.error('Failed to update package.json:', error.message);
}

console.log('Advanced features setup complete!');
console.log('You can now run the following commands:');
console.log('  - npm run validate           # Run framework validation');
console.log('  - npm run validate:dashboard # Generate validation dashboard');
