/**
 * Xray Integration Utilities
 * 
 * Provides utilities for integrating with Xray test management
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../../config');
const logger = require('../common/logger');

/**
 * Xray Integration Utilities
 */
class XrayUtils {
  /**
   * Create a new XrayUtils instance
   * @param {Object} options - Options
   * @param {string} options.baseUrl - Xray API base URL
   * @param {string} options.clientId - Xray client ID
   * @param {string} options.clientSecret - Xray client secret
   * @param {string} options.projectKey - Jira project key
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || config.externalResources?.apis?.xray || process.env.XRAY_API_URL || '';
    this.clientId = options.clientId || process.env.XRAY_CLIENT_ID || '';
    this.clientSecret = options.clientSecret || process.env.XRAY_CLIENT_SECRET || '';
    this.projectKey = options.projectKey || process.env.XRAY_PROJECT_KEY || '';
    this.token = null;
    this.tokenExpiry = null;
    
    // Validate required configuration
    if (!this.baseUrl) {
      logger.warn('Xray API URL not configured. Set XRAY_API_URL environment variable or provide in options.');
    }
    
    if (!this.clientId || !this.clientSecret) {
      logger.warn('Xray credentials not configured. Set XRAY_CLIENT_ID and XRAY_CLIENT_SECRET environment variables or provide in options.');
    }
    
    if (!this.projectKey) {
      logger.warn('Xray project key not configured. Set XRAY_PROJECT_KEY environment variable or provide in options.');
    }
  }
  
  /**
   * Check if Xray integration is configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    return !!(this.baseUrl && this.clientId && this.clientSecret && this.projectKey);
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
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      const response = await axios.post(`${this.baseUrl}/authenticate`, {
        client_id: this.clientId,
        client_secret: this.clientSecret
      });
      
      this.token = response.data.token;
      
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
   * @returns {Promise<Object>} Upload result
   */
  async uploadResults(resultsFile, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      if (!fs.existsSync(resultsFile)) {
        throw new Error(`Results file not found: ${resultsFile}`);
      }
      
      const token = await this.getToken();
      
      // Determine file format based on extension
      const fileExtension = path.extname(resultsFile).toLowerCase();
      let endpoint = `${this.baseUrl}/import/execution`;
      
      // Add format-specific endpoint
      if (fileExtension === '.json') {
        endpoint += '/cucumber';
      } else if (fileExtension === '.xml') {
        endpoint += '/junit';
      } else if (fileExtension === '.nunit') {
        endpoint += '/nunit';
      } else if (fileExtension === '.robot') {
        endpoint += '/robot';
      } else if (fileExtension === '.behave') {
        endpoint += '/behave';
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', new Blob([fs.readFileSync(resultsFile)]));
      
      // Add project key if provided
      if (options.projectKey || this.projectKey) {
        formData.append('projectKey', options.projectKey || this.projectKey);
      }
      
      // Add test execution key if provided
      if (options.testExecutionKey) {
        formData.append('testExecutionKey', options.testExecutionKey);
      }
      
      // Add test plan key if provided
      if (options.testPlanKey) {
        formData.append('testPlanKey', options.testPlanKey);
      }
      
      const uploadResponse = await axios.post(endpoint, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      logger.info(`Test results uploaded to Xray: ${uploadResponse.data.key}`);
      
      return uploadResponse.data;
    } catch (error) {
      logger.error('Failed to upload test results to Xray:', error);
      throw error;
    }
  }
  
  /**
   * Create a test execution in Xray
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  async createExecution(options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
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
      
      // Add test environment if provided
      if (options.environment) {
        execution.fields.environment = options.environment;
      }
      
      // Add test plan if provided
      if (options.testPlanKey) {
        execution.fields.testPlanKey = options.testPlanKey;
      }
      
      // Add test keys if provided
      if (options.testKeys && Array.isArray(options.testKeys) && options.testKeys.length > 0) {
        execution.fields.tests = options.testKeys;
      }
      
      const response = await axios.post(`${this.baseUrl}/import/execution`, execution, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      logger.info(`Test execution created in Xray: ${response.data.key}`);
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create test execution in Xray:', error);
      throw error;
    }
  }
  
  /**
   * Get test execution details
   * @param {string} executionKey - Execution key
   * @returns {Promise<Object>} Execution details
   */
  async getExecution(executionKey) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      const token = await this.getToken();
      const response = await axios.get(`${this.baseUrl}/api/v1/executions/${executionKey}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to get test execution ${executionKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Update test result in Xray
   * @param {string} testKey - Test key
   * @param {string} status - Test status (PASS, FAIL, TODO, etc.)
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updateTestResult(testKey, status, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      const token = await this.getToken();
      const result = {
        testKey,
        status,
        comment: options.comment || '',
        executionDate: options.executionDate || new Date().toISOString()
      };
      
      // Add execution key if provided
      if (options.executionKey) {
        result.testExecutionKey = options.executionKey;
      }
      
      // Add evidence if provided
      if (options.evidence && Array.isArray(options.evidence) && options.evidence.length > 0) {
        result.evidence = options.evidence.map(item => {
          if (typeof item === 'string') {
            // Assume it's a file path
            if (fs.existsSync(item)) {
              const filename = path.basename(item);
              const data = fs.readFileSync(item, { encoding: 'base64' });
              const contentType = this._getContentType(item);
              
              return {
                filename,
                data,
                contentType
              };
            }
          } else {
            // Assume it's already formatted
            return item;
          }
        }).filter(Boolean);
      }
      
      const response = await axios.post(`${this.baseUrl}/api/v1/import/execution/test`, result, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to update test result for ${testKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Get test details
   * @param {string} testKey - Test key
   * @returns {Promise<Object>} Test details
   */
  async getTest(testKey) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      const token = await this.getToken();
      const response = await axios.get(`${this.baseUrl}/api/v1/tests/${testKey}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to get test ${testKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Extract test IDs from test files
   * @param {string} testDir - Directory containing test files
   * @param {string} pattern - Glob pattern for test files
   * @returns {Promise<Object>} Object mapping test files to test IDs
   */
  async extractTestIds(testDir = 'src/tests', pattern = '**/*.spec.js') {
    try {
      const glob = require('glob');
      const files = glob.sync(path.join(testDir, pattern));
      const testIdMap = {};
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const matches = content.match(/@TEST-\\d+/g) || [];
        
        if (matches.length > 0) {
          testIdMap[file] = matches.map(match => match.replace('@', ''));
        }
      }
      
      return testIdMap;
    } catch (error) {
      logger.error('Failed to extract test IDs:', error);
      throw error;
    }
  }
  
  /**
   * Generate Xray payload from test results
   * @param {Object} results - Test results
   * @param {Object} options - Options
   * @returns {Object} Xray payload
   */
  generateXrayPayload(results, options = {}) {
    try {
      const payload = {
        info: {
          summary: options.summary || `Test Execution - ${new Date().toISOString()}`,
          description: options.description || 'Automated test execution',
          project: options.projectKey || this.projectKey,
          version: options.version || '1.0'
        },
        tests: []
      };
      
      // Add test plan key if provided
      if (options.testPlanKey) {
        payload.info.testPlanKey = options.testPlanKey;
      }
      
      // Add test environment if provided
      if (options.environment) {
        payload.info.testEnvironments = [options.environment];
      }
      
      // Add tests
      if (results && Array.isArray(results.tests)) {
        results.tests.forEach(test => {
          // Extract test key from test name or description
          const testKeyMatch = (test.name || test.description || '').match(/@(TEST-\\d+)/);
          const testKey = testKeyMatch ? testKeyMatch[1] : null;
          
          if (testKey) {
            const xrayTest = {
              testKey,
              start: test.startTime || new Date().toISOString(),
              finish: test.endTime || new Date().toISOString(),
              comment: test.description || '',
              status: test.status === 'passed' ? 'PASS' : 'FAIL'
            };
            
            // Add evidence if available
            if (test.attachments && Array.isArray(test.attachments)) {
              xrayTest.evidence = test.attachments.map(attachment => {
                if (fs.existsSync(attachment)) {
                  const filename = path.basename(attachment);
                  const data = fs.readFileSync(attachment, { encoding: 'base64' });
                  const contentType = this._getContentType(attachment);
                  
                  return {
                    filename,
                    data,
                    contentType
                  };
                }
                return null;
              }).filter(Boolean);
            }
            
            payload.tests.push(xrayTest);
          }
        });
      }
      
      return payload;
    } catch (error) {
      logger.error('Failed to generate Xray payload:', error);
      throw error;
    }
  }
  
  /**
   * Fetch test cases from a test plan
   * @param {string} testPlanId - Test plan ID
   * @returns {Promise<Array>} Test cases
   */
  async fetchTestCases(testPlanId) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      const token = await this.getToken();
      const response = await axios.get(
        `${this.baseUrl}/rest/raven/1.0/api/testplan/${testPlanId}/test`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch test cases for test plan ${testPlanId}:`, error);
      throw error;
    }
  }
  
  /**
   * Report test results to a test execution
   * @param {string} testExecutionId - Test execution ID
   * @param {Array} results - Test results
   * @returns {Promise<void>}
   */
  async reportResults(testExecutionId, results) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      const token = await this.getToken();
      await axios.post(
        `${this.baseUrl}/rest/raven/1.0/api/testexecution/${testExecutionId}/result`,
        results,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      logger.info(`Results reported to test execution ${testExecutionId}`);
    } catch (error) {
      logger.error(`Failed to report results to test execution ${testExecutionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get content type based on file extension
   * @param {string} filePath - File path
   * @returns {string} Content type
   * @private
   */
  _getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.pdf':
        return 'application/pdf';
      case '.txt':
        return 'text/plain';
      case '.html':
        return 'text/html';
      case '.json':
        return 'application/json';
      case '.xml':
        return 'application/xml';
      default:
        return 'application/octet-stream';
    }
  }
}

module.exports = XrayUtils;