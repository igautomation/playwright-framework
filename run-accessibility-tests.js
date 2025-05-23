const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Get the accessibility test files
const accessibilityDir = path.join(__dirname, 'src/tests/accessibility');
const testFiles = fs.readdirSync(accessibilityDir)
  .filter(file => file.endsWith('.spec.js'))
  .map(file => path.join(accessibilityDir, file));

console.log('Found test files:', testFiles);

// Run the tests
async function runTests() {
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Load the test files
    for (const file of testFiles) {
      console.log(`Running tests in ${file}`);
      const testModule = require(file);
      
      // Execute the tests
      if (typeof testModule === 'function') {
        await testModule(page);
      }
    }
    
    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    await browser.close();
  }
}

runTests();
