/**
 * Flaky Test Tracker for Playwright Framework
 * 
 * Tracks flaky tests and provides utilities for managing them
 */
const fs = require('fs');
const path = require('path');

/**
 * Flaky Test Tracker class
 */
class FlakyTestTracker {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      dataDir: path.join(process.cwd(), 'reports/flaky-tests'),
      ...options
    };
    
    this.testResults = new Map();
    
    // Ensure data directory exists
    if (!fs.existsSync(this.options.dataDir)) {
      fs.mkdirSync(this.options.dataDir, { recursive: true });
    }
  }

  /**
   * Track test result
   * @param {Object} testInfo - Test information
   * @param {boolean} isFlaky - Whether the test is known to be flaky
   */
  trackTest(testInfo, isFlaky = false) {
    const testId = `${testInfo.title}-${testInfo.file}`;

    let results = this.testResults.get(testId) || {
      runs: 0,
      failures: 0,
      isFlaky
    };

    results.runs++;
    if (testInfo.status !== 'passed') {
      results.failures++;
    }

    this.testResults.set(testId, results);

    if (results.failures > 0 && results.runs > 1) {
      console.log(`Flaky test detected: ${testInfo.title} (Failures: ${results.failures}/${results.runs})`);
    }
  }

  /**
   * Get flaky tests
   * @returns {Array<string>} Flaky test IDs
   */
  getFlakyTests() {
    const flakyTests = [];
    for (const [testId, { runs, failures, isFlaky }] of this.testResults) {
      if (isFlaky || (runs >= 3 && failures / runs > 0.3)) {
        flakyTests.push(testId);
      }
    }
    return flakyTests;
  }
  
  /**
   * Save flaky tests to file
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} Path to saved file
   */
  async saveFlakyTests(outputPath) {
    const flakyTests = this.getFlakyTests();
    
    const data = {
      timestamp: new Date().toISOString(),
      flakyTests: flakyTests,
      testResults: Array.from(this.testResults.entries()).map(([id, results]) => ({
        id,
        ...results
      }))
    };
    
    const filePath = outputPath || path.join(this.options.dataDir, 'flaky-tests.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return filePath;
  }
}

module.exports = FlakyTestTracker;