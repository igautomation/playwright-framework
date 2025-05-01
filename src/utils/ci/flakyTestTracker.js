// src/utils/ci/flakyTestTracker.js

import { attachLog } from '../reporting/reportUtils.js';

class FlakyTestTracker {
  constructor() {
    this.testResults = new Map();
  }

  trackTest(testInfo, isFlaky) {
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
      attachLog(
        `Flaky test detected: ${testInfo.title} (Failures: ${results.failures}/${results.runs})`,
        'Flaky Test'
      );
    }
  }

  quarantineFlakyTests() {
    const flakyTests = [];
    for (const [testId, { runs, failures, isFlaky }] of this.testResults) {
      if (isFlaky || (runs >= 3 && failures / runs > 0.3)) {
        flakyTests.push(testId);
      }
    }
    return flakyTests;
  }
}

export default FlakyTestTracker;
