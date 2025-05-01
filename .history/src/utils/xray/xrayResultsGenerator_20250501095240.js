// src/utils/xray/xrayResultsGenerator.js

import fs from 'fs-extra';
import path from 'path';
import logger from '../common/logger.js';

// Load paths and config from environment variables or fallback to default
const resultsPath = process.env.PW_RESULTS_PATH || 'playwright-report/results.json';
const mappingPath = process.env.TEST_MAPPING_PATH || 'src/config/test-mapping.json';
const outputPath = process.env.XRAY_OUTPUT_PATH || 'reports/xray-results.json';

// Converts Playwright status to Xray-compatible status
function convertStatus(status) {
  return status === 'passed' ? 'PASSED' : status === 'failed' ? 'FAILED' : 'SKIPPED';
}

// Main function to generate Xray results file
export async function generateXrayResults() {
  try {
    // Check if the Playwright test results file exists
    if (!fs.existsSync(resultsPath)) {
      throw new Error('Missing Playwright results file: ' + resultsPath);
    }

    // Check if the test mapping file exists
    if (!fs.existsSync(mappingPath)) {
      throw new Error('Missing test mapping file: ' + mappingPath);
    }

    // Load test result and mapping content
    const resultsData = await fs.readJson(resultsPath);
    const testMapping = await fs.readJson(mappingPath);

    const tests = [];

    // Traverse test results and apply mapping dynamically
    resultsData.suites.forEach((suite) => {
      suite.specs.forEach((spec) => {
        const fullTitle = spec.title;

        // Match the title to a Jira testKey in mapping
        const testKey = testMapping[fullTitle];

        if (!testKey) {
          logger.warn(`Unmapped test skipped: "${fullTitle}"`);
          return;
        }

        tests.push({
          testKey: testKey,
          status: convertStatus(spec.status),
          start: new Date(spec.startTime).toISOString(),
          finish: new Date(spec.endTime).toISOString(),
          comment: spec.error ? spec.error.message : 'Test completed'
        });
      });
    });

    const payload = {
      info: {
        summary: process.env.XRAY_SUMMARY || 'Playwright execution results',
        description: process.env.XRAY_DESCRIPTION || 'Framework auto-generated Xray payload',
        user: process.env.XRAY_USER || 'automation-bot',
        startDate: new Date().toISOString(),
        finishDate: new Date().toISOString()
      },
      tests: tests
    };

    await fs.outputJson(outputPath, payload, { spaces: 2 });

    logger.info('✅ Xray results written to: ' + outputPath);

  } catch (error) {
    logger.error('❌ Error generating Xray results: ' + error.message);
    process.exit(1);
  }
}
