/**
 * Xray integration utilities
 */
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');
const fetch = require('node-fetch');

class XrayUtils {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://xray.cloud.getxray.app/api/v2';
    this.projectKey = options.projectKey || 'TEST';
    this.clientId = options.clientId || process.env.XRAY_CLIENT_ID;
    this.clientSecret = options.clientSecret || process.env.XRAY_CLIENT_SECRET;
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Get authentication token
   * @returns {Promise<string>} Authentication token
   */
  async getToken() {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.token;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      this.token = data.token;
      
      // Set token expiry (24 hours)
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      
      return this.token;
    } catch (error) {
      logger.error('Failed to get Xray token:', error);
      throw error;
    }
  }

  /**
   * Upload test results to Xray
   * @param {string} resultsFile - Path to test results file
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload response
   */
  async uploadResults(resultsFile, options = {}) {
    try {
      const token = await this.getToken();
      
      if (!fs.existsSync(resultsFile)) {
        throw new Error(`Results file not found: ${resultsFile}`);
      }
      
      const fileContent = fs.readFileSync(resultsFile, 'utf8');
      
      const response = await fetch(`${this.baseUrl}/import/execution`, {
        method: 'POST',
        headers: {
          'Content-Type': options.format === 'cucumber' ? 'application/json' : 'application/xml',
          'Authorization': `Bearer ${token}`
        },
        body: fileContent
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload results: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.info(`Test results uploaded to Xray: ${data.key}`);
      
      return data;
    } catch (error) {
      logger.error('Failed to upload test results to Xray:', error);
      throw error;
    }
  }

  /**
   * Create test execution in Xray
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution response
   */
  async createExecution(options = {}) {
    try {
      const token = await this.getToken();
      
      const execution = {
        fields: {
          project: {
            key: options.projectKey || this.projectKey
          },
          summary: options.summary || `Test Execution - ${new Date().toISOString()}`,
          description: options.description || 'Automated test execution',
          issuetype: {
            name: 'Test Execution'
          }
        }
      };
      
      const response = await fetch(`${this.baseUrl}/import/execution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(execution)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create execution: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.info(`Test execution created in Xray: ${data.key}`);
      
      return data;
    } catch (error) {
      logger.error('Failed to create test execution in Xray:', error);
      throw error;
    }
  }

  /**
   * Get test runs for execution
   * @param {string} executionKey - Execution key
   * @returns {Promise<Array>} Test runs
   */
  async getTestRuns(executionKey) {
    try {
      const token = await this.getToken();
      
      const response = await fetch(`${this.baseUrl}/api/testrun?testExecKey=${executionKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get test runs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.info(`Retrieved ${data.length} test runs for execution ${executionKey}`);
      
      return data;
    } catch (error) {
      logger.error('Failed to get test runs from Xray:', error);
      throw error;
    }
  }

  /**
   * Update test run status
   * @param {string} testRunId - Test run ID
   * @param {string} status - Test status (PASS, FAIL, TODO, etc.)
   * @returns {Promise<Object>} Update response
   */
  async updateTestRunStatus(testRunId, status) {
    try {
      const token = await this.getToken();
      
      const response = await fetch(`${this.baseUrl}/api/testrun/${testRunId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update test run status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.info(`Updated test run ${testRunId} status to ${status}`);
      
      return data;
    } catch (error) {
      logger.error('Failed to update test run status in Xray:', error);
      throw error;
    }
  }

  /**
   * Generate test execution report
   * @param {string} executionKey - Execution key
   * @param {Object} options - Report options
   * @returns {Promise<Buffer>} Report buffer
   */
  async generateReport(executionKey, options = {}) {
    try {
      const token = await this.getToken();
      
      const response = await fetch(`${this.baseUrl}/api/reports/testexec/${executionKey}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status} ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      // Save report if path provided
      if (options.outputPath) {
        const outputDir = path.dirname(options.outputPath);
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(options.outputPath, Buffer.from(buffer));
        logger.info(`Report saved to ${options.outputPath}`);
      }
      
      return Buffer.from(buffer);
    } catch (error) {
      logger.error('Failed to generate report from Xray:', error);
      throw error;
    }
  }
}

module.exports = XrayUtils;