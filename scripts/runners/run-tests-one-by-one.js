#!/usr/bin/env node

/**
 * Script to run all tests one by one
 * This script will find all test files and run them individually
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to find all test files
function findTestFiles() {
  console.log('Finding all test files...');
  
  // Find Jest unit tests
  const jestTestsOutput = execSync('find tests -name "*.test.js"').toString().trim();
  const jestTests = jestTestsOutput ? jestTestsOutput.split('\n') : [];
  
  // Find Playwright tests
  const playwrightTestsOutput = execSync('find src/tests -name "*.spec.js"').toString().trim();
  const playwrightTests = playwrightTestsOutput ? playwrightTestsOutput.split('\n') : [];
  
  return {
    jestTests,
    playwrightTests
  };
}

// Function to run a single Jest test
function runJestTest(testFile) {
  console.log(`Running Jest test: ${testFile}`);
  try {
    execSync(`npx jest ${testFile} --no-cache`, { stdio: 'inherit' });
    console.log(`✓ Test passed: ${testFile}`);
    return true;
  } catch (error) {
    console.log(`✗ Test failed: ${testFile}`);
    return false;
  }
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
  console.log('=== Running All Tests One By One ===');
  
  const { jestTests, playwrightTests } = findTestFiles();
  
  console.log(`Found ${jestTests.length} Jest tests and ${playwrightTests.length} Playwright tests`);
  
  // Results tracking
  const results = {
    jest: { passed: 0, failed: 0, total: jestTests.length },
    playwright: { passed: 0, failed: 0, total: playwrightTests.length }
  };
  
  // Run Jest tests one by one
  console.log('\n=== Running Jest Tests ===');
  for (const testFile of jestTests) {
    const passed = runJestTest(testFile);
    if (passed) {
      results.jest.passed++;
    } else {
      results.jest.failed++;
    }
    console.log(''); // Add a blank line for readability
  }
  
  // Run Playwright tests one by one
  console.log('\n=== Running Playwright Tests ===');
  for (const testFile of playwrightTests) {
    const passed = runPlaywrightTest(testFile);
    if (passed) {
      results.playwright.passed++;
    } else {
      results.playwright.failed++;
    }
    console.log(''); // Add a blank line for readability
  }
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Jest Tests: ${results.jest.passed}/${results.jest.total} passed, ${results.jest.failed} failed`);
  console.log(`Playwright Tests: ${results.playwright.passed}/${results.playwright.total} passed, ${results.playwright.failed} failed`);
  console.log(`Total: ${results.jest.passed + results.playwright.passed}/${results.jest.total + results.playwright.total} passed, ${results.jest.failed + results.playwright.failed} failed`);
}

// Run the main function
main().catch(error => {
  console.error(`Error running tests: ${error}`);
  process.exit(1);
});