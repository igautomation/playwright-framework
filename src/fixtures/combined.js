// src/fixtures/combined.js
// src/fixtures/combined.js
const { test, expect } = require('@playwright/test');

module.exports = { test, expect };

/**
 * Combined API utility module.
 * This layer uses core API request methods to provide ready-to-use functions
 * for common user-related operations like fetching and updating user data.
 */

const { createRequestContext, get, post, put, del } = require("./api");

/**
 * Fetches user data for a specific user ID.
 * Creates a fresh request context for each call to maintain isolation.
 *
 * @param {string} baseURL - The base URL of the API (e.g., 'https://example.com/api').
 * @param {string} userId - The unique identifier of the user to fetch.
 * @returns {Promise<object>} - The JSON response containing user details.
 *
 * Example usage:
 * ```javascript
 * const userData = await fetchUserData('https://example.com/api', '123');
 * console.log(userData);
 * ```
 */
async function fetchUserData(baseURL, userId) {
  const context = await createRequestContext(baseURL);
  const response = await get(context, `/users/${userId}`);
  return response.json();
}

/**
 * Updates user data for a specific user ID.
 * Sends a PUT request with the provided data payload.
 *
 * @param {string} baseURL - The base URL of the API (e.g., 'https://example.com/api').
 * @param {string} userId - The unique identifier of the user to update.
 * @param {object} data - The data object containing fields to update.
 * @returns {Promise<object>} - The JSON response after the update.
 *
 * Example usage:
 * ```javascript
 * const updated = await updateUserData('https://example.com/api', '123', { name: 'New Name' });
 * console.log(updated);
 * ```
 */
async function updateUserData(baseURL, userId, data) {
  const context = await createRequestContext(baseURL);
  const response = await put(context, `/users/${userId}`, data);
  return response.json();
}

// Export all utility functions for external use
module.exports = {
  fetchUserData,
  updateUserData,
};