// src/utils/common/testSelector.js

/**
 * Test Selector Utility for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Select tests affected by Git diffs between two commits
 * - Identify both directly changed test files and indirectly affected tests
 * - Support smarter selective test execution in CI pipelines
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

class TestSelector {
  constructor() {}

  /**
   * Selects test files affected between two Git commits.
   *
   * @param {string} [baseCommit='origin/main'] - Base commit.
   * @param {string} [headCommit='HEAD'] - Head commit.
   * @returns {Array<string>} List of affected test file paths.
   */
  selectTestsByDiff(baseCommit = 'origin/main', headCommit = 'HEAD') {
    try {
      const diffOutput = execSync(
        `git diff --name-only ${baseCommit} ${headCommit}`,
        { encoding: 'utf8' }
      );
      const changedFiles = diffOutput.split('\n').filter(file => file.trim());

      const affectedTests = new Set();

      for (const file of changedFiles) {
        if (file.startsWith('src/tests/') && file.endsWith('.spec.js')) {
          affectedTests.add(file);
        } else {
          const relatedTests = this.findRelatedTests(file);
          relatedTests.forEach(test => affectedTests.add(test));
        }
      }

      return Array.from(affectedTests);
    } catch (error) {
      throw new Error(`Failed to select tests by diff: ${error.message}`);
    }
  }

  /**
   * Finds test files related to a changed file.
   *
   * @param {string} changedFile - Path to the changed source file.
   * @returns {Array<string>} List of test file paths.
   */
  findRelatedTests(changedFile) {
    const testFiles = [];
    const testDir = 'src/tests';

    if (!existsSync(testDir)) {
      return testFiles;
    }

    const walkDir = (dir) => {
      const files = readdirSync(dir);
      for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (filePath.endsWith('.spec.js')) {
          testFiles.push(filePath);
        }
      }
    };

    walkDir(testDir);

    // Return all tests for now; can enhance logic later
    return testFiles;
  }
}

export default TestSelector;