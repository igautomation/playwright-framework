/**
 * Data Orchestrator
 * 
 * Manages test data across the framework
 * Used for generic key-value driven test data.
 */
const externalResources = require('../../config/external-resources');

class DataOrchestrator {
  constructor() {
    this.data = {};
    this.initialize();
  }
  
  /**
   * Initialize with default data
   */
  initialize() {
    // Load credentials from environment variables with no defaults
    this.data.credentials = {
      username: process.env.LOGIN_USERNAME || '',
      password: process.env.LOGIN_PASSWORD || ''
    };
    
    // Load user data
    this.data.users = {
      admin: {
        username: process.env.ADMIN_USERNAME || '',
        email: process.env.ADMIN_EMAIL || `admin@${externalResources.email.defaultDomain}`
      },
      customer: {
        username: process.env.CUSTOMER_USERNAME || '',
        email: process.env.CUSTOMER_EMAIL || `customer@${externalResources.email.defaultDomain}`
      }
    };
    
    // Load API data
    this.data.api = {
      baseUrl: externalResources.apis.default,
      endpoints: {
        users: '/users',
        login: '/login'
      }
    };
  }
  
  /**
   * Get data by key
   * @param {string} key - Data key
   * @returns {any} Data value
   */
  get(key) {
    return this.data[key];
  }
  
  /**
   * Set data by key
   * @param {string} key - Data key
   * @param {any} value - Data value
   */
  set(key, value) {
    this.data[key] = value;
  }
  
  /**
   * Check if credentials are configured
   * @returns {boolean} True if credentials are configured
   */
  hasCredentials() {
    return !!(this.data.credentials.username && this.data.credentials.password);
  }
  
  /**
   * Validate required data is present
   * @param {string[]} requiredKeys - Required data keys
   * @throws {Error} If required data is missing
   */
  validateRequired(requiredKeys) {
    const missing = [];
    
    for (const key of requiredKeys) {
      const value = this.get(key);
      if (value === undefined || value === null || value === '') {
        missing.push(key);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required data: ${missing.join(', ')}`);
    }
  }
}

module.exports = new DataOrchestrator();