// @ts-check
require('dotenv').config();
const jsforce = require('jsforce');

/**
 * Utility class for Salesforce API operations
 */
class SalesforceUtils {
  /**
   * @param {Object} config - Configuration object
   * @param {string} config.username - Salesforce username
   * @param {string} config.password - Salesforce password
   * @param {string} [config.securityToken] - Salesforce security token
   * @param {string} [config.loginUrl] - Salesforce login URL
   */
  constructor(config) {
    this.username = config.username || process.env.SF_USERNAME;
    this.password = config.password || process.env.SF_PASSWORD;
    this.securityToken = config.securityToken || process.env.SF_SECURITY_TOKEN || '';
    this.loginUrl = config.loginUrl || process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
    this.conn = new jsforce.Connection({ loginUrl: this.loginUrl });
    this.isLoggedIn = false;
  }

  /**
   * Login to Salesforce
   * @returns {Promise<Object>} Login result
   */
  async login() {
    try {
      const result = await this.conn.login(
        this.username, 
        this.password + this.securityToken
      );
      this.isLoggedIn = true;
      return result;
    } catch (error) {
      console.error(`Salesforce login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a record
   * @param {string} objectType - Salesforce object type (e.g., 'Account', 'Contact')
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Create result
   */
  async createRecord(objectType, data) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.sobject(objectType).create(data);
    } catch (error) {
      console.error(`Error creating ${objectType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a record
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Update result
   */
  async updateRecord(objectType, recordId, data) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.sobject(objectType).update({ Id: recordId, ...data });
    } catch (error) {
      console.error(`Error updating ${objectType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a record
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteRecord(objectType, recordId) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.sobject(objectType).destroy(recordId);
    } catch (error) {
      console.error(`Error deleting ${objectType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a SOQL query
   * @param {string} query - SOQL query
   * @returns {Promise<Object>} Query result
   */
  async query(query) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      return await this.conn.query(query);
    } catch (error) {
      console.error(`Query error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up test data
   * @param {string} objectType - Salesforce object type
   * @param {string} fieldName - Field name to filter by
   * @param {string} fieldValue - Field value to filter by
   * @returns {Promise<Object>} Delete result
   */
  async cleanupTestData(objectType, fieldName, fieldValue) {
    if (!this.isLoggedIn) await this.login();
    
    try {
      const query = `SELECT Id FROM ${objectType} WHERE ${fieldName} = '${fieldValue}'`;
      const result = await this.conn.query(query);
      
      if (result.records.length > 0) {
        const ids = result.records.map(record => record.Id);
        return await this.conn.sobject(objectType).destroy(ids);
      }
      
      return { success: true, message: 'No records found to delete' };
    } catch (error) {
      console.error(`Error cleaning up test data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SalesforceUtils;