#!/usr/bin/env node

/**
 * Script Index - Lists all available scripts with descriptions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Script categories with descriptions
const categories = {
  'runners': 'Test runner scripts for executing tests',
  'setup': 'Setup scripts for configuring the environment',
  'utils': 'Utility scripts for framework management',
  'make-executable': 'Scripts for making other scripts executable'
};

// Function to get script description from file content
function getScriptDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8').split('\n').slice(0, 20).join('\n');
    
    // Try to extract description from comments
    let description = '';
    
    if (filePath.endsWith('.js')) {
      // For JS files, look for /** ... */ or // comments
      const jsDocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
      if (jsDocMatch) {
        description = jsDocMatch[0]
          .replace(/\/\*\*|\*\//g, '')
          .replace(/\s*\*\s*/g, ' ')
          .trim();
      } else {
        // Look for single line comments
        const commentLines = content.match(/\/\/\s*(.*)/g);
        if (commentLines && commentLines.length > 0) {
          description = commentLines[0].replace(/\/\/\s*/, '').trim();
        }
      }
    } else if (filePath.endsWith('.sh')) {
      // For shell scripts, look for # comments
      const commentLines = content.match(/#\s*(.*)/g);
      if (commentLines && commentLines.length > 0) {
        description = commentLines[0].replace(/#\s*/, '').trim();
      }
    }
    
    // If no description found, use a generic one based on filename
    if (!description) {
      const baseName = path.basename(filePath);
      description = `${baseName} - ${baseName.replace(/[-_.]/g, ' ').replace(/\.\w+$/, '')} script`;
    }
    
    return description;
  } catch (error) {
    return 'No description available';
  }
}

// Function to list scripts in a directory
function listScriptsInDirectory(dir, indent = '') {
  const items = fs.readdirSync(dir);
  
  // Sort items: directories first, then files
  const directories = items.filter(item => fs.statSync(path.join(dir, item)).isDirectory());
  const files = items.filter(item => !fs.statSync(path.join(dir, item)).isDirectory());
  
  // Process directories
  directories.sort().forEach(item => {
    if (item === 'node_modules' || item.startsWith('.')) return;
    
    const fullPath = path.join(dir, item);
    console.log(`${indent}${colors.bright}${colors.blue}📁 ${item}${colors.reset}`);
    
    // Print category description if available
    if (categories[item]) {
      console.log(`${indent}   ${colors.dim}${categories[item]}${colors.reset}`);
    }
    
    listScriptsInDirectory(fullPath, `${indent}   `);
  });
  
  // Process files
  files.sort().forEach(item => {
    if (item.startsWith('.') || item === 'index.js') return;
    
    const fullPath = path.join(dir, item);
    const description = getScriptDescription(fullPath);
    
    // Use different colors for different file types
    let fileIcon = '📄';
    let fileColor = colors.green;
    
    if (item.endsWith('.sh')) {
      fileIcon = '🔧';
      fileColor = colors.yellow;
    } else if (item.endsWith('.js')) {
      fileIcon = '📜';
      fileColor = colors.cyan;
    } else if (item.endsWith('.md')) {
      fileIcon = '📝';
      fileColor = colors.magenta;
    }
    
    console.log(`${indent}${fileColor}${fileIcon} ${item}${colors.reset}`);
    console.log(`${indent}   ${colors.dim}${description}${colors.reset}`);
  });
}

// Main function
function main() {
  const scriptsDir = path.dirname(__filename);
  
  console.log(`\n${colors.bright}${colors.magenta}=== Playwright Framework Scripts ===\n${colors.reset}`);
  
  // List all scripts
  listScriptsInDirectory(scriptsDir);
  
  console.log(`\n${colors.bright}${colors.green}Usage:${colors.reset}`);
  console.log(`  ${colors.yellow}./scripts/runners/run-tests.sh${colors.reset} - Run tests`);
  console.log(`  ${colors.yellow}node ./scripts/utils/framework-health-check.js${colors.reset} - Check framework health`);
  console.log(`  ${colors.yellow}./scripts/make-executable/make-scripts-executable.sh${colors.reset} - Make scripts executable\n`);
}

// Run the main function
main();