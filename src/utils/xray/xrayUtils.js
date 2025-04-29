// src/utils/xray/xrayUtils.js

/**
 * Xray Integration Utilities for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Authenticate with Xray Cloud
 * - Fetch test cases using GraphQL
 * - Map Playwright test titles to Xray test IDs
 * - Push execution results
 * - Import Gherkin feature files
 */

import { GraphQLClient, gql } from 'graphql-request';

class XrayUtils {
  constructor() {
    this.baseUrl = process.env.JIRA_BASE_URL || 'https://xray.cloud.getxray.app';
    this.clientId = process.env.XRAY_CLIENT_ID;
    this.clientSecret = process.env.XRAY_CLIENT_SECRET;
    this.authToken = null;
  }

  async authenticate() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('XRAY_CLIENT_ID and XRAY_CLIENT_SECRET are required');
    }
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${this.baseUrl}/api/v2/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      this.authToken = await response.json();
    } catch (error) {
      throw new Error(`Failed to authenticate with Xray: ${error.message}`);
    }
  }

  async fetchTestCases(jql, limit = 100) {
    if (!this.authToken) {
      await this.authenticate();
    }
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
  }

  mapTestsToXrayIds(tests) {
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
  }

  async pushExecutionResults(testExecutionKey, results) {
    if (!this.authToken) {
      await this.authenticate();
    }
    if (!testExecutionKey || !Array.isArray(results)) {
      throw new Error('Test Execution key and results array are required');
    }
    try {
      const fetch = (await import('node-fetch')).default;
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

      if (!response.ok) {
        throw new Error(`Failed to push results: ${response.statusText}`);
      }

      console.log('Pushed results to Xray successfully.');
    } catch (error) {
      throw new Error(`Failed to push execution results: ${error.message}`);
    }
  }

  async importGherkinTests(featurePath, projectKey) {
    if (!this.authToken) {
      await this.authenticate();
    }
    if (!featurePath || !projectKey) {
      throw new Error('Feature file path and project key are required');
    }
    try {
      const fetch = (await import('node-fetch')).default;
      const { readFileSync } = await import('fs');
      const featureContent = readFileSync(featurePath, 'utf8');

      const response = await fetch(
        `${this.baseUrl}/api/v2/import/feature?projectKey=${projectKey}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: JSON.stringify({ file: featureContent }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to import Gherkin tests: ${response.statusText}`);
      }

      console.log('Imported Gherkin tests into Xray successfully.');
    } catch (error) {
      throw new Error(`Failed to import Gherkin tests: ${error.message}`);
    }
  }
}

export default XrayUtils;