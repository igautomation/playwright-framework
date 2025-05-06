/**
 * Script to run all Playwright examples
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get all example files
const exampleDir = __dirname;
const exampleFiles = fs.readdirSync(exampleDir)
  .filter(file => file.endsWith('-example.js'));

console.log(`Found ${exampleFiles.length} example files to run\n`);

// Run each example
exampleFiles.forEach((file, index) => {
  const filePath = path.join(exampleDir, file);
  console.log(`\n[${index + 1}/${exampleFiles.length}] Running ${file}...`);
  console.log('='.repeat(80));
  
  try {
    execSync(`node "${filePath}"`, { stdio: 'inherit' });
    console.log(`\n✅ ${file} completed successfully`);
  } catch (error) {
    console.error(`\n❌ ${file} failed with error: ${error.message}`);
  }
  
  console.log('='.repeat(80));
});

console.log('\nAll examples have been run');
