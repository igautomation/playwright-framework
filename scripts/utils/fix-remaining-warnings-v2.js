#!/usr/bin/env node

/**
 * Fix Remaining Warnings (Version 2)
 * 
 * This script addresses remaining warnings in test files with more flexible pattern matching
 */

const fs = require('fs');
const path = require('path');

// Define the tests directory path
const testsDir = path.resolve(__dirname, '../../src/tests');

// Define files to fix
const filesToFix = [
  './src/tests/example-optimized.spec.js',
  './src/tests/examples/custom-fixtures.spec.js',
  './src/tests/ui/regression/download.spec.js',
  './src/tests/ui/regression/invalid-login.spec.js',
  './src/tests/ui/smoke/table.spec.js'
];

// Function to add test.describe block to a file
function addTestDescribe(filePath) {
  console.log(`Adding test.describe to: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file already has test.describe
  if (content.includes('test.describe')) {
    console.log(`File already has test.describe: ${filePath}`);
    return false;
  }
  
  // Extract the file name without extension to use as the describe block name
  const fileName = path.basename(filePath, '.spec.js');
  const describeName = fileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Find the first test declaration
  const testRegex = /test\(['"]([^'"]+)['"]/;
  const match = content.match(testRegex);
  
  if (match) {
    const testIndex = content.indexOf(match[0]);
    if (testIndex !== -1) {
      // Insert test.describe before the first test
      const beforeTest = content.substring(0, testIndex);
      const afterTest = content.substring(testIndex);
      
      content = beforeTest + 
                `test.describe('${describeName}', () => {\n\n` + 
                afterTest + 
                `\n});\n`;
      
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${filePath}`);
      return true;
    }
  }
  
  console.log(`Could not update: ${filePath} (no test found)`);
  return false;
}

// Main function
function main() {
  console.log('Fixing remaining warnings...\n');
  
  let modified = 0;
  
  // Add test.describe blocks to files
  for (const file of filesToFix) {
    const filePath = path.resolve(file);
    if (addTestDescribe(filePath)) {
      modified++;
    }
  }
  
  console.log(`\nFixes complete!`);
  console.log(`Modified ${modified} files`);
}

// Run the script
main();