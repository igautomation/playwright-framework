# Git Utilities

This directory contains utilities for Git operations in the Playwright framework.

## Core Files

- `gitUtils.js` - Git utility for various Git operations
- `index.js` - Exports all git utilities

## Features

- Repository cloning
- Branch management
- Commit operations
- Status checking
- File change tracking
- Tag management

## Usage

```javascript
// Import all utilities
const git = require('../src/utils/git');

// Or import specific utilities
const { GitUtils } = require('../src/utils/git');

// Create a git utility instance
const gitUtils = new GitUtils({
  cwd: '/path/to/repo'
});

// Clone a repository
gitUtils.clone('https://github.com/example/repo.git', './destination', {
  depth: 1,
  branch: 'main'
});

// Check out a branch
gitUtils.checkout('feature/new-feature', {
  create: true
});

// Get repository status
const status = gitUtils.status({
  short: true
});

// Pull updates
gitUtils.pull('main', {
  rebase: true
});

// Commit changes
gitUtils.commit('Add new feature', {
  amend: false
});

// Push changes
gitUtils.push('feature/new-feature', {
  setUpstream: true
});

// Get current branch
const currentBranch = gitUtils.getCurrentBranch();

// Get list of branches
const branches = gitUtils.getBranches({
  remote: true
});

// Get last commit hash
const commitHash = gitUtils.getLastCommitHash();

// Get changed files
const changedFiles = gitUtils.getChangedFiles('HEAD~1');

// Check if repository is clean
const isClean = gitUtils.isClean();

// Create a tag
gitUtils.createTag('v1.0.0', 'Version 1.0.0 release');
```