#!/usr/bin/env node

/**
 * Fix All Remaining Issues
 * 
 * This script automatically fixes all remaining issues in test files:
 * - Hard-coded URLs
 * - Missing test.describe blocks
 * - setTimeout usage
 */

const fs = require('fs');
const path = require('path');

// Define the tests directory path
const testsDir = path.resolve(__dirname, '../../src/tests');

// URL mappings for replacement
const urlMappings = [
  { pattern: /'https:\/\/reqres\.in\/api'/g, replacement: 'process.env.API_URL' },
  { pattern: /'https:\/\/reqres\.in'/g, replacement: 'process.env.API_BASE_URL' },
  { pattern: /'https:\/\/playwright\.dev'/g, replacement: 'process.env.PLAYWRIGHT_DOCS_URL' },
  { pattern: /'https:\/\/github\.com'/g, replacement: 'process.env.GITHUB_URL' },
  { pattern: /'https:\/\/example\.com'/g, replacement: 'process.env.EXAMPLE_URL' },
  { pattern: /'https:\/\/api\.example\.com'/g, replacement: 'process.env.EXAMPLE_API_URL' },
  { pattern: /'http:\/\/non-existent-domain-123456789\.com'/g, replacement: 'process.env.NON_EXISTENT_URL' },
  { pattern: /'https:\/\/non-existent-domain-123456789\.com'/g, replacement: 'process.env.NON_EXISTENT_URL' },
  { pattern: /'https:\/\/automationexercise\.com'/g, replacement: 'process.env.AUTOMATION_EXERCISE_URL' }
];

// Function to fix hard-coded URLs in a file
function fixHardcodedUrls(filePath, content) {
  let modified = false;
  let newContent = content;
  
  for (const { pattern, replacement } of urlMappings) {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
      pattern.lastIndex = 0; // Reset regex index
    }
  }
  
  // Handle URL patterns with paths
  newContent = newContent.replace(/'(https:\/\/[^']+)\/([^']+)'/g, (match, baseUrl, path) => {
    for (const { pattern, replacement } of urlMappings) {
      const baseUrlOnly = `'${baseUrl}'`;
      if (pattern.test(baseUrlOnly)) {
        modified = true;
        const envVar = replacement.replace('process.env.', '');
        return `\`\${process.env.${envVar}}/${path}\``;
      }
    }
    return match;
  });
  
  return { content: newContent, modified };
}

// Function to fix setTimeout usage in a file
function fixSetTimeout(filePath, content) {
  let modified = false;
  let newContent = content;
  
  // Pattern 1: setTimeout with async function
  if (newContent.includes('setTimeout(')) {
    newContent = newContent.replace(
      /setTimeout\(\s*async\s*\(\)\s*=>\s*{([^}]*)}\s*,\s*(\d+)\s*\)/g,
      'await page.waitForLoadState("networkidle");\n$1'
    );
    
    // Pattern 2: setTimeout with function and then
    newContent = newContent.replace(
      /setTimeout\(\s*\(\)\s*=>\s*{([^}]*)}\s*,\s*(\d+)\s*\)\.then/g,
      'page.waitForLoadState("networkidle").then'
    );
    
    // Pattern 3: setTimeout with function
    newContent = newContent.replace(
      /setTimeout\(\s*\(\)\s*=>\s*{([^}]*)}\s*,\s*(\d+)\s*\)/g,
      'await page.waitForLoadState("networkidle");\n$1'
    );
    
    // Pattern 4: setTimeout with function call
    newContent = newContent.replace(
      /setTimeout\(([^,]+),\s*(\d+)\)/g,
      'await page.waitForLoadState("networkidle");\n$1()'
    );
    
    modified = newContent !== content;
  }
  
  return { content: newContent, modified };
}

// Function to add test.describe block to a file
function addTestDescribe(filePath, content) {
  // Check if file already has test.describe
  if (content.includes('test.describe')) {
    return { content, modified: false };
  }
  
  // Extract the file name without extension to use as the describe block name
  const fileName = path.basename(filePath, '.spec.js');
  const describeName = fileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  let newContent = content;
  let modified = false;
  
  // Find the first test declaration
  const testRegex = /test\(['"]([^'"]+)['"]/;
  const match = content.match(testRegex);
  
  if (match) {
    const testIndex = content.indexOf(match[0]);
    if (testIndex !== -1) {
      // Insert test.describe before the first test
      const beforeTest = content.substring(0, testIndex);
      const afterTest = content.substring(testIndex);
      
      newContent = beforeTest + 
                `test.describe('${describeName}', () => {\n\n` + 
                afterTest + 
                `\n});\n`;
      
      modified = true;
    }
  }
  
  return { content: newContent, modified };
}

// Function to fix a file
function fixFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix hard-coded URLs
    const urlResult = fixHardcodedUrls(filePath, content);
    content = urlResult.content;
    modified = modified || urlResult.modified;
    
    // Fix setTimeout usage
    const timeoutResult = fixSetTimeout(filePath, content);
    content = timeoutResult.content;
    modified = modified || timeoutResult.modified;
    
    // Add test.describe block
    const describeResult = addTestDescribe(filePath, content);
    content = describeResult.content;
    modified = modified || describeResult.modified;
    
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

// Function to update .env file with new variables
function updateEnvFile() {
  const envPath = path.resolve(__dirname, '../../.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('.env file not found, skipping update');
    return;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Add new variables if they don't exist
  const newVariables = [
    'NON_EXISTENT_URL=http://non-existent-domain-123456789.com',
    'GITHUB_URL=https://github.com'
  ];
  
  let modified = false;
  for (const variable of newVariables) {
    const [name] = variable.split('=');
    if (!envContent.includes(name + '=')) {
      envContent += `\n${variable}`;
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(envPath, envContent);
    console.log('Updated .env file with new variables');
  }
}

// Main function
function main() {
  console.log('Starting to fix all remaining issues...\n');
  
  // Update .env file with new variables
  updateEnvFile();
  
  // Fix all test files
  const results = walkDir(testsDir);
  
  console.log(`\nFixes complete!`);
  console.log(`Processed ${results.processed} files`);
  console.log(`Modified ${results.modified} files`);
}

// Run the script
main();