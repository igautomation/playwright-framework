const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

/**
 * Xray Results Generator class for generating Xray-compatible test results
 */
class XrayResultsGenerator {
  /**
   * Constructor
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.config = {
      outputDir: path.resolve(process.cwd(), 'reports/xray'),
      projectKey: process.env.JIRA_PROJECT_KEY || 'TEST',
      testPlanKey: process.env.XRAY_TEST_PLAN_KEY || '',
      testEnvironments: process.env.XRAY_TEST_ENVIRONMENTS?.split(',') || [],
      resultsPath: process.env.PW_RESULTS_PATH || 'playwright-report/results.json',
      mappingPath: process.env.TEST_MAPPING_PATH || 'src/config/test-mapping.json',
      outputPath: process.env.XRAY_OUTPUT_PATH || 'reports/xray-results.json',
      ...config,
    };

    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Generate Xray JSON test results
   * @param {Array<Object>} testResults - Test results
   * @param {Object} options - Options
   * @returns {Promise<string>} Path to the generated file
   */
  async generateXrayJson(testResults, options = {}) {
    try {
      logger.info('Generating Xray JSON test results');

      const timestamp = new Date().toISOString();

      // Create Xray JSON structure
      const xrayJson = {
        info: {
          summary: options.summary || `Test Execution - ${timestamp}`,
          description:
            options.description || 'Automated test execution results',
          project: this.config.projectKey,
          version: options.version || '1.0',
          revision: options.revision || '1',
          testPlanKey: options.testPlanKey || this.config.testPlanKey,
          testEnvironments:
            options.testEnvironments || this.config.testEnvironments,
        },
        tests: testResults.map((result) => this.formatTestResult(result)),
      };

      // Write to file
      const outputFile = path.join(
        this.config.outputDir,
        `xray-results-${timestamp.replace(/[:.]/g, '-')}.json`
      );
      fs.writeFileSync(outputFile, JSON.stringify(xrayJson, null, 2));

      logger.info(`Xray JSON test results generated at ${outputFile}`);
      return outputFile;
    } catch (error) {
      logger.error('Failed to generate Xray JSON test results', error);
      throw error;
    }
  }

  /**
   * Format a test result for Xray
   * @param {Object} result - Test result
   * @returns {Object} Formatted test result
   */
  formatTestResult(result) {
    // Extract test key from test name if available
    const testKeyMatch = result.name.match(/\b([A-Z]+-\d+)\b/);
    const testKey = testKeyMatch ? testKeyMatch[1] : null;

    return {
      testKey: result.testKey || testKey,
      start: result.start || new Date().toISOString(),
      finish: result.finish || new Date().toISOString(),
      comment: result.comment || '',
      status: this.mapStatus(result.status),
      examples: result.examples || [],
      defects: result.defects || [],
      evidence: this.formatEvidence(result.evidence || []),
    };
  }

  /**
   * Map test status to Xray status
   * @param {string} status - Test status
   * @returns {string} Xray status
   */
  mapStatus(status) {
    const statusMap = {
      passed: 'PASSED',
      failed: 'FAILED',
      skipped: 'SKIPPED',
      pending: 'PENDING',
      undefined: 'FAILED',
      ambiguous: 'FAILED',
      unknown: 'FAILED',
    };

    return statusMap[status?.toLowerCase()] || 'FAILED';
  }

  /**
   * Format evidence for Xray
   * @param {Array<Object>} evidence - Evidence items
   * @returns {Array<Object>} Formatted evidence
   */
  formatEvidence(evidence) {
    return evidence.map((item) => {
      if (typeof item === 'string') {
        // If item is a string, assume it's a file path
        const filename = path.basename(item);
        const data = fs.readFileSync(item, 'base64');

        return {
          filename,
          data,
          contentType: this.getContentType(filename),
        };
      }

      return item;
    });
  }

  /**
   * Get content type from filename
   * @param {string} filename - Filename
   * @returns {string} Content type
   */
  getContentType(filename) {
    const extension = path.extname(filename).toLowerCase();

    const contentTypeMap = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.txt': 'text/plain',
      '.log': 'text/plain',
      '.csv': 'text/csv',
    };

    return contentTypeMap[extension] || 'application/octet-stream';
  }

  /**
   * Generate Cucumber JSON test results for Xray
   * @param {Array<Object>} testResults - Test results
   * @param {Object} options - Options
   * @returns {Promise<string>} Path to the generated file
   */
  async generateCucumberJson(testResults, options = {}) {
    try {
      logger.info('Generating Cucumber JSON test results for Xray');

      const timestamp = new Date().toISOString();

      // Create Cucumber JSON structure
      const cucumberJson = testResults.map((result) => ({
        id: result.id || `test-${Math.random().toString(36).substring(2, 9)}`,
        name: result.name,
        keyword: result.keyword || 'Feature',
        uri:
          result.uri ||
          `test-${Math.random().toString(36).substring(2, 9)}.feature`,
        tags: result.tags || [],
        elements: [
          {
            id: `${result.id || 'test'}-scenario`,
            name: result.scenarioName || result.name,
            keyword: 'Scenario',
            type: 'scenario',
            steps: result.steps || [
              {
                keyword: 'Given ',
                name: 'test step',
                result: {
                  status: result.status || 'passed',
                  duration: result.duration || 0,
                },
              },
            ],
          },
        ],
      }));

      // Write to file
      const outputFile = path.join(
        this.config.outputDir,
        `cucumber-results-${timestamp.replace(/[:.]/g, '-')}.json`
      );
      fs.writeFileSync(outputFile, JSON.stringify(cucumberJson, null, 2));

      logger.info(`Cucumber JSON test results generated at ${outputFile}`);
      return outputFile;
    } catch (error) {
      logger.error(
        'Failed to generate Cucumber JSON test results for Xray',
        error
      );
      throw error;
    }
  }

  /**
   * Generate JUnit XML test results for Xray
   * @param {Array<Object>} testResults - Test results
   * @param {Object} options - Options
   * @returns {Promise<string>} Path to the generated file
   */
  async generateJUnitXml(testResults, options = {}) {
    try {
      logger.info('Generating JUnit XML test results for Xray');

      const timestamp = new Date().toISOString();

      // Create JUnit XML structure
      let junitXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      junitXml += '<testsuites>\n';

      // Group tests by test suite
      const testSuites = {};
      testResults.forEach((result) => {
        const suiteName = result.suite || 'Default Suite';
        if (!testSuites[suiteName]) {
          testSuites[suiteName] = [];
        }
        testSuites[suiteName].push(result);
      });

      // Generate XML for each test suite
      Object.entries(testSuites).forEach(([suiteName, suiteTests]) => {
        const failures = suiteTests.filter(
          (test) => test.status === 'failed'
        ).length;
        const errors = suiteTests.filter(
          (test) => test.status === 'error'
        ).length;
        const skipped = suiteTests.filter(
          (test) => test.status === 'skipped'
        ).length;
        const total = suiteTests.length;

        junitXml += `  <testsuite name="${suiteName}" tests="${total}" failures="${failures}" errors="${errors}" skipped="${skipped}">\n`;

        // Generate XML for each test case
        suiteTests.forEach((test) => {
          const testName = test.name;
          const className = test.className || suiteName;
          const status = test.status || 'passed';

          junitXml += `    <testcase name="${testName}" classname="${className}"`;

          if (test.time) {
            junitXml += ` time="${test.time}"`;
          }

          if (status === 'passed') {
            junitXml += '/>\n';
          } else if (status === 'skipped') {
            junitXml += '>\n      <skipped/>\n    </testcase>\n';
          } else {
            junitXml += '>\n';
            junitXml += `      <failure message="${test.message || 'Test failed'}">${test.stackTrace || ''}</failure>\n`;
            junitXml += '    </testcase>\n';
          }
        });

        junitXml += '  </testsuite>\n';
      });

      junitXml += '</testsuites>';

      // Write to file
      const outputFile = path.join(
        this.config.outputDir,
        `junit-results-${timestamp.replace(/[:.]/g, '-')}.xml`
      );
      fs.writeFileSync(outputFile, junitXml);

      logger.info(`JUnit XML test results generated at ${outputFile}`);
      return outputFile;
    } catch (error) {
      logger.error('Failed to generate JUnit XML test results for Xray', error);
      throw error;
    }
  }

  /**
   * Generate Xray results from Playwright test results
   * @returns {Promise<void>}
   */
  async generateXrayResults() {
    try {
      // Check if the Playwright test results file exists
      if (!fs.existsSync(this.config.resultsPath)) {
        throw new Error('Missing Playwright results file: ' + this.config.resultsPath);
      }

      // Check if the test mapping file exists
      if (!fs.existsSync(this.config.mappingPath)) {
        throw new Error('Missing test mapping file: ' + this.config.mappingPath);
      }

      // Load test result and mapping content
      const resultsData = JSON.parse(fs.readFileSync(this.config.resultsPath, 'utf8'));
      const testMapping = JSON.parse(fs.readFileSync(this.config.mappingPath, 'utf8'));

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
            status: this.mapStatus(spec.status),
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

      // Ensure directory exists
      const outputDir = path.dirname(this.config.outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(this.config.outputPath, JSON.stringify(payload, null, 2));

      logger.info('Xray results written to: ' + this.config.outputPath);
    } catch (error) {
      logger.error('Error generating Xray results: ' + error.message);
      throw error;
    }
  }
}

module.exports = XrayResultsGenerator;