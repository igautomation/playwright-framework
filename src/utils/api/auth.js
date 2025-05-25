/**
 * Authentication utility for API testing
 * 
 * Supports both:
 * - Static API key header (via API_KEY)
 * - OAuth2 client credential flow (via OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET)
 */

/**
 * Authentication utilities for API testing
 */
class AuthUtils {
  /**
   * Constructor
   */
  constructor() {
    // Load base credentials from environment variables
    this.apiKey = process.env.API_KEY || null;
    this.tokenUrl = process.env.OAUTH_TOKEN_URL || null;
    this.clientId = process.env.OAUTH_CLIENT_ID || process.env.XRAY_CLIENT_ID;
    this.clientSecret = process.env.OAUTH_CLIENT_SECRET || process.env.XRAY_CLIENT_SECRET;
    this.oauthToken = null;
  }

  /**
   * Fetches a new OAuth2 token using the client credential flow
   * @returns {Promise<string>} OAuth token
   */
  async getOAuthToken() {
    if (!this.tokenUrl || !this.clientId || !this.clientSecret) {
      throw new Error(
        'Missing OAuth credentials. Ensure OAUTH_TOKEN_URL, CLIENT_ID, and CLIENT_SECRET are set in .env'
      );
    }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`
    });

    if (!response.ok) {
      const errorMessage = `OAuth2 authentication failed: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    this.oauthToken = data.access_token;
    return this.oauthToken;
  }

  /**
   * Returns a basic API key header
   * @returns {Object} API key headers
   */
  getApiKeyHeaders() {
    if (!this.apiKey) {
      throw new Error('API_KEY not set. Define it in your .env file.');
    }

    return {
      'x-api-key': this.apiKey
    };
  }

  /**
   * Returns the Authorization header using the fetched OAuth token
   * @returns {Object} OAuth headers
   */
  getOAuthHeaders() {
    if (!this.oauthToken) {
      throw new Error('OAuth token not initialized. Call getOAuthToken() first.');
    }

    return {
      Authorization: `Bearer ${this.oauthToken}`
    };
  }
}

module.exports = AuthUtils;