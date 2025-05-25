/**
 * Salesforce Utilities
 * 
 * Provides helper functions for Salesforce testing
 */
const { request } = require('@playwright/test');
const config = require('../../config');

/**
 * Salesforce Utilities class
 */
class SalesforceUtils {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.username = options.username || process.env.SALESFORCE_USERNAME || config.salesforce?.username;
    this.password = options.password || process.env.SALESFORCE_PASSWORD || config.salesforce?.password;
    this.securityToken = options.securityToken || process.env.SALESFORCE_SECURITY_TOKEN || config.salesforce?.securityToken || '';
    this.loginUrl = options.loginUrl || process.env.SALESFORCE_LOGIN_URL || config.salesforce?.loginUrl || 'https://login.salesforce.com';
    this.apiVersion = options.apiVersion || process.env.SALESFORCE_API_VERSION || config.salesforce?.apiVersion || '56.0';
    this.instanceUrl = null;
    this.accessToken = null;
    this.requestContext = null;
  }

  /**
   * Login to Salesforce API
   * @returns {Promise<Object>} Login result
   */
  async login() {
    try {
      // Create request context
      this.requestContext = await request.newContext({
        baseURL: this.loginUrl,
        extraHTTPHeaders: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Prepare login payload
      const payload = new URLSearchParams();
      payload.append('grant_type', 'password');
      payload.append('client_id', process.env.SALESFORCE_CLIENT_ID || config.salesforce?.clientId);
      payload.append('client_secret', process.env.SALESFORCE_CLIENT_SECRET || config.salesforce?.clientSecret);
      payload.append('username', this.username);
      payload.append('password', this.password + this.securityToken);

      // Send login request
      const response = await this.requestContext.post('/services/oauth2/token', {
        data: payload.toString()
      });

      if (response.ok()) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.instanceUrl = data.instance_url;
        
        // Update request context with auth token
        await this.requestContext.dispose();
        this.requestContext = await request.newContext({
          baseURL: this.instanceUrl,
          extraHTTPHeaders: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        return { success: true, instanceUrl: this.instanceUrl };
      } else {
        const errorText = await response.text();
        throw new Error(`Login failed: ${response.status()} - ${errorText}`);
      }
    } catch (error) {
      console.error('Salesforce login error:', error);
      throw error;
    }
  }

  /**
   * Create a record via API
   * @param {string} objectType - Salesforce object type (e.g., 'Account', 'Contact')
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async createRecord(objectType, data) {
    if (!this.accessToken) {
      await this.login();
    }

    const response = await this.requestContext.post(`/services/data/v${this.apiVersion}/sobjects/${objectType}`, {
      data: data
    });

    if (response.ok()) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to create ${objectType}: ${response.status()} - ${errorText}`);
    }
  }

  /**
   * Query records via API
   * @param {string} soql - SOQL query
   * @returns {Promise<Object>} Query results
   */
  async query(soql) {
    if (!this.accessToken) {
      await this.login();
    }

    const encodedQuery = encodeURIComponent(soql);
    const response = await this.requestContext.get(`/services/data/v${this.apiVersion}/query/?q=${encodedQuery}`);

    if (response.ok()) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(`Query failed: ${response.status()} - ${errorText}`);
    }
  }

  /**
   * Update a record via API
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @param {Object} data - Record data
   * @returns {Promise<boolean>} Success status
   */
  async updateRecord(objectType, recordId, data) {
    if (!this.accessToken) {
      await this.login();
    }

    const response = await this.requestContext.patch(
      `/services/data/v${this.apiVersion}/sobjects/${objectType}/${recordId}`,
      { data: data }
    );

    // Successful update returns 204 No Content
    return response.status() === 204;
  }

  /**
   * Delete a record via API
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteRecord(objectType, recordId) {
    if (!this.accessToken) {
      await this.login();
    }

    const response = await this.requestContext.delete(
      `/services/data/v${this.apiVersion}/sobjects/${objectType}/${recordId}`
    );

    // Successful delete returns 204 No Content
    return response.status() === 204;
  }

  /**
   * Dispose resources
   */
  async dispose() {
    if (this.requestContext) {
      await this.requestContext.dispose();
      this.requestContext = null;
    }
  }
}

module.exports = SalesforceUtils;