/**
 * Global setup for Playwright tests
 */
const fs = require('fs');
const path = require('path');

async function globalSetup() {
  console.log('Running global setup...');
  
  // Create necessary directories
  const directories = [
    './reports/test-results',
    './reports/html',
    './allure-results',
    './visual-baselines',
    './visual-diffs'
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      console.log(`Created directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  console.log('Global setup complete');
}

module.exports = globalSetup;