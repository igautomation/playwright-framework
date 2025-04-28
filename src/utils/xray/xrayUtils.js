// src/utils/xray/xrayUtils.js
const fetch = require('node-fetch');
const { GraphQLClient, gql } = require('graphql-request');

/**
 * Jira/Xray integration utilities for Playwright tests
 */
function XrayUtils() {
  this.baseUrl = process.env.JIRA_BASE_URL || 'https://xray.cloud.getxray.app';
  this.clientId = process.env.XRAY_CLIENT_ID;
  this.clientSecret = process.env.XRAY_CLIENT_SECRET;
  this.authToken = null;
}

/**
 * Authenticates with Xray Cloud to obtain a Bearer token
 * @returns {Promise} Resolves when authenticated
 * @throws {Error} If authentication fails
 */
XrayUtils.prototype.authenticate = async function () {
  if (!this.clientId || !this.clientSecret) {
    throw new Error('XRAY_CLIENT_ID and XRAY_CLIENT_SECRET are required');
  }
  try {
    const response = await fetch(`${this.baseUrl}/api/v2/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: this.clientId, client_secret: this.clientSecret }),
    });
    if (!response.ok) throw new Error(`Authentication failed: ${response.statusText}`);
    this.authToken = await response.json();
  } catch (error) {
    throw new Error(`Failed to authenticate with Xray: ${error.message}`);
  }
};

/**
 * Fetches test cases from Xray using GraphQL
 * @param {string} jql - JQL query (e.g., 'project = XT')
 * @param {number} [limit=100] - Maximum number of results
 * @returns {Promise} Resolves to array of test cases
 * @throws {Error} If query fails
 */
XrayUtils.prototype.fetchTestCases = async function (jql, limit = 100) {
  if (!this.authToken) await this.authenticate();
  try {
    const client = new GraphQLClient(`${this.baseUrl}/api/v2/graphql`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    const query = gql`
      query {
        getTests(jql: "${jql}", limit: ${limit}) {
          results {
            issueId
            jira(fields: ["key", "summary"])
            testType { name }
            gherkin
          }
        }
      }
    `;
    const data = await client.request(query);
    return data.getTests.results;
  } catch (error) {
    throw new Error(`Failed to fetch test cases: ${error.message}`);
  }
};

/**
 * Maps Playwright tests to Xray IDs using tags
 * @param {Array} tests - Playwright test objects with titles
 * @returns {Object} Map of test titles to Xray IDs
 * @throws {Error} If tag parsing fails
 */
XrayUtils.prototype.mapTestsToXrayIds = function (tests) {
  const tagRegex = /@TEST-(\d+)/;
  const testMap = {};
  try {
    tests.forEach((test) => {
      const match = test.title.match(tagRegex);
      if (match) {
        testMap[test.title] = match[1];
      }
    });
    return testMap;
  } catch (error) {
    throw new Error(`Failed to map tests to Xray IDs: ${error.message}`);
  }
};

/**
 * Pushes test execution results to Xray
 * @param {string} testExecutionKey - Xray Test Execution key (e.g., 'TEST-123')
 * @param {Array} results - Test results array
 * @returns {Promise} Resolves when results are pushed
 * @throws {Error} If push fails
 */
XrayUtils.prototype.pushExecutionResults = async function (testExecutionKey, results) {
  if (!this.authToken) await this.authenticate();
  if (!testExecutionKey || !Array.isArray(results)) {
    throw new Error('Test Execution key and results array are required');
  }
  try {
    const payload = {
      testExecutionKey,
      tests: results.map((result) => ({
        testKey: result.testKey,
        start: new Date(result.startTime).toISOString(),
        finish: new Date(result.endTime).toISOString(),
        status: result.status === 'passed' ? 'PASS' : 'FAIL',
        comment: result.error || '',
      })),
    };
    const response = await fetch(`${this.baseUrl}/api/v2/import/execution`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to push results: ${response.statusText}`);
    console.log('Pushed results to Xray');
  } catch (error) {
    throw new Error(`Failed to push execution results: ${error.message}`);
  }
};

/**
 * Imports Gherkin/Cucumber tests to Xray
 * @param {string} featurePath - Path to .feature file
 * @param {string} projectKey - Jira project key (e.g., 'XT')
 * @returns {Promise} Resolves when tests are imported
 * @throws {Error} If import fails
 */
XrayUtils.prototype.importGherkinTests = async function (featurePath, projectKey) {
  if (!this.authToken) await this.authenticate();
  if (!featurePath || !projectKey) {
    throw new Error('Feature file path and project key are required');
  }
  try {
    const fs = require('fs');
    const featureContent = fs.readFileSync(featurePath, 'utf8');
    const response = await fetch(`${this.baseUrl}/api/v2/import/feature?projectKey=${projectKey}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'multipart/form-data',
      },
      body: JSON.stringify({ file: featureContent }),
    });
    if (!response.ok) throw new Error(`Failed to import Gherkin tests: ${response.statusText}`);
    console.log('Imported Gherkin tests to Xray');
  } catch (error) {
    throw new Error(`Failed to import Gherkin tests: ${error.message}`);
  }
};

module.exports = XrayUtils;