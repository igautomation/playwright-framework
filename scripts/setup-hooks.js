#!/usr/bin/env node

/**
 * Setup Git Hooks
 * 
 * This script sets up Git hooks for the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the Git hooks directory
const gitHooksDir = path.resolve(__dirname, '../.git/hooks');
const customHooksDir = path.resolve(__dirname, './hooks');

// Check if .git directory exists
if (!fs.existsSync(path.resolve(__dirname, '../.git'))) {
  console.error('Error: .git directory not found. Make sure you are in a Git repository.');
  process.exit(1);
}

// Create hooks directory if it doesn't exist
if (!fs.existsSync(gitHooksDir)) {
  fs.mkdirSync(gitHooksDir, { recursive: true });
}

// Copy pre-commit hook
const preCommitSource = path.join(customHooksDir, 'pre-commit');
const preCommitDest = path.join(gitHooksDir, 'pre-commit');

try {
  fs.copyFileSync(preCommitSource, preCommitDest);
  fs.chmodSync(preCommitDest, 0o755); // Make executable
  console.log('✅ Pre-commit hook installed successfully');
} catch (error) {
  console.error('Error installing pre-commit hook:', error);
  process.exit(1);
}

console.log('Git hooks setup complete!');