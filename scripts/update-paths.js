#!/usr/bin/env node

/**
 * Update Path References in Scripts
 * 
 * This script updates path references in all scripts to reflect the new directory structure.
 * It handles both shell scripts and JavaScript files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to update paths in a file
function updatePathsInFile(filePath) {
  console.log(`Updating paths in ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Update paths based on file type
    if (filePath.endsWith('.sh')) {
      // For shell scripts
      
      // Update references to scripts in the runners directory
      const runnerScripts = [
        'run-tests.sh', 'run-all-tests.sh', 'run-api-tests.sh', 'run-ui-tests.sh',
        'run-visual-tests.sh', 'run-combined-tests.sh', 'run-e2e-tests.sh',
        'run-localization-tests.sh', 'run-performance-tests.sh', 'run-demo-tests.sh',
        'run-demo-verify-tests.sh', 'run-all.sh', 'run-and-fix-tests.sh',
        'run-tests-one-by-one.sh', 'run-src-tests-one-by-one.sh'
      ];
      
      runnerScripts.forEach(script => {
        const regex = new RegExp(`(\\.\\/|\\s+|=)${script}`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `$1runners/${script}`);
          modified = true;
        }
      });
      
      // Update references to scripts in the utils directory
      const utilScripts = [
        'framework-health-check.js', 'validate-framework.js', 'verify-framework.js',
        'verify-browsers.js', 'verify-docker.sh', 'env-check.js', 'cli-check.js'
      ];
      
      utilScripts.forEach(script => {
        const regex = new RegExp(`(\\.\\/|\\s+|=)${script}`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `$1utils/${script}`);
          modified = true;
        }
      });
      
      // Update references to scripts in the setup directory
      const setupScripts = [
        'bootstrap.sh', 'post-bootstrap.sh', 'setup-all.sh',
        'setup-accessibility.js', 'setup-performance.js', 'setup-advanced-features.js'
      ];
      
      setupScripts.forEach(script => {
        const regex = new RegExp(`(\\.\\/|\\s+|=)${script}`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `$1setup/${script}`);
          modified = true;
        }
      });
      
      // Update references to scripts in the make-executable directory
      const makeExecutableScripts = [
        'make-scripts-executable.sh', 'make-list-tests-executable.sh',
        'make-ui-tests-executable.sh', 'make-visual-tests-executable.sh',
        'make-docker-verify-executable.sh', 'make-all-docker-scripts-executable.sh',
        'make-performance-script-executable.sh'
      ];
      
      makeExecutableScripts.forEach(script => {
        const regex = new RegExp(`(\\.\\/|\\s+|=)${script}`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `$1make-executable/${script}`);
          modified = true;
        }
      });
      
    } else if (filePath.endsWith('.js')) {
      // For JavaScript files
      
      // Update require/import paths
      const scriptPaths = [
        { old: '../scripts/', new: '../' },
        { old: './scripts/', new: './' },
        { old: "require('./", new: "require('./" },
        { old: "require('../", new: "require('../" }
      ];
      
      scriptPaths.forEach(({ old, new: newPath }) => {
        if (content.includes(old)) {
          // Don't replace paths that already include subdirectories
          const regex = new RegExp(`${old}(?!utils/|runners/|setup/|make-executable/)`, 'g');
          content = content.replace(regex, newPath);
          modified = true;
        }
      });
      
      // Update specific script references
      const jsScriptMappings = [
        { name: 'framework-health-check.js', dir: 'utils/' },
        { name: 'validate-framework.js', dir: 'utils/' },
        { name: 'verify-framework.js', dir: 'utils/' },
        { name: 'env-check.js', dir: 'utils/' },
        { name: 'cli-check.js', dir: 'utils/' },
        { name: 'run-ui-tests.js', dir: 'runners/' },
        { name: 'run-tests-one-by-one.js', dir: 'runners/' },
        { name: 'run-src-tests-one-by-one.js', dir: 'runners/' },
        { name: 'setup-accessibility.js', dir: 'setup/' },
        { name: 'setup-performance.js', dir: 'setup/' },
        { name: 'setup-advanced-features.js', dir: 'setup/' }
      ];
      
      jsScriptMappings.forEach(({ name, dir }) => {
        const regex = new RegExp(`(['"])(?!\\.\\/utils\\/|\\.\\/${dir})(.\\/)?(${name})(['"])`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `$1./${dir}$3$4`);
          modified = true;
        }
      });
    }
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated paths in ${filePath}`);
      return true;
    } else {
      console.log(`No path updates needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating paths in ${filePath}:`, error);
    return false;
  }
}

// Function to recursively process all files in a directory
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let updatedFiles = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    
    if (fs.statSync(fullPath).isDirectory()) {
      // Process subdirectory
      updatedFiles += processDirectory(fullPath);
    } else if (item.endsWith('.sh') || item.endsWith('.js')) {
      // Update paths in script file
      if (updatePathsInFile(fullPath)) {
        updatedFiles++;
      }
    }
  });
  
  return updatedFiles;
}

// Main function
function main() {
  console.log('Updating path references in scripts...');
  
  const scriptsDir = path.dirname(__filename);
  const updatedFiles = processDirectory(scriptsDir);
  
  console.log(`\nPath update complete. Updated ${updatedFiles} files.`);
}

// Run the main function
main();