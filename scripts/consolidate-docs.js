#!/usr/bin/env node

/**
 * Script to consolidate all Markdown files in the project into a single organized folder
 * Creates copies of the files without modifying the originals
 * Excludes node_modules and test result error-context files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = process.cwd();
const targetDir = path.join(rootDir, 'consolidated-docs');
const excludeDirs = [
  'node_modules',
  'test-results',
  'reports/test-results',
  'playwright-report/data',
  'reports/html/data'
];

// Create target directory structure
function createDirectoryStructure() {
  console.log('Creating consolidated documentation directory...');
  
  // Main documentation directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }
}

// Check if a path should be excluded
function shouldExclude(filePath) {
  return excludeDirs.some(dir => filePath.includes(dir)) || 
         filePath.includes('error-context.md');
}

// Generate a unique filename to avoid conflicts
function generateUniqueFilename(targetPath, originalPath) {
  // Extract directory structure relative to project root
  const relPath = originalPath.replace(rootDir, '').replace(/^\//, '');
  const dirParts = path.dirname(relPath).split(path.sep).filter(Boolean);
  
  // Create a filename that includes the directory structure
  const baseName = path.basename(originalPath, '.md');
  const extension = path.extname(originalPath);
  
  // Join directory parts with hyphens for the filename
  const dirPrefix = dirParts.length > 0 ? dirParts.join('-') + '-' : '';
  let fileName = `${dirPrefix}${baseName}${extension}`;
  
  // Replace special characters with hyphens
  fileName = fileName.replace(/[\/\\:*?"<>|]/g, '-');
  
  // Handle duplicates
  let counter = 1;
  let newPath = path.join(targetPath, fileName);
  
  while (fs.existsSync(newPath)) {
    newPath = path.join(targetPath, `${dirPrefix}${baseName}-${counter}${extension}`);
    counter++;
  }
  
  return path.basename(newPath);
}

// Copy a file to the target directory
function copyFileToTarget(sourcePath) {
  if (shouldExclude(sourcePath)) {
    return;
  }
  
  const uniqueFileName = generateUniqueFilename(targetDir, sourcePath);
  const targetFilePath = path.join(targetDir, uniqueFileName);
  
  try {
    // Read the source file
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    // Add source path as a comment at the top of the file
    const contentWithSource = `<!-- Source: ${sourcePath} -->\n\n${content}`;
    
    // Write to the target file
    fs.writeFileSync(targetFilePath, contentWithSource);
    console.log(`Copied: ${sourcePath} -> ${targetFilePath}`);
  } catch (error) {
    console.error(`Error copying ${sourcePath}: ${error.message}`);
  }
}

// Find and copy all markdown files
function findAndCopyMarkdownFiles() {
  console.log('Finding and copying Markdown files...');
  
  try {
    // Use find command to get all markdown files
    const cmd = `find ${rootDir} -name "*.md" | grep -v "node_modules" | sort`;
    const files = execSync(cmd, { encoding: 'utf8' }).split('\n').filter(Boolean);
    
    files.forEach(filePath => {
      copyFileToTarget(filePath);
    });
    
    console.log(`\nConsolidation complete! Files copied to: ${targetDir}`);
  } catch (error) {
    console.error(`Error finding Markdown files: ${error.message}`);
  }
}

// Create index file with links to all documents
function createIndexFile() {
  console.log('Creating index file...');
  
  let indexContent = '# Documentation Index\n\n';
  const files = fs.readdirSync(targetDir)
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .sort();
  
  files.forEach(file => {
    const displayName = file.replace('.md', '').replace(/-/g, ' ');
    indexContent += `- [${displayName}](${file})\n`;
  });
  
  fs.writeFileSync(path.join(targetDir, 'index.md'), indexContent);
  console.log(`Created index file: ${path.join(targetDir, 'index.md')}`);
}

// Main execution
function main() {
  console.log('Starting documentation consolidation...');
  createDirectoryStructure();
  findAndCopyMarkdownFiles();
  createIndexFile();
}

main();