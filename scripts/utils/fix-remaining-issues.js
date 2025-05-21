#!/usr/bin/env node

/**
 * Fix Remaining Issues
 * 
 * This script fixes remaining issues in test files:
 * 1. Adds missing test.describe blocks
 * 2. Replaces sleep/delay usage with proper waiting
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
  
  // Fix missing test.describe blocks
  if (!content.includes('test.describe') && content.includes('test(')) {
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
  
  // Fix sleep/delay usage
  if (content.includes('setTimeout(') || content.includes('waitForTimeout(')) {
    content = content.replace(
      /await page\.waitForTimeout\((\d+)\);/g,
      '// Replaced timeout with proper waiting\nawait page.waitForLoadState("networkidle");'
    );
    
    content = content.replace(
      /setTimeout\(\s*(?:async\s*)?\(\)\s*=>\s*{([^}]*)}\s*,\s*(\d+)\s*\)/g,
      '// Replaced setTimeout with proper waiting\nawait page.waitForLoadState("networkidle");$1'
    );
    
    modified = true;
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
  console.log('Fixing remaining issues...\n');
  
  const results = walkDir(testsDir);
  
  console.log(`\nFixes complete!`);
  console.log(`Processed ${results.processed} files`);
  console.log(`Modified ${results.modified} files`);
}

// Run the script
main();