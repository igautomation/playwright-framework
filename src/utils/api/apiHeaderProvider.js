/**
 * API Header Provider
 * 
 * Provides API headers from data sources for API requests
 */

const path = require('path');
const fs = require('fs-extra');
let yamlModule;

/**
 * Get API headers from data provider
 * @returns {Object} Headers object
 */
function getApiHeaders() {
  try {
    const configData = loadYamlData();
    if (configData && configData.api && configData.api.headers) {
      return configData.api.headers;
    }
  } catch (error) {
    console.warn('Failed to load API headers from YAML:', error.message);
  }
  
  // Fallback to default headers if data provider fails
  return {
    'Content-Type': 'application/json'
    // Note: x-api-key is not actually required by reqres.in
  };
}

/**
 * Get API base URL from data provider
 * @returns {string} Base URL
 */
function getApiBaseUrl() {
  try {
    const configData = loadYamlData();
    if (configData && configData.api && configData.api.baseUrl) {
      return configData.api.baseUrl;
    }
  } catch (error) {
    console.warn('Failed to load API base URL from YAML:', error.message);
  }
  
  // Fallback to default base URL if data provider fails
  return 'https://reqres.in/api';
}

/**
 * Get API endpoint from data provider
 * @param {string} endpointName - Name of the endpoint
 * @returns {string} Endpoint path
 */
function getApiEndpoint(endpointName) {
  try {
    const configData = loadYamlData();
    if (configData && configData.api && configData.api.endpoints && configData.api.endpoints[endpointName]) {
      return configData.api.endpoints[endpointName];
    }
  } catch (error) {
    console.warn(`Failed to load API endpoint ${endpointName} from YAML:`, error.message);
  }
  
  // Fallback to default endpoints if data provider fails
  const defaultEndpoints = {
    users: '/users',
    login: '/login',
    register: '/register'
  };
  
  return defaultEndpoints[endpointName] || '/';
}

/**
 * Load YAML data with multiple fallback mechanisms
 * @returns {Object} YAML data
 */
function loadYamlData() {
  // Try multiple approaches to load the YAML data
  try {
    // First try using the dataOrchestrator
    try {
      const { readYaml } = require('../common/dataOrchestrator');
      return readYaml('src/data/testData.yaml');
    } catch (orchestratorError) {
      console.warn('Failed to load YAML using dataOrchestrator:', orchestratorError.message);
      
      // If that fails, try direct YAML parsing
      if (!yamlModule) {
        try {
          yamlModule = require('js-yaml');
        } catch (yamlError) {
          console.warn('js-yaml module not found:', yamlError.message);
          // Don't try to require 'yaml' as it's not in the dependencies
          return null;
        }
      }
      
      if (yamlModule) {
        try {
          const configPath = path.join(process.cwd(), 'src/data/testData.yaml');
          if (!fs.existsSync(configPath)) {
            console.warn(`YAML file not found: ${configPath}`);
            return null;
          }
          const fileContents = fs.readFileSync(configPath, 'utf8');
          return yamlModule.load(fileContents);
        } catch (fsError) {
          console.warn('Failed to read YAML file directly:', fsError.message);
          return null;
        }
      } else {
        console.warn('No YAML parsing module available');
        return null;
      }
    }
  } catch (error) {
    console.error('All YAML loading methods failed:', error.message);
    // Instead of throwing, return null so we can use fallback values
    return null;
  }
}

/**
 * Apply API headers to a request options object
 * @param {Object} options - Request options
 * @returns {Object} Updated options with headers
 */
function applyApiHeaders(options = {}) {
  const headers = getApiHeaders();
  return {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  };
}

module.exports = {
  getApiHeaders,
  getApiBaseUrl,
  getApiEndpoint,
  applyApiHeaders
};