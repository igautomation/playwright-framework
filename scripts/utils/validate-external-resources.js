#!/usr/bin/env node

/**
 * Validate External Resources
 * 
 * This script validates that all hard-coded values have been replaced with configurable options
 */

const fs = require('fs');
const path = require('path');

// Define patterns to search for
const patterns = [
  {
    name: 'Hard-coded URLs',
    regex: /(["'])https?:\/\/[^"']+\1/g,
    exclude: [
      /cdn\.jsdelivr\.net\/npm\/chart\.js/,
      /cdnjs\.cloudflare\.com\/ajax\/libs\/axe-core/,
      /playwright\.dev\/docs/,
      /externalResources\.cdn/,
      /externalResources\.apis/
    ]
  },
  {
    name: 'Hard-coded credentials',
    regex: /(["'])(?:default_password|default_username|default_token|default_key|default_secret)\1/g
  },
  {
    name: 'Hard-coded domains',
    regex: /(["'])(?:example\.com|reqres\.in|playwright\.dev|demo\.playwright)\1/g,
    exclude: [
      /externalResources\.email\.defaultDomain/
    ]
  }
];

// Define the utils directory path
const utilsDir = path.resolve(__dirname, '../../src/utils');

// Function to check a file for patterns
function checkFile(filePath, patterns) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern.regex);
    
    if (matches) {
      // Filter out excluded patterns
      const filteredMatches = matches.filter(match => {
        if (!pattern.exclude) return true;
        return !pattern.exclude.some(exclude => exclude.test(match));
      });
      
      if (filteredMatches.length > 0) {
        issues.push({
          pattern: pattern.name,
          matches: filteredMatches
        });
      }
    }
  }
  
  return issues;
}

// Function to walk through the utils directory
function walkDir(dir, patterns) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...walkDir(filePath, patterns));
    } else if (stat.isFile() && file.endsWith('.js')) {
      const issues = checkFile(filePath, patterns);
      
      if (issues.length > 0) {
        results.push({
          file: filePath,
          issues
        });
      }
    }
  }
  
  return results;
}

// Main validation function
function validateExternalResources() {
  console.log('Validating external resources...\n');
  
  const issues = walkDir(utilsDir, patterns);
  
  if (issues.length > 0) {
    console.log(`❌ Found ${issues.length} files with hard-coded values:\n`);
    
    issues.forEach(({ file, issues }) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`File: ${relativePath}`);
      
      issues.forEach(({ pattern, matches }) => {
        console.log(`  - ${pattern}: ${matches.join(', ')}`);
      });
      
      console.log('');
    });
    
    console.log('These hard-coded values should be replaced with configurable options.');
    process.exit(1);
  } else {
    console.log('✅ No hard-coded values found! All external resources are properly configurable.');
  }
}

// Run the validation
validateExternalResources();