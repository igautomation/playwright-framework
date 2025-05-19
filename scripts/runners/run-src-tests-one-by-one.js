#!/usr/bin/env node

/**
 * Script to run all tests under src/tests directory one by one
 * This script will find all test files in src/tests and run them individually
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to find all test files in src/tests
function findSrcTestFiles() {
  console.log('Finding all test files in src/tests...');
  
  // Find Playwright tests in src/tests
  const playwrightTestsOutput = execSync('find src/tests -name "*.spec.js"').toString().trim();
  const playwrightTests = playwrightTestsOutput ? playwrightTestsOutput.split('\n') : [];
  
  return playwrightTests;
}

// Function to run a single Playwright test
function runPlaywrightTest(testFile) {
  console.log(`Running Playwright test: ${testFile}`);
  try {
    execSync(`npx playwright test ${testFile} --reporter=list`, { stdio: 'inherit' });
    console.log(`✓ Test passed: ${testFile}`);
    return true;
  } catch (error) {
    console.log(`✗ Test failed: ${testFile}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('=== Running All src/tests Tests One By One ===');
  
  const playwrightTests = findSrcTestFiles();
  
  console.log(`Found ${playwrightTests.length} Playwright tests in src/tests`);
  
  // Results tracking
  const results = {
    passed: 0,
    failed: 0,
    total: playwrightTests.length
  };
  
  // Run Playwright tests one by one
  console.log('\n=== Running src/tests Playwright Tests ===');
  for (const testFile of playwrightTests) {
    const passed = runPlaywrightTest(testFile);
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    console.log(''); // Add a blank line for readability
  }
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Playwright Tests: ${results.passed}/${results.total} passed, ${results.failed} failed`);
}

// Run the main function
main().catch(error => {
  console.error(`Error running tests: ${error}`);
  process.exit(1);
});