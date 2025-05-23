/**
 * Setup script for the Playwright Framework
 * 
 * This script:
 * 1. Creates necessary directories
 * 2. Sets up environment variables
 * 3. Installs git hooks
 * 4. Validates the installation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define required directories
const requiredDirs = [
  'reports',
  'reports/html',
  'reports/screenshots',
  'reports/logs',
  'reports/test-results',
  'allure-results',
  'visual-baselines',
  'visual-diffs',
  'src/config',
  'src/pages',
  'src/tests',
  'src/utils',
  'src/fixtures',
  'src/data',
];

// Create required directories
console.log('Creating required directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '../../', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Check if .env file exists, if not create it from .env.example
console.log('Checking environment variables...');
const envPath = path.join(__dirname, '../../.env');
const envExamplePath = path.join(__dirname, '../../.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('Created .env file from .env.example');
}

// Setup git hooks
console.log('Setting up git hooks...');
try {
  execSync('npm run setup:hooks', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to setup git hooks:', error.message);
}

// Validate installation
console.log('Validating installation...');
try {
  // Check if Playwright is installed
  execSync('npx playwright --version', { stdio: 'inherit' });
  
  // Check if browsers are installed
  const result = execSync('npx playwright install --dry-run').toString();
  if (result.includes('already installed')) {
    console.log('Playwright browsers are already installed.');
  } else {
    console.log('Installing Playwright browsers...');
    execSync('npx playwright install', { stdio: 'inherit' });
  }
  
  console.log('Installation validated successfully!');
} catch (error) {
  console.error('Validation failed:', error.message);
  console.log('Please run: npx playwright install');
}

console.log('Setup complete!');
console.log('You can now run tests with: npm test');