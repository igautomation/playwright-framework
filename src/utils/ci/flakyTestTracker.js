// src/utils/ci/flakyTestTracker.js

/**
 * Flaky Test Tracker Utility for Playwright Framework.
 *
 * Responsibilities:
 * - Track test execution status over multiple runs
 * - Detect and quarantine flaky tests based on failure rates
 * - Log flaky detections for reporting and debugging
 */

const ReportUtils = require("../reporting/reportUtils");

/**
 * Constructor for FlakyTestTracker.
 */
function FlakyTestTracker() {
  this.report = new ReportUtils();
  this.testResults = new Map();
}

/**
 * Tracks an individual test's execution result.
 *
 * @param {Object} testInfo - Playwright test information object.
 * @param {boolean} isFlaky - Whether the test was pre-marked as flaky (e.g., via a @flaky tag).
 */
FlakyTestTracker.prototype.trackTest = function (testInfo, isFlaky) {
  const testId = `${testInfo.title}-${testInfo.file}`;

  // Retrieve existing stats or initialize
  let results = this.testResults.get(testId) || {
    runs: 0,
    failures: 0,
    isFlaky,
  };

  results.runs++;
  if (testInfo.status !== "passed") {
    results.failures++;
  }

  this.testResults.set(testId, results);

  // Log flaky behavior if failures detected over multiple runs
  if (results.failures > 0 && results.runs > 1) {
    this.report.attachLog(
      `Flaky test detected: ${testInfo.title} (Failures: ${results.failures}/${results.runs})`,
      "Flaky Test"
    );
  }
};

/**
 * Quarantines tests identified as flaky.
 *
 * Criteria:
 * - Explicitly marked flaky via tag
 * - OR Failure rate > 30% after at least 3 test runs
 *
 * @returns {Array} - List of flaky test IDs to be skipped/quarantined.
 */
FlakyTestTracker.prototype.quarantineFlakyTests = function () {
  const flakyTests = [];

  for (const [testId, { runs, failures, isFlaky }] of this.testResults) {
    if (isFlaky || (runs >= 3 && failures / runs > 0.3)) {
      flakyTests.push(testId);
    }
  }

  return flakyTests;
};

module.exports = FlakyTestTracker;
