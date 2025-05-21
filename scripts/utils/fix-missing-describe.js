#!/usr/bin/env node

/**
 * Fix Missing Describe Blocks
 * 
 * This script adds missing test.describe blocks to test files
 */

const fs = require('fs');
const path = require('path');

// Define the tests directory path
const testsDir = path.resolve(__dirname, '../../src/tests');

// Function to fix a file
function fixFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file already has test.describe
  const hasTestDescribe = /test\.describe/.test(content);
  
  if (!hasTestDescribe && content.includes('test(')) {
    // Extract the file name without extension to use as the describe block name
    const fileName = path.basename(filePath, '.spec.js');
    const describeName = fileName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Add test.describe block
    if (content.includes("const { test, expect } = require('@playwright/test');")) {
      content = content.replace(
        "const { test, expect } = require('@playwright/test');",
        "const { test, expect } = require('@playwright/test');\n\ntest.describe('" + describeName + "', () => {"
      );
      
      // Add closing bracket at the end of the file
      content = content + "\n});\n";
      
      modified = true;
    } else if (content.includes("import { test, expect } from '@playwright/test';")) {
      content = content.replace(
        "import { test, expect } from '@playwright/test';",
        "import { test, expect } from '@playwright/test';\n\ntest.describe('" + describeName + "', () => {"
      );
      
      // Add closing bracket at the end of the file
      content = content + "\n});\n";
      
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Function to walk through the tests directory
function walkDir(dir) {
  const results = {
    processed: 0,
    modified: 0
  };
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      const subResults = walkDir(filePath);
      results.processed += subResults.processed;
      results.modified += subResults.modified;
    } else if (stat.isFile() && file.endsWith('.spec.js')) {
      results.processed++;
      if (fixFile(filePath)) {
        results.modified++;
      }
    }
  }
  
  return results;
}

// Main function
function main() {
  console.log('Fixing missing describe blocks...\n');
  
  const results = walkDir(testsDir);
  
  console.log(`\nFixes complete!`);
  console.log(`Processed ${results.processed} files`);
  console.log(`Modified ${results.modified} files`);
}

// Run the script
main();