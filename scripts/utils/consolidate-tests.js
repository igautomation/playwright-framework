#!/usr/bin/env node

/**
 * Consolidate Duplicate Tests
 * 
 * This script consolidates duplicate test files into single, comprehensive test files
 */

const fs = require('fs');
const path = require('path');

// Define groups of duplicate tests to consolidate
const duplicateGroups = [
  {
    name: 'accessibility',
    outputFile: './src/tests/accessibility/accessibility.spec.js',
    files: [
      './src/tests/accessibility/accessibility-test.spec.js',
      './src/tests/accessibility/accessibilityTest.spec.js',
      './src/tests/accessibility/basic-a11y.spec.js',
      './src/tests/accessibility/simple-accessibility.spec.js',
      './src/tests/core/accessibility.spec.js'
    ],
    header: `/**
 * Accessibility Tests
 * 
 * Comprehensive test suite for accessibility testing using various approaches
 */
const { test, expect } = require('@playwright/test');
const { checkAccessibility, generateAccessibilityReport } = require('../../utils/accessibility/accessibilityUtils');

`
  },
  {
    name: 'orangehrm',
    outputFile: './src/tests/ui/orangehrm.spec.js',
    files: [
      './src/tests/orangehrm-test.spec.js',
      './src/tests/ui/orangehrm-ui.spec.js',
      './src/tests/ui/orangehrm-ui-fixed.spec.js'
    ],
    header: `/**
 * OrangeHRM UI Tests
 * 
 * Comprehensive test suite for OrangeHRM demo site
 */
const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/orangehrm/LoginPage');
const DashboardPage = require('../../pages/orangehrm/DashboardPage');

`
  },
  {
    name: 'visual',
    outputFile: './src/tests/visual/visual-regression.spec.js',
    files: [
      './src/tests/visual/visual-test.spec.js',
      './src/tests/visual/visualRegressionTest.spec.js',
      './src/tests/core/visual-regression.spec.js'
    ],
    header: `/**
 * Visual Regression Tests
 * 
 * Comprehensive test suite for visual regression testing
 */
const { test, expect } = require('@playwright/test');
const ScreenshotUtils = require('../../utils/web/screenshotUtils');
const VisualComparisonUtils = require('../../utils/visual/visualComparisonUtils');

`
  },
  {
    name: 'api-ui',
    outputFile: './src/tests/integration/api-ui.spec.js',
    files: [
      './src/tests/combined-api-ui-test.spec.js',
      './src/tests/combined/api-ui-combined.spec.js',
      './src/tests/ui/api-ui-test.spec.js',
      './src/tests/integration/api-ui-integration.spec.js'
    ],
    header: `/**
 * API and UI Integration Tests
 * 
 * Comprehensive test suite that combines API and UI testing
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api/apiUtils');

`
  }
];

// Function to extract test blocks from a file
function extractTestBlocks(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract test.describe blocks
    const describeRegex = /test\.describe\(['"]([^'"]+)['"]\s*,\s*\(\)\s*=>\s*{([^}]*)}\);/gs;
    const describeMatches = [...content.matchAll(describeRegex)];
    
    if (describeMatches.length > 0) {
      return describeMatches.map(match => {
        return `test.describe('${match[1]}', () => {${match[2]}});`;
      }).join('\n\n');
    }
    
    // Extract individual test blocks if no describe blocks found
    const testRegex = /test\(['"]([^'"]+)['"]\s*,\s*async\s*\(\s*{([^}]*)}\s*\)\s*=>\s*{([^}]*)}\);/gs;
    const testMatches = [...content.matchAll(testRegex)];
    
    if (testMatches.length > 0) {
      return testMatches.map(match => {
        return `test('${match[1]}', async ({ ${match[2]} }) => {${match[3]}});`;
      }).join('\n\n');
    }
    
    return '';
  } catch (error) {
    console.error(`Error extracting test blocks from ${filePath}:`, error);
    return '';
  }
}

// Function to consolidate a group of duplicate tests
function consolidateGroup(group) {
  console.log(`Consolidating ${group.name} tests...`);
  
  let consolidatedContent = group.header;
  let testBlocks = [];
  
  // Extract test blocks from each file
  for (const file of group.files) {
    if (fs.existsSync(file)) {
      const blocks = extractTestBlocks(file);
      if (blocks) {
        testBlocks.push(blocks);
      }
    } else {
      console.warn(`File not found: ${file}`);
    }
  }
  
  // Combine all test blocks
  consolidatedContent += testBlocks.join('\n\n');
  
  // Create directory if it doesn't exist
  const dir = path.dirname(group.outputFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write consolidated file
  fs.writeFileSync(group.outputFile, consolidatedContent);
  console.log(`Created consolidated file: ${group.outputFile}`);
  
  // Create backup directory
  const backupDir = path.join(path.dirname(group.outputFile), 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Move original files to backup
  for (const file of group.files) {
    if (fs.existsSync(file)) {
      const backupFile = path.join(backupDir, path.basename(file));
      fs.renameSync(file, backupFile);
      console.log(`Moved ${file} to ${backupFile}`);
    }
  }
}

// Main function
function main() {
  console.log('Starting test consolidation...\n');
  
  for (const group of duplicateGroups) {
    consolidateGroup(group);
    console.log('');
  }
  
  console.log('Test consolidation complete!');
}

// Run the script
main();