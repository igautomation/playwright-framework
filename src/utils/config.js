/**
 * Centralized Configuration Manager
 * Loads environment-specific configuration from .env files
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

class ConfigManager {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  /**
   * Load configuration based on environment
   */
  loadConfig() {
    // Determine which environment to use
    const env = process.env.NODE_ENV || 'dev';
    
    // Load base config from .env.example
    this.loadEnvFile('.env.example');
    
    // Load environment-specific config
    this.loadEnvFile(`.env.${env}`);
    
    // Load local overrides if they exist
    this.loadEnvFile('.env');
    
    // Process the loaded environment variables
    this.processConfig();
  }

  /**
   * Load environment variables from a file
   * @param {string} filename 
   */
  loadEnvFile(filename) {
    const filePath = path.resolve(process.cwd(), filename);
    
    if (fs.existsSync(filePath)) {
      const envConfig = dotenv.parse(fs.readFileSync(filePath));
      
      // Merge with existing config
      for (const key in envConfig) {
        process.env[key] = envConfig[key];
      }
    }
  }

  /**
   * Process loaded environment variables into structured config
   */
  processConfig() {
    this.config = {
      env: process.env.ENV || 'dev',
      
      salesforce: {
        username: process.env.SF_USERNAME,
        password: process.env.SF_PASSWORD,
        url: process.env.SF_URL,
        orgAlias: process.env.SF_ORG_ALIAS,
        apiVersion: process.env.SF_API_VERSION,
        instanceUrl: process.env.SF_INSTANCE_URL
      },
      
      orangeHrm: {
        url: process.env.ORANGE_HRM_URL,
        username: process.env.ORANGE_HRM_USERNAME,
        password: process.env.ORANGE_HRM_PASSWORD
      },
      
      output: {
        pagesDir: process.env.PAGES_OUTPUT_DIR || './src/pages',
        testsDir: process.env.TESTS_OUTPUT_DIR || './tests/pages',
        elementsFile: process.env.ELEMENTS_OUTPUT_FILE || './temp/sf_elements.json',
        sessionFile: process.env.SF_SESSION_FILE || './sessions/sf_session.txt',
        authStorageDir: process.env.AUTH_STORAGE_DIR || './auth'
      },
      
      browser: {
        headless: process.env.HEADLESS === 'true',
        slowMo: parseInt(process.env.BROWSER_SLOW_MO || '0'),
        timeout: parseInt(process.env.BROWSER_TIMEOUT || '30000')
      },
      
      test: {
        defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
        actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '15000'),
        expectTimeout: parseInt(process.env.EXPECT_TIMEOUT || '5000'),
        screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE === 'true',
        retryCount: parseInt(process.env.RETRY_COUNT || '0')
      }
    };
  }

  /**
   * Get the entire configuration
   * @returns {Object} The complete configuration object
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get a specific configuration section
   * @param {string} section The configuration section to retrieve
   * @returns {Object} The requested configuration section
   */
  getSection(section) {
    return this.config[section] || {};
  }

  /**
   * Get a specific configuration value
   * @param {string} section The configuration section
   * @param {string} key The configuration key
   * @param {*} defaultValue Default value if not found
   * @returns {*} The configuration value
   */
  getValue(section, key, defaultValue = null) {
    const sectionObj = this.getSection(section);
    return sectionObj[key] !== undefined ? sectionObj[key] : defaultValue;
  }
}

// Create and export a singleton instance
const configManager = new ConfigManager();
module.exports = configManager;