// Simple script to run the simplest Salesforce test
const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Environment loaded. Using Salesforce URL:', process.env.SF_LOGIN_URL);

// Check if auth directory exists, create if not
const fs = require('fs');
const authDir = path.join(__dirname, 'auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir);
  console.log('Created auth directory');
}

// Check if storage state exists
const storageStatePath = path.join(authDir, 'salesforce-storage-state.json');
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

// Run the simple test
console.log('Running simple Salesforce test...');
try {
  execSync('npx playwright test src/tests/salesforce/simple-salesforce.spec.js --headed', { stdio: 'inherit' });
} catch (error) {
  console.error('Test execution failed.');
  process.exit(1);
}