// src/utils/api/auth.js

/**
 * Authentication utility for API testing inside the framework.
 * Supports both:
 * - Static API key header (via API_KEY)
 * - OAuth2 client credential flow (via XRAY_CLIENT_ID, XRAY_CLIENT_SECRET)
 *
 * This utility should be used inside fixtures or API utilities (not directly in test files).
 */

class AuthUtils {
  constructor() {
    // Load base credentials from environment variables
    this.apiKey = process.env.API_KEY || null;
    this.tokenUrl = process.env.OAUTH_TOKEN_URL || null;
    this.clientId = process.env.OAUTH_CLIENT_ID || process.env.XRAY_CLIENT_ID;
    this.clientSecret = process.env.OAUTH_CLIENT_SECRET || process.env.XRAY_CLIENT_SECRET;
    this.oauthToken = null;
  }

  /**
   * Fetches a new OAuth2 token using the client credential flow.
   * This method should be called before using getOAuthHeaders().
   */
  async getOAuthToken() {
    if (!this.tokenUrl || !this.clientId || !this.clientSecret) {
      throw new Error('Missing OAuth credentials. Ensure OAUTH_TOKEN_URL, CLIENT_ID, and CLIENT_SECRET are set in .env');
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
   * Returns a basic API key header.
   * This should be used when only static tokens are needed.
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
   * Returns the Authorization header using the fetched OAuth token.
   * Requires getOAuthToken() to be called first.
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

export default AuthUtils;