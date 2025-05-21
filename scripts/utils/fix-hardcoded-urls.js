#!/usr/bin/env node

/**
 * Fix Hard-Coded URLs
 * 
 * This script replaces hard-coded URLs with environment variables
 */

const fs = require('fs');
const path = require('path');

// Define URL patterns to replace
const urlReplacements = [
  {
    pattern: /'https:\/\/reqres\.in\/api'/g,
    replacement: 'process.env.API_URL'
  },
  {
    pattern: /'https:\/\/reqres\.in\/api\//g,
    replacement: '`${process.env.API_URL}/'
  },
  {
    pattern: /'https:\/\/reqres\.in'/g,
    replacement: 'process.env.API_BASE_URL'
  },
  {
    pattern: /'https:\/\/playwright\.dev\/'/g,
    replacement: 'process.env.PLAYWRIGHT_DOCS_URL'
  },
  {
    pattern: /'https:\/\/playwright\.dev\/docs/g,
    replacement: '`${process.env.PLAYWRIGHT_DOCS_URL}docs'
  },
  {
    pattern: /'https:\/\/demo\.playwright\.dev\/todomvc\/#\/'/g,
    replacement: 'process.env.TODO_APP_URL'
  },
  {
    pattern: /'https:\/\/opensource-demo\.orangehrmlive\.com\/web\/index\.php'/g,
    replacement: 'process.env.ORANGEHRM_URL'
  },
  {
    pattern: /'https:\/\/automationexercise\.com'/g,
    replacement: 'process.env.AUTOMATION_EXERCISE_URL'
  },
  {
    pattern: /'https:\/\/selectorshub\.com\/xpath-practice-page\/'/g,
    replacement: 'process.env.SELECTORS_HUB_URL'
  },
  {
    pattern: /'https:\/\/example\.com'/g,
    replacement: 'process.env.EXAMPLE_URL'
  }
];

// Define the tests directory path
const testsDir = path.resolve(__dirname, '../../src/tests');

// Function to fix a file
function fixFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const { pattern, replacement } of urlReplacements) {
    if (pattern.test(content)) {
      // If replacement ends with backtick, we need to add closing backtick
      if (replacement.includes('`${')) {
        content = content.replace(pattern, (match) => {
          const endOfUrl = match.lastIndexOf("'");
          return replacement + match.substring(match.indexOf('/') + 1, endOfUrl) + '`';
        });
      } else {
        content = content.replace(pattern, replacement);
      }
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
  console.log('Starting URL fixes...\n');
  
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
      'API_BASE_URL=https://reqres.in',
      'AUTOMATION_EXERCISE_URL=https://automationexercise.com',
      'SELECTORS_HUB_URL=https://selectorshub.com/xpath-practice-page/',
      'EXAMPLE_URL=https://example.com'
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