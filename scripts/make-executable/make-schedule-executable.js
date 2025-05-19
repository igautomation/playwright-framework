#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the CLI script
const cliPath = path.resolve(__dirname, '../src/cli/schedule.js');

// Make the script executable
try {
  fs.chmodSync(cliPath, '755');
  console.log(`✅ Made ${cliPath} executable`);
} catch (error) {
  console.error(`❌ Failed to make ${cliPath} executable:`, error);
  process.exit(1);
}

// Create a symlink in node_modules/.bin for easier access
try {
  const binDir = path.resolve(__dirname, '../node_modules/.bin');
  const symlinkPath = path.join(binDir, 'schedule');
  
  // Create bin directory if it doesn't exist
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }
  
  // Remove existing symlink if it exists
  if (fs.existsSync(symlinkPath)) {
    fs.unlinkSync(symlinkPath);
  }
  
  // Create symlink
  fs.symlinkSync(cliPath, symlinkPath);
  console.log(`✅ Created symlink at ${symlinkPath}`);
} catch (error) {
  console.error('❌ Failed to create symlink:', error);
}

// Add to package.json bin section
try {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = require(packageJsonPath);
  
  // Add or update bin section
  packageJson.bin = packageJson.bin || {};
  packageJson.bin.schedule = 'src/cli/schedule.js';
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json bin section');
  
  // Suggest npm link
  console.log('\n📌 To make the CLI globally available, run:');
  console.log('   npm link');
  console.log('\n📌 Then you can use it as:');
  console.log('   schedule [command] [options]');
} catch (error) {
  console.error('❌ Failed to update package.json:', error);
}