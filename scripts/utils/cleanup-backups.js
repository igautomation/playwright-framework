#!/usr/bin/env node

/**
 * Cleanup Backup Files
 * 
 * This script removes backup test files after successful consolidation
 */

const fs = require('fs');
const path = require('path');

// Define backup directories to clean up
const backupDirs = [
  './src/tests/accessibility/backup',
  './src/tests/ui/backup',
  './src/tests/visual/backup',
  './src/tests/integration/backup'
];

// Function to remove a directory and its contents
function removeDirectory(dir) {
  if (fs.existsSync(dir)) {
    console.log(`Removing backup directory: ${dir}`);
    
    // List files in the directory
    const files = fs.readdirSync(dir);
    
    // Log files being removed
    if (files.length > 0) {
      console.log(`Files to be removed:`);
      files.forEach(file => console.log(`- ${path.join(dir, file)}`));
    }
    
    // Remove files
    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.unlinkSync(filePath);
    });
    
    // Remove directory
    fs.rmdirSync(dir);
    console.log(`Directory removed: ${dir}`);
  } else {
    console.log(`Directory not found: ${dir}`);
  }
}

// Main function
function main() {
  console.log('Starting backup cleanup...\n');
  
  // Ask for confirmation
  console.log('WARNING: This will permanently delete all backup test files.');
  console.log('Make sure you have verified the consolidated tests are working correctly.');
  console.log('To proceed, set the CONFIRM_CLEANUP environment variable to "yes".');
  
  if (process.env.CONFIRM_CLEANUP !== 'yes') {
    console.log('\nCleanup aborted. Set CONFIRM_CLEANUP=yes to proceed.');
    return;
  }
  
  // Remove backup directories
  backupDirs.forEach(removeDirectory);
  
  console.log('\nBackup cleanup complete!');
}

// Run the script
main();