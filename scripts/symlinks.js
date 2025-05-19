#!/usr/bin/env node

/**
 * Create Symlinks for Backward Compatibility
 * 
 * This script creates symlinks in the root scripts directory to maintain
 * backward compatibility with scripts that might reference the old paths.
 */

const fs = require('fs');
const path = require('path');

// Define the directories and their key files
const directories = [
  { dir: 'runners', files: ['run-tests.sh', 'run-all-tests.sh', 'run-api-tests.sh'] },
  { dir: 'utils', files: ['framework-health-check.js', 'verify-framework.js'] },
  { dir: 'setup', files: ['bootstrap.sh', 'setup-all.sh'] },
  { dir: 'make-executable', files: ['make-scripts-executable.sh'] }
];

// Function to create a symlink
function createSymlink(targetPath, linkPath) {
  try {
    // Check if the link already exists
    if (fs.existsSync(linkPath)) {
      console.log(`Symlink already exists: ${linkPath}`);
      return;
    }
    
    // Create the symlink
    fs.symlinkSync(targetPath, linkPath, 'file');
    console.log(`Created symlink: ${linkPath} -> ${targetPath}`);
  } catch (error) {
    console.error(`Error creating symlink ${linkPath}: ${error.message}`);
  }
}

// Main function
function createSymlinks() {
  console.log('Creating symlinks for backward compatibility...\n');
  
  directories.forEach(({ dir, files }) => {
    files.forEach(file => {
      const targetPath = path.join(__dirname, dir, file);
      const linkPath = path.join(__dirname, file);
      
      // Check if the target file exists
      if (fs.existsSync(targetPath)) {
        createSymlink(targetPath, linkPath);
      } else {
        console.error(`Target file does not exist: ${targetPath}`);
      }
    });
  });
  
  console.log('\nSymlink creation complete.');
}

// Run the main function
createSymlinks();