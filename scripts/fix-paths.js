#!/usr/bin/env node

/**
 * Fix Path References in Scripts
 * 
 * This script fixes path references in scripts after reorganization.
 */

const fs = require('fs');
const path = require('path');

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
        const pattern = `\\.\\/scripts\\/${script}`;
        const replacement = `\\.\\/scripts\\/runners\\/${script}`;
        if (content.includes(`./scripts/${script}`)) {
          content = content.replace(new RegExp(pattern, 'g'), replacement);
          modified = true;
        }
      });
      
      // Update references to scripts in the utils directory
      const utilScripts = [
        'framework-health-check.js', 'validate-framework.js', 'verify-framework.js',
        'verify-browsers.js', 'verify-docker.sh', 'env-check.js', 'cli-check.js'
      ];
      
      utilScripts.forEach(script => {
        const pattern = `\\.\\/scripts\\/${script}`;
        const replacement = `\\.\\/scripts\\/utils\\/${script}`;
        if (content.includes(`./scripts/${script}`)) {
          content = content.replace(new RegExp(pattern, 'g'), replacement);
          modified = true;
        }
      });
      
      // Update references to scripts in the setup directory
      const setupScripts = [
        'bootstrap.sh', 'post-bootstrap.sh', 'setup-all.sh',
        'setup-accessibility.js', 'setup-performance.js', 'setup-advanced-features.js'
      ];
      
      setupScripts.forEach(script => {
        const pattern = `\\.\\/scripts\\/${script}`;
        const replacement = `\\.\\/scripts\\/setup\\/${script}`;
        if (content.includes(`./scripts/${script}`)) {
          content = content.replace(new RegExp(pattern, 'g'), replacement);
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
        const pattern = `\\.\\/scripts\\/${script}`;
        const replacement = `\\.\\/scripts\\/make-executable\\/${script}`;
        if (content.includes(`./scripts/${script}`)) {
          content = content.replace(new RegExp(pattern, 'g'), replacement);
          modified = true;
        }
      });
      
    } else if (filePath.endsWith('.js')) {
      // For JavaScript files
      
      // Update require paths
      const scriptPaths = [
        { pattern: 'require\\(\'\\.\\.\/scripts\/', replacement: 'require(\'../' },
        { pattern: 'require\\(\'\\.\\/scripts\/', replacement: 'require(\'./' }
      ];
      
      scriptPaths.forEach(({ pattern, replacement }) => {
        if (content.match(new RegExp(pattern))) {
          content = content.replace(new RegExp(pattern, 'g'), replacement);
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
        const pattern = `require\\([\'\"]([^\'\"]*)${name}[\'\"]\\)`;
        const matches = content.match(new RegExp(pattern));
        
        if (matches && !matches[1].includes(dir)) {
          const newPath = matches[1].replace(/scripts\//, `scripts/${dir}`);
          content = content.replace(
            new RegExp(`require\\([\'\"](${matches[1]})${name}[\'\"]\\)`, 'g'),
            `require('${newPath}${name}')`
          );
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
  console.log('Fixing path references in scripts...');
  
  const scriptsDir = path.dirname(__filename);
  const updatedFiles = processDirectory(scriptsDir);
  
  console.log(`\nPath update complete. Updated ${updatedFiles} files.`);
}

// Run the main function
main();