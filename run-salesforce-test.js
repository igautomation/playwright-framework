// Simple script to run Salesforce tests
const { execSync } = require('child_process');
require('dotenv').config();

// Check if auth directory exists, create if not
const fs = require('fs');
if (!fs.existsSync('./auth')) {
  fs.mkdirSync('./auth');
  console.log('Created auth directory');
}

// Check if storage state exists
const storageStatePath = './auth/salesforce-storage-state.json';
const hasStorageState = fs.existsSync(storageStatePath);

// Run global setup if storage state doesn't exist
if (!hasStorageState) {
  console.log('No storage state found, running global setup...');
  try {
    execSync('node src/tests/salesforce/global-setup.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to run global setup. Please check your Salesforce credentials.');
    process.exit(1);
  }
}

// Run the test
console.log('Running Salesforce test...');
try {
  execSync('npx playwright test src/tests/salesforce/salesforce.spec.js --headed', { stdio: 'inherit' });
} catch (error) {
  console.error('Test execution failed.');
  process.exit(1);
}