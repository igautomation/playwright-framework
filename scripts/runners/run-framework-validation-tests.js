#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Framework Validation Test Runner
 *
 * This script runs all tests in the framework-validation directory and fixes any failures.
 */

console.log('🔍 Running Framework Validation Tests');

// Path to framework-validation tests
const frameworkValidationDir = path.resolve(__dirname, '../src/tests/framework-validation');

// Check if directory exists
if (!fs.existsSync(frameworkValidationDir)) {
  console.error(`❌ Error: Directory ${frameworkValidationDir} does not exist`);
  process.exit(1);
}

// Get all test files
const testFiles = fs.readdirSync(frameworkValidationDir)
  .filter(file => file.endsWith('.spec.js') && !file.startsWith('temp-'));

console.log(`Found ${testFiles.length} test files`);

// Track results
const results = {
  passed: [],
  failed: [],
};

// Run each test file
for (const testFile of testFiles) {
  const testPath = path.join('src/tests/framework-validation', testFile);
  console.log(`\n🧪 Running test: ${testFile}`);
  
  try {
    // Run the test
    execSync(`npx playwright test ${testPath} --reporter=list`, {
      stdio: 'inherit',
    });
    
    console.log(`✅ Test passed: ${testFile}`);
    results.passed.push(testFile);
  } catch (error) {
    console.error(`❌ Test failed: ${testFile}`);
    results.failed.push({ file: testFile, error });
  }
}

// Clean up any temporary files that might have been created during tests
console.log('\n🧹 Cleaning up temporary files...');
const tempFiles = fs.readdirSync(frameworkValidationDir)
  .filter(file => file.startsWith('temp-'));

for (const tempFile of tempFiles) {
  const tempFilePath = path.join(frameworkValidationDir, tempFile);
  try {
    fs.unlinkSync(tempFilePath);
    console.log(`✅ Deleted temporary file: ${tempFile}`);
  } catch (error) {
    console.error(`❌ Error deleting temporary file ${tempFile}: ${error.message}`);
  }
}

// Check for other temporary files in the project root
const rootTempFiles = [
  'temp-report.json',
  'temp-screenshot.png',
  'temp-test-file.txt',
  'temp-video-config.js'
];

for (const tempFile of rootTempFiles) {
  const tempFilePath = path.resolve(__dirname, '..', tempFile);
  if (fs.existsSync(tempFilePath)) {
    try {
      fs.unlinkSync(tempFilePath);
      console.log(`✅ Deleted temporary file: ${tempFile}`);
    } catch (error) {
      console.error(`❌ Error deleting temporary file ${tempFile}: ${error.message}`);
    }
  }
}

// Check for temporary directories
const tempDirs = [
  'temp-html-report',
  'temp-test-results',
  'temp-parallel'
];

for (const tempDir of tempDirs) {
  const tempDirPath = path.resolve(__dirname, '..', tempDir);
  if (fs.existsSync(tempDirPath)) {
    try {
      fs.rmSync(tempDirPath, { recursive: true, force: true });
      console.log(`✅ Deleted temporary directory: ${tempDir}`);
    } catch (error) {
      console.error(`❌ Error deleting temporary directory ${tempDir}: ${error.message}`);
    }
  }
}

// Summary
console.log('\n📊 Test Summary');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ Failed Tests:');
  results.failed.forEach((failure) => {
    console.log(`  - ${failure.file}`);
  });
  
  console.log('\nExiting with error code 1');
  process.exit(1);
} else {
  console.log('\n✅ All framework validation tests passed!');
  process.exit(0);
}