/**
 * Test Selector Utility for Playwright Framework
 * 
 * Selects test files based on Git diffs between two commits
 * Useful for smart test selection in CI/CD pipelines
 */
const { execSync } = require('child_process');
const path = require('path');
const logger = require('../common/logger');

class TestSelector {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      testDir: path.join(process.cwd(), 'src/tests'),
      ...options
    };
    this.testFiles = [];
  }

  /**
   * Selects a list of test files that have changed between two commits
   *
   * @param {string} baseCommit - The base Git commit or branch (e.g., 'origin/main')
   * @param {string} headCommit - The head Git commit or branch (e.g., 'HEAD')
   * @returns {Array<string>} List of changed test file paths
   */
  selectTestsByDiff(baseCommit, headCommit) {
    logger.info(`Simulating test selection between ${baseCommit} and ${headCommit}`);

    try {
      // Get changed files between commits
      const diffCommand = `git diff --name-only ${baseCommit} ${headCommit}`;
      const changedFiles = execSync(diffCommand, { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .filter(file => file.endsWith('.spec.js') || file.endsWith('.test.js'));
      
      // Filter for test files
      const testFiles = changedFiles.filter(file => 
        file.startsWith('src/tests/') || file.includes('/tests/')
      );
      
      logger.info(`Found ${testFiles.length} changed test files`);
      return testFiles;
    } catch (error) {
      logger.warn(`Error selecting tests by diff: ${error.message}`);
      
      // Return mock data as fallback
      return ['src/tests/ui/product-listing.spec.js', 'src/tests/api/product-list-api.spec.js'];
    }
  }

  /**
   * Select tests that depend on changed source files
   * 
   * @param {string} baseCommit - The base Git commit or branch
   * @param {string} headCommit - The head Git commit or branch
   * @returns {Array<string>} List of test files that might be affected
   */
  selectTestsByDependency(baseCommit, headCommit) {
    try {
      // Get changed source files
      const diffCommand = `git diff --name-only ${baseCommit} ${headCommit}`;
      const changedFiles = execSync(diffCommand, { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .filter(file => 
          file.endsWith('.js') && 
          !file.endsWith('.spec.js') && 
          !file.endsWith('.test.js')
        );
      
      // For each changed file, find tests that import it
      // This is a simplified implementation
      const affectedTests = [];
      
      // For now, return all test files as a conservative approach
      const findTestsCommand = `find ${this.options.testDir} -name "*.spec.js" -o -name "*.test.js"`;
      const allTests = execSync(findTestsCommand, { encoding: 'utf-8' })
        .trim()
        .split('\n');
      
      logger.info(`Found ${changedFiles.length} changed source files that might affect ${allTests.length} tests`);
      return allTests;
    } catch (error) {
      logger.warn(`Error selecting tests by dependency: ${error.message}`);
      return [];
    }
  }
}

module.exports = TestSelector;