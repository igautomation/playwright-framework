// src/utils/api/auth.js
const fetch = require('node-fetch');

/**
 * Authentication utilities for API testing
 */
function AuthUtils() {
  this.apiKey = process.env.API_KEY || 'mock-key';
  this.oauthToken = null;
}

/**
 * Authenticates using OAuth2 client credentials
 * @param {string} tokenUrl - OAuth2 token endpoint URL
 * @param {string} clientId - Client ID
 * @param {string} clientSecret - Client secret
 * @returns {Promise} Resolves to access token
 * @throws {Error} If authentication fails
 */
AuthUtils.prototype.getOAuthToken = async function (tokenUrl, clientId, clientSecret) {
  if (!tokenUrl || !clientId || !clientSecret) {
    throw new Error('Token URL, client ID, and client secret are required');
  }
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    });
    if (!response.ok) throw new Error(`OAuth2 authentication failed: ${response.statusText}`);
    const data = await response.json();
    this.oauthToken = data.access_token;
    return this.oauthToken;
  } catch (error) {
    throw new Error(`Failed to get OAuth token: ${error.message}`);
  }
};

/**
 * Returns API key headers
 * @returns {Object} Headers with API key
 */
AuthUtils.prototype.getApiKeyHeaders = function () {
  return { 'X-API-Key': this.apiKey };
};

/**
 * Returns OAuth2 headers
 * @returns {Object} Headers with OAuth2 token
 * @throws {Error} If OAuth token is not set
 */
AuthUtils.prototype.getOAuthHeaders = function () {
  if (!this.oauthToken) throw new Error('OAuth token not set. Call getOAuthToken first.');
  return { Authorization: `Bearer ${this.oauthToken}` };
};

module.exports = AuthUtils;