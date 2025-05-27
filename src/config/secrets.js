/**
 * Secrets Manager
 * 
 * Manages secure access to credentials
 */
const CredentialManager = require('../utils/security/credentialManager');

// Initialize credential manager
const credentialManager = new CredentialManager({
  envPrefix: 'TEST_'
});

/**
 * Get a credential securely
 * @param {string} key - Credential key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} The credential value
 */
function getCredential(key, defaultValue = '') {
  return credentialManager.getCredential(key, defaultValue);
}

// Export secure credentials
module.exports = {
  orangeHRM: {
    username: () => getCredential('ORANGE_HRM_USERNAME', 'Admin'),
    password: () => getCredential('ORANGE_HRM_PASSWORD', 'admin123')
  },
  salesforce: {
    username: () => getCredential('SALESFORCE_USERNAME', ''),
    password: () => getCredential('SALESFORCE_PASSWORD', '')
  },
  reqres: {
    apiKey: () => getCredential('REQRES_API_KEY', '')
  }
};