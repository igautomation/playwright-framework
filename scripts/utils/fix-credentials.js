#!/usr/bin/env node

/**
 * Fix Hard-Coded Credentials
 * 
 * This script replaces hard-coded credentials with environment variables
 */

const fs = require('fs');
const path = require('path');

// Define patterns to replace
const replacements = [
  {
    pattern: /'Admin'/g,
    replacement: 'process.env.USERNAME'
  },
  {
    pattern: /'admin123'/g,
    replacement: 'process.env.PASSWORD'
  },
  {
    pattern: /"password"/g,
    replacement: 'process.env.PASSWORD'
  },
  {
    pattern: /'password'/g,
    replacement: 'process.env.PASSWORD'
  },
  {
    pattern: /'token'/g,
    replacement: 'process.env.API_TOKEN'
  }
];

// Define the tests directory path
const testsDir = path.resolve(__dirname, '../../src/tests');

// Function to fix a file
function fixFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const { pattern, replacement } of replacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      pattern.lastIndex = 0; // Reset regex index
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
  console.log('Starting credential fixes...\n');
  
  const results = walkDir(testsDir);
  
  console.log(`\nFixes complete!`);
  console.log(`Processed ${results.processed} files`);
  console.log(`Modified ${results.modified} files`);
  
  // Update .env.example with required variables
  const envExamplePath = path.resolve(__dirname, '../../.env.example');
  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Add variables if they don't exist
    const variables = [
      'USERNAME=Admin',
      'PASSWORD=admin123',
      'API_TOKEN=your_api_token'
    ];
    
    let modified = false;
    for (const variable of variables) {
      const [name] = variable.split('=');
      if (!envContent.includes(name + '=')) {
        envContent += `\n${variable}`;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(envExamplePath, envContent);
      console.log('\nUpdated .env.example with required variables');
    }
  }
}

// Run the script
main();