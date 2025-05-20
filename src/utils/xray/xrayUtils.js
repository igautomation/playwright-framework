/**
 * Xray Integration Utilities
 * 
 * Provides utilities for integrating with Xray test management
 */
const externalResources = require('../../config/external-resources');
const logger = require('../common/logger');

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
    this.baseUrl = options.baseUrl || externalResources.apis.xray || '';
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
   * @returns {Promise<Object>} Upload result
   */
  async uploadResults(resultsFile, options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      const token = await this.getToken();
      const formData = new FormData();
      formData.append('file', require('fs').createReadStream(resultsFile));
      
      const response = await fetch(`${this.baseUrl}/import/execution`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
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
      const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get execution: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
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
      
      const response = await fetch(`${this.baseUrl}/api/v1/import/execution/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(result)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update test result: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error(`Failed to update test result for ${testKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Get test details
   * @param {string} executionKey - Execution key
   * @returns {Promise<Object>} Test details
   */
  async getTest(testKey) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Xray integration not fully configured');
      }
      
      const token = await this.getToken();
      const response = await fetch(`${this.baseUrl}/api/v1/tests/${testKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get test: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error(`Failed to get test ${testKey}:`, error);
      throw error;
    }
  }
}

module.exports = XrayUtils;