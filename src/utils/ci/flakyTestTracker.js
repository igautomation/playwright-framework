// src/utils/ci/flakyTestTracker.js
const ReportUtils = require('../reporting/reportUtils');

/**
 * Utility to track and quarantine flaky tests
 */
function FlakyTestTracker() {
  this.report = new ReportUtils();
  this.testResults = new Map();
}

/**
 * Tracks test results to identify flakiness
 * @param {Object} testInfo - Playwright test info object
 * @param {boolean} isFlaky - Whether the test is marked as flaky (@flaky tag)
 * @returns {void}
 */
FlakyTestTracker.prototype.trackTest = function (testInfo, isFlaky) {
  const testId = `${testInfo.title}-${testInfo.file}`;
  let results = this.testResults.get(testId) || { runs: 0, failures: 0, isFlaky };
  results.runs++;
  if (testInfo.status !== 'passed') results.failures++;
  this.testResults.set(testId, results);

  if (results.failures > 0 && results.runs > 1) {
    this.report.attachLog(
      `Flaky test detected: ${testInfo.title} (Failures: ${results.failures}/${results.runs})`,
      'Flaky Test'
    );
  }
};

/**
 * Quarantines flaky tests (e.g., skips in CI)
 * @returns {Array} List of flaky test IDs to skip
 */
FlakyTestTracker.prototype.quarantineFlakyTests = function () {
  const flakyTests = [];
  for (const [testId, { runs, failures, isFlaky }] of this.testResults) {
    if (isFlaky || (runs >= 3 && failures / runs > 0.3)) { // Flaky if fails > 30% after 3 runs
      flakyTests.push(testId);
    }
  }
  return flakyTests;
};

module.exports = FlakyTestTracker;