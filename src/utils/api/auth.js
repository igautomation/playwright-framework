// src/utils/api/auth.js

/**
 * Authentication utilities for API testing.
 */

class AuthUtils {
  constructor() {
    this.apiKey = process.env.API_KEY || 'mock-key';
    this.oauthToken = null;
  }

  async getOAuthToken(tokenUrl, clientId, clientSecret) {
    if (!tokenUrl || !clientId || !clientSecret) {
      throw new Error('Token URL, client ID, and client secret are required');
    }
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    });
    if (!response.ok) throw new Error(`OAuth2 authentication failed: ${response.statusText}`);
    const data = await response.json();
    this.oauthToken = data.access_token;
    return this.oauthToken;
  }

  getApiKeyHeaders() {
    return { 'X-API-Key': this.apiKey };
  }

  getOAuthHeaders() {
    if (!this.oauthToken) throw new Error('OAuth token not set. Call getOAuthToken first.');
    return { Authorization: `Bearer ${this.oauthToken}` };
  }
}

// Correct ESM Export
export default AuthUtils;