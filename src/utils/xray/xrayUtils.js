<<<<<<< HEAD
// src/utils/xray/xrayUtils.js

/**
 * Xray integration utility for Playwright test framework.
 *
 * Features:
 * - OAuth2 token auth via AuthUtils
 * - Fetch test cases via GraphQL
 * - Push execution results to Xray
 * - Import Gherkin .feature files into Jira
 */

import { GraphQLClient, gql } from 'graphql-request';
import logger from '../common/logger.js';
import AuthUtils from '../api/auth.js';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

class XrayUtils {
  constructor() {
    this.apiBase = process.env.XRAY_API_BASE_URL || 'https://xray.cloud.getxray.app/api/v2';
    this.clientId = process.env.XRAY_CLIENT_ID;
    this.clientSecret = process.env.XRAY_CLIENT_SECRET;
    this.token = null;
    this.auth = new AuthUtils();
  }

  /**
   * Authenticates with Xray using client credentials via AuthUtils
   */
  async authenticate() {
    this.token = await this.auth.getOAuthToken(
      `${this.apiBase}/authenticate`,
      this.clientId,
      this.clientSecret
    );

    if (!this.token) {
      throw new Error('Failed to authenticate with Xray. Token is null.');
    }

    logger.info('Xray token retrieved successfully');
  }

  /**
   * Fetches test cases from Jira using GraphQL based on a JQL filter
   * Returns test keys and summaries for mapping
   */
  async fetchTestCases(jql, limit = 100) {
    if (!this.token) {
      await this.authenticate();
    }

    const graphQLUrl = `${this.apiBase}/graphql`;
    const client = new GraphQLClient(graphQLUrl, {
      headers: { Authorization: `Bearer ${this.token}` }
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
  }

  /**
   * Pushes execution results to Xray cloud for a given testExecutionKey
   */
  async pushExecutionResults(testExecutionKey, results) {
    if (!this.token) {
      await this.authenticate();
    }

    if (!testExecutionKey || !Array.isArray(results)) {
      throw new Error('Invalid input: testExecutionKey and results array are required.');
    }

    const payload = {
      testExecutionKey,
      tests: results.map((result) => ({
        testKey: result.testKey,
        start: new Date(result.startTime).toISOString(),
        finish: new Date(result.endTime).toISOString(),
        status: result.status === 'passed' ? 'PASS' : 'FAIL',
        comment: result.error || ''
      }))
    };

    const response = await fetch(`${this.apiBase}/import/execution`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error(`Failed to push results to Xray: ${response.statusText}\n${text}`);
      throw new Error('Xray result push failed');
    }

    logger.info('Xray test execution results uploaded successfully');
  }

  /**
   * Imports a Gherkin feature file into Jira project.
   * Accepts .feature file path and Jira project key.
   */
  async importGherkinTests(featurePath, projectKey) {
    if (!this.token) {
      await this.authenticate();
    }

    if (!fs.existsSync(featurePath)) {
      throw new Error(`Feature file does not exist: ${featurePath}`);
    }

    const fileName = path.basename(featurePath);
    const fileContent = fs.readFileSync(featurePath, 'utf8');

    const response = await fetch(`${this.apiBase}/import/feature?projectKey=${projectKey}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'text/plain'
      },
      body: fileContent
    });

    if (!response.ok) {
      logger.error(`Failed to import Gherkin: ${response.status} ${response.statusText}`);
      throw new Error('Xray Gherkin import failed');
    }

    logger.info(`Gherkin feature "${fileName}" imported to project ${projectKey}`);
  }

  /**
   * Maps test titles in the Playwright test results to Xray test keys using @TEST-123 tags.
   */
  mapTestsToXrayIds(tests) {
    const tagPattern = /@TEST-(\d+)/;
    const map = {};

    tests.forEach((test) => {
      const match = test.title.match(tagPattern);
      if (match) {
        map[test.title] = `TEST-${match[1]}`;
      }
    });

    return map;
  }
}

export default XrayUtils;
=======
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

/**
 * Xray Utilities class for integrating with Jira/Xray
 */
class XrayUtils {
  /**
   * Constructor
   * @param {Object} config - Xray configuration
   */
  constructor(config = {}) {
    this.config = {
      jiraBaseUrl: process.env.JIRA_BASE_URL || config.jiraBaseUrl,
      jiraUsername: process.env.JIRA_USERNAME || config.jiraUsername,
      jiraApiToken: process.env.JIRA_API_TOKEN || config.jiraApiToken,
      jiraProjectKey: process.env.JIRA_PROJECT_KEY || config.jiraProjectKey,
      xrayCloudBaseUrl: 'https://xray.cloud.getxray.app/api/v2',
      ...config,
    };

    // Validate required configuration
    if (!this.config.jiraBaseUrl) {
      throw new Error('Jira base URL is required');
    }

    // Create axios instance for Jira API
    this.jiraClient = axios.create({
      baseURL: this.config.jiraBaseUrl,
      auth: {
        username: this.config.jiraUsername,
        password: this.config.jiraApiToken,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Create axios instance for Xray Cloud API
    this.xrayClient = axios.create({
      baseURL: this.config.xrayCloudBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.authToken = null;
  }

  /**
   * Authenticate with Xray Cloud
   * @returns {Promise<string>} Authentication token
   */
  async authenticate() {
    try {
      logger.info('Authenticating with Xray Cloud');

      const response = await axios.post(
        `${this.config.xrayCloudBaseUrl}/authenticate`,
        {
          client_id: this.config.xrayClientId,
          client_secret: this.config.xrayClientSecret,
        }
      );

      this.authToken = response.data;

      // Set the auth token in the Xray client
      this.xrayClient.defaults.headers.common['Authorization'] =
        `Bearer ${this.authToken}`;

      logger.info('Successfully authenticated with Xray Cloud');
      return this.authToken;
    } catch (error) {
      logger.error('Failed to authenticate with Xray Cloud', error);
      throw error;
    }
  }

  /**
   * Get test cases from Xray
   * @param {string} testKey - Test key (e.g., TEST-123)
   * @returns {Promise<Object>} Test case data
   */
  async getTestCase(testKey) {
    try {
      logger.info(`Getting test case ${testKey} from Xray`);

      const response = await this.jiraClient.get(
        `/rest/api/3/issue/${testKey}`
      );

      logger.info(`Successfully retrieved test case ${testKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get test case ${testKey} from Xray`, error);
      throw error;
    }
  }

  /**
   * Get test cases by JQL query
   * @param {string} jql - JQL query
   * @returns {Promise<Array<Object>>} Test cases
   */
  async getTestCasesByJql(jql) {
    try {
      logger.info(`Getting test cases by JQL: ${jql}`);

      const response = await this.jiraClient.post('/rest/api/3/search', {
        jql,
        fields: [
          'summary',
          'description',
          'status',
          'labels',
          'customfield_10000',
        ], // Adjust fields as needed
      });

      logger.info(
        `Successfully retrieved ${response.data.issues.length} test cases`
      );
      return response.data.issues;
    } catch (error) {
      logger.error(`Failed to get test cases by JQL: ${jql}`, error);
      throw error;
    }
  }

  /**
   * Create a test execution in Xray
   * @param {Object} executionData - Test execution data
   * @returns {Promise<Object>} Created test execution
   */
  async createTestExecution(executionData) {
    try {
      logger.info('Creating test execution in Xray');

      const response = await this.jiraClient.post('/rest/api/3/issue', {
        fields: {
          project: {
            key: this.config.jiraProjectKey,
          },
          summary:
            executionData.summary ||
            `Test Execution - ${new Date().toISOString()}`,
          description: executionData.description || 'Automated test execution',
          issuetype: {
            name: 'Test Execution',
          },
          ...executionData.fields,
        },
      });

      logger.info(`Successfully created test execution: ${response.data.key}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to create test execution in Xray', error);
      throw error;
    }
  }

  /**
   * Import test results to Xray
   * @param {string} format - Results format (e.g., 'cucumber', 'junit', 'nunit', 'xray')
   * @param {string} resultsFile - Path to results file
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Import response
   */
  async importTestResults(format, resultsFile, options = {}) {
    try {
      logger.info(
        `Importing ${format} test results from ${resultsFile} to Xray`
      );

      // Ensure we have an auth token
      if (!this.authToken) {
        await this.authenticate();
      }

      // Read the results file
      const results = fs.readFileSync(resultsFile, 'utf8');

      // Determine the endpoint based on the format
      let endpoint;
      switch (format.toLowerCase()) {
        case 'cucumber':
          endpoint = '/import/execution/cucumber';
          break;
        case 'junit':
          endpoint = '/import/execution/junit';
          break;
        case 'nunit':
          endpoint = '/import/execution/nunit';
          break;
        case 'xray':
          endpoint = '/import/execution';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Import the results
      const response = await this.xrayClient.post(endpoint, results, {
        params: options,
      });

      logger.info('Successfully imported test results to Xray');
      return response.data;
    } catch (error) {
      logger.error(`Failed to import ${format} test results to Xray`, error);
      throw error;
    }
  }

  /**
   * Update test run status in Xray
   * @param {string} testKey - Test key (e.g., TEST-123)
   * @param {string} status - Test status (e.g., PASS, FAIL)
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update response
   */
  async updateTestRunStatus(testKey, status, options = {}) {
    try {
      logger.info(`Updating test run status for ${testKey} to ${status}`);

      const response = await this.jiraClient.put(
        `/rest/raven/1.0/api/testrun/${testKey}/status`,
        {
          status,
          ...options,
        }
      );

      logger.info(`Successfully updated test run status for ${testKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update test run status for ${testKey}`, error);
      throw error;
    }
  }

  /**
   * Generate Xray test execution report
   * @param {string} executionKey - Test execution key (e.g., EXEC-123)
   * @param {string} format - Report format (e.g., 'pdf', 'excel')
   * @returns {Promise<Buffer>} Report data
   */
  async generateTestExecutionReport(executionKey, format = 'pdf') {
    try {
      logger.info(
        `Generating ${format} report for test execution ${executionKey}`
      );

      const response = await this.jiraClient.get(
        `/rest/raven/1.0/export/test/${executionKey}`,
        {
          params: { format },
          responseType: 'arraybuffer',
        }
      );

      logger.info(
        `Successfully generated ${format} report for test execution ${executionKey}`
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to generate ${format} report for test execution ${executionKey}`,
        error
      );
      throw error;
    }
  }

  /**
   * Save Xray test execution report to file
   * @param {string} executionKey - Test execution key (e.g., EXEC-123)
   * @param {string} format - Report format (e.g., 'pdf', 'excel')
   * @param {string} outputPath - Output path
   * @returns {Promise<string>} Path to the saved report
   */
  async saveTestExecutionReport(
    executionKey,
    format = 'pdf',
    outputPath = './reports'
  ) {
    try {
      logger.info(`Saving ${format} report for test execution ${executionKey}`);

      // Generate the report
      const reportData = await this.generateTestExecutionReport(
        executionKey,
        format
      );

      // Ensure the output directory exists
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      // Save the report
      const reportPath = path.join(
        outputPath,
        `${executionKey}-report.${format}`
      );
      fs.writeFileSync(reportPath, reportData);

      logger.info(
        `Successfully saved ${format} report for test execution ${executionKey} to ${reportPath}`
      );
      return reportPath;
    } catch (error) {
      logger.error(
        `Failed to save ${format} report for test execution ${executionKey}`,
        error
      );
      throw error;
    }
  }
}

module.exports = XrayUtils;
>>>>>>> 51948a2 (Main v1.0)
