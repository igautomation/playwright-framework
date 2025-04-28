// src/utils/common/testSelector.js

/**
 * Test Selector Utility for Playwright Framework.
 *
 * Responsibilities:
 * - Select tests affected by Git diffs between two commits
 * - Identify both directly changed test files and indirectly affected tests
 * - Support smarter selective test execution in CI pipelines
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Constructor for TestSelector utility.
 */
function TestSelector() {}

/**
 * Selects test files affected between two Git commits.
 *
 * @param {string} [baseCommit='origin/main'] - Base commit (e.g., origin/main).
 * @param {string} [headCommit='HEAD'] - Head commit (e.g., HEAD).
 * @returns {Array<string>} - List of affected test file paths.
 * @throws {Error} If Git diff operation fails.
 */
TestSelector.prototype.selectTestsByDiff = function (
  baseCommit = "origin/main",
  headCommit = "HEAD"
) {
  try {
    const diffOutput = execSync(
      `git diff --name-only ${baseCommit} ${headCommit}`,
      { encoding: "utf8" }
    );
    const changedFiles = diffOutput.split("\n").filter((file) => file.trim());

    const affectedTests = new Set();

    for (const file of changedFiles) {
      // Directly changed test files
      if (file.startsWith("src/tests/") && file.endsWith(".spec.js")) {
        affectedTests.add(file);
      } else {
        // Related tests based on changed source files
        const testFiles = this.findRelatedTests(file);
        testFiles.forEach((test) => affectedTests.add(test));
      }
    }

    return Array.from(affectedTests);
  } catch (error) {
    throw new Error(`Failed to select tests by diff: ${error.message}`);
  }
};

/**
 * Finds test files related to a changed file.
 *
 * Currently uses a simple heuristic: include all test files under src/tests/.
 * (Can be improved with dependency mapping if needed)
 *
 * @param {string} changedFile - Path to the changed source file.
 * @returns {Array<string>} - List of test file paths.
 */
TestSelector.prototype.findRelatedTests = function (changedFile) {
  const testFiles = [];
  const testDir = "src/tests";

  if (!fs.existsSync(testDir)) {
    return testFiles;
  }

  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (filePath.endsWith(".spec.js")) {
        testFiles.push(filePath);
      }
    }
  };

  walkDir(testDir);

  // Return all tests for now; can enhance logic in future
  return testFiles;
};

module.exports = TestSelector;
