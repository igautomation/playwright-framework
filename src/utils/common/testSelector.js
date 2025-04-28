// src/utils/ci/testSelector.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Utility to select tests based on Git diff for PRs
 */
function TestSelector() {}

/**
 * Selects tests affected by the Git diff between two commits
 * @param {string} baseCommit - Base commit (e.g., 'origin/main')
 * @param {string} headCommit - Head commit (e.g., 'HEAD')
 * @returns {Array} List of affected test files
 * @throws {Error} If diff fails
 */
TestSelector.prototype.selectTestsByDiff = function (baseCommit = 'origin/main', headCommit = 'HEAD') {
  try {
    const diffOutput = execSync(`git diff --name-only ${baseCommit} ${headCommit}`, { encoding: 'utf8' });
    const changedFiles = diffOutput.split('\n').filter(file => file.trim());

    const affectedTests = new Set();
    for (const file of changedFiles) {
      // Check if the changed file is a test file
      if (file.startsWith('src/tests/') && file.endsWith('.spec.js')) {
        affectedTests.add(file);
      } else {
        // Find tests that might depend on the changed file
        const testFiles = this.findRelatedTests(file);
        testFiles.forEach(test => affectedTests.add(test));
      }
    }

    return Array.from(affectedTests);
  } catch (error) {
    throw new Error(`Failed to select tests by diff: ${error.message}`);
  }
};

/**
 * Finds test files related to a changed file (heuristic)
 * @param {string} changedFile - Path to the changed file
 * @returns {Array} List of related test files
 */
TestSelector.prototype.findRelatedTests = function (changedFile) {
  const testFiles = [];
  const testDir = 'src/tests';

  if (!fs.existsSync(testDir)) return testFiles;

  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (filePath.endsWith('.spec.js')) {
        testFiles.push(filePath);
      }
    }
  };

  walkDir(testDir);
  // Heuristic: Include all tests for simplicity; improve with dependency mapping if needed
  return testFiles;
};

module.exports = TestSelector;