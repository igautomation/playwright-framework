#!/usr/bin/env node

/**
 * Fix Remaining URLs
 * 
 * This script fixes the remaining hard-coded URLs in test files
 */

const fs = require('fs');
const path = require('path');

// Define the specific files to fix
const filesToFix = [
  './src/tests/combined-test-suite.spec.js',
  './src/tests/comprehensive-test-suite.spec.js',
  './src/tests/examples/reporting-integration.spec.js',
  './src/tests/framework-validation/api-utils.spec.js',
  './src/tests/framework-validation/core-components.spec.js',
  './src/tests/framework-validation/web-scraping-advanced.spec.js'
];

// Function to fix a file
function fixFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix specific patterns in each file
    if (filePath.includes('combined-test-suite.spec.js') || filePath.includes('comprehensive-test-suite.spec.js')) {
      content = content.replace(/'https:\/\/reqres\.in\/'/g, 'process.env.API_BASE_URL');
      modified = true;
    }
    
    if (filePath.includes('reporting-integration.spec.js')) {
      content = content.replace(/'https:\/\/github\.com\/org\/repo\/issues\/123'/g, '`${process.env.GITHUB_URL}/org/repo/issues/123`');
      modified = true;
    }
    
    if (filePath.includes('api-utils.spec.js')) {
      content = content.replace(/'https:\/\/api\.example\.com\/users\/1'/g, '`${process.env.EXAMPLE_API_URL}/users/1`');
      modified = true;
    }
    
    if (filePath.includes('core-components.spec.js')) {
      content = content.replace(/'https:\/\/example\.com\/api'/g, '`${process.env.EXAMPLE_URL}/api`');
      modified = true;
    }
    
    if (filePath.includes('web-scraping-advanced.spec.js')) {
      content = content.replace(/"https:\/\/example\.com\/test-page"/g, '`${process.env.EXAMPLE_URL}/test-page`');
      content = content.replace(/"https:\/\/example\.com\/image1\.jpg"/g, '`${process.env.EXAMPLE_URL}/image1.jpg`');
      content = content.replace(/"https:\/\/example\.com\/image2\.jpg"/g, '`${process.env.EXAMPLE_URL}/image2.jpg`');
      content = content.replace(/"https:\/\/example\.com\/submit"/g, '`${process.env.EXAMPLE_URL}/submit`');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('Starting to fix remaining URLs...\n');
  
  let modified = 0;
  
  // Fix each file
  for (const file of filesToFix) {
    const filePath = path.resolve(file);
    if (fs.existsSync(filePath)) {
      if (fixFile(filePath)) {
        modified++;
      }
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }
  
  console.log(`\nFixes complete!`);
  console.log(`Modified ${modified} files`);
}

// Run the script
main();