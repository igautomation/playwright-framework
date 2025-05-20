/**
 * API Header Provider
 * 
 * Provides headers and configuration for API requests
 */
const externalResources = require('../../config/external-resources');

/**
 * Get headers for API requests
 * @returns {Object} Headers object
 */
function getHeaders() {
  try {
    // Load headers from configuration or environment
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  } catch (error) {
    // Fallback to default headers if data provider fails
    console.error('Error loading API headers:', error);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
}

/**
 * Get base URL for API requests
 * @returns {string} Base URL
 */
function getBaseUrl() {
  try {
    // Return the configured API URL
    return externalResources.apis.default;
  } catch (error) {
    // Fallback to default base URL if data provider fails
    console.error('Error loading API base URL:', error);
    return '';
  }
}

/**
 * Get endpoints for API requests
 * @returns {Object} Endpoints object
 */
function getEndpoints() {
  try {
    // Load endpoints from configuration or environment
    return {
      users: '/users',
      user: '/users/{id}',
      login: '/login',
      register: '/register'
    };
  } catch (error) {
    // Fallback to default endpoints if data provider fails
    console.error('Error loading API endpoints:', error);
    const defaultEndpoints = {
      users: '/users',
      user: '/users/{id}',
      login: '/login',
      register: '/register'
    };
    return defaultEndpoints;
  }
}

module.exports = {
  getHeaders,
  getBaseUrl,
  getEndpoints
};