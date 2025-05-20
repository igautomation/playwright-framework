#!/usr/bin/env node

/**
 * Validate Utils
 * 
 * This script validates the utils directory structure and files
 */

const fs = require('fs');
const path = require('path');

// Define the expected directory structure
const expectedDirs = [
  'accessibility',
  'api',
  'common',
  'web'
];

// Define key utility files that should exist
const keyUtils = [
  { dir: 'api', file: 'apiUtils.js' },
  { dir: 'web', file: 'webInteractions.js' },
  { dir: 'web', file: 'screenshotUtils.js' },
  { dir: 'web', file: 'SelfHealingLocator.js' },
  { dir: 'common', file: 'logger.js' },
  { dir: 'common', file: 'testDataFactory.js' },
  { dir: 'accessibility', file: 'accessibilityUtils.js' }
];

// Define the utils directory path
const utilsDir = path.resolve(__dirname, '../../src/utils');

// Function to check if a directory exists
function checkDirectory(dir) {
  const fullPath = path.join(utilsDir, dir);
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
  const fullPath = path.join(utilsDir, dir, file);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    console.log(`✅ File exists: ${dir}/${file}`);
    return true;
  } else {
    console.log(`❌ File missing: ${dir}/${file}`);
    return false;
  }
}

// Function to check for duplicate files
function checkDuplicates() {
  const duplicates = [];
  const fileMap = new Map();
  
  // Walk through the utils directory
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile() && file.endsWith('.js')) {
        if (!fileMap.has(file)) {
          fileMap.set(file, []);
        }
        fileMap.get(file).push(filePath);
      }
    }
  }
  
  walkDir(utilsDir);
  
  // Check for duplicates
  for (const [file, paths] of fileMap.entries()) {
    if (paths.length > 1) {
      duplicates.push({ file, paths });
    }
  }
  
  return duplicates;
}

// Main validation function
function validateUtils() {
  console.log('Validating utils directory...\n');
  
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
  keyUtils.forEach(({ dir, file }) => {
    if (!checkFile(dir, file)) {
      allPassed = false;
    }
  });
  
  // Check for duplicates
  console.log('\nChecking for duplicate files:');
  const duplicates = checkDuplicates();
  if (duplicates.length > 0) {
    allPassed = false;
    console.log(`❌ Found ${duplicates.length} duplicate files:`);
    duplicates.forEach(({ file, paths }) => {
      console.log(`  - ${file}:`);
      paths.forEach(path => console.log(`    - ${path}`));
    });
  } else {
    console.log('✅ No duplicate files found');
  }
  
  // Final result
  console.log('\nValidation result:');
  if (allPassed) {
    console.log('✅ All checks passed! The utils directory is valid.');
  } else {
    console.log('❌ Some checks failed. The utils directory needs fixing.');
  }
}

// Run the validation
validateUtils();
