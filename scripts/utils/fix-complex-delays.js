#!/usr/bin/env node

/**
 * Fix Complex Delays
 * 
 * This script fixes complex setTimeout patterns in test files
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
  
  // Fix complex setTimeout patterns
  if (content.includes('setTimeout(')) {
    // Pattern 1: setTimeout with async function
    content = content.replace(
      /setTimeout\(\s*async\s*\(\)\s*=>\s*{([^}]*)}\s*,\s*(\d+)\s*\)/g,
      'await page.waitForLoadState("networkidle");\n$1'
    );
    
    // Pattern 2: setTimeout with function and then
    content = content.replace(
      /setTimeout\(\s*\(\)\s*=>\s*{([^}]*)}\s*,\s*(\d+)\s*\)\.then/g,
      'page.waitForLoadState("networkidle").then'
    );
    
    // Pattern 3: setTimeout with function
    content = content.replace(
      /setTimeout\(\s*\(\)\s*=>\s*{([^}]*)}\s*,\s*(\d+)\s*\)/g,
      'await page.waitForLoadState("networkidle");\n$1'
    );
    
    // Pattern 4: setTimeout with function call
    content = content.replace(
      /setTimeout\(([^,]+),\s*(\d+)\)/g,
      'await page.waitForLoadState("networkidle");\n$1()'
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
  console.log('Fixing complex delays...\n');
  
  const results = walkDir(testsDir);
  
  console.log(`\nFixes complete!`);
  console.log(`Processed ${results.processed} files`);
  console.log(`Modified ${results.modified} files`);
}

// Run the script
main();