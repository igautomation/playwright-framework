#!/usr/bin/env node

/**
 * Verify Script Organization
 * 
 * This script verifies that the reorganized script structure works correctly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the expected directory structure
const expectedDirs = [
  'runners',
  'setup',
  'utils',
  'make-executable'
];

// Define key scripts that should be in specific directories
const keyScripts = [
  { dir: 'runners', file: 'run-tests.sh' },
  { dir: 'utils', file: 'framework-health-check.js' },
  { dir: 'setup', file: 'bootstrap.sh' },
  { dir: 'make-executable', file: 'make-scripts-executable.sh' }
];

// Function to check if a directory exists
function checkDirectory(dir) {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    console.log(`✅ Directory exists: ${dir}`);
    return true;
  } else {
    console.log(`❌ Directory missing: ${dir}`);
    return false;
  }
}

// Function to check if a file exists
function checkFile(dir, file) {
  const fullPath = path.join(__dirname, dir, file);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    console.log(`✅ File exists: ${dir}/${file}`);
    return true;
  } else {
    console.log(`❌ File missing: ${dir}/${file}`);
    return false;
  }
}

// Function to test if a script is executable
function testScript(dir, file) {
  const fullPath = path.join(__dirname, dir, file);
  try {
    if (file.endsWith('.sh')) {
      execSync(`bash -n "${fullPath}"`, { stdio: 'ignore' });
      console.log(`✅ Script syntax OK: ${dir}/${file}`);
      return true;
    } else if (file.endsWith('.js')) {
      execSync(`node --check "${fullPath}"`, { stdio: 'ignore' });
      console.log(`✅ Script syntax OK: ${dir}/${file}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Script syntax error: ${dir}/${file}`);
    return false;
  }
}

// Main verification function
function verifyOrganization() {
  console.log('Verifying script organization...\n');
  
  let allPassed = true;
  
  // Check directories
  console.log('Checking directories:');
  expectedDirs.forEach(dir => {
    if (!checkDirectory(dir)) {
      allPassed = false;
    }
  });
  
  // Check key files
  console.log('\nChecking key files:');
  keyScripts.forEach(({ dir, file }) => {
    if (!checkFile(dir, file)) {
      allPassed = false;
    }
  });
  
  // Test key scripts
  console.log('\nTesting key scripts:');
  keyScripts.forEach(({ dir, file }) => {
    if (!testScript(dir, file)) {
      allPassed = false;
    }
  });
  
  // Final result
  console.log('\nVerification result:');
  if (allPassed) {
    console.log('✅ All checks passed! The script organization is working correctly.');
  } else {
    console.log('❌ Some checks failed. The script organization needs fixing.');
  }
}

// Run the verification
verifyOrganization();