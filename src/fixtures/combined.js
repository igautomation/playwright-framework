// src/fixtures/combined.js
import { expect } from "@playwright/test";
import { customTest } from "./customFixtures.js";
import { createRequestContext, get, post, put, del } from "./api.js";

// Rename to avoid confusion with exported 'test'
const test = customTest.extend({
  apiClient: customTest.apiClient,
  retryDiagnostics: customTest.retryDiagnostics,
});

/**
 * Fetch user data by ID.
 * @param {string} baseURL - Base API URL
 * @param {string} userId - User ID
 * @returns {Promise<object>} User data
 */
async function fetchUserData(baseURL, userId) {
  const context = await createRequestContext(baseURL);
  const response = await get(context, `/users/${userId}`);
  return response.json();
}

/**
 * Update user data by ID.
 * @param {string} baseURL - Base API URL
 * @param {string} userId - User ID
 * @param {object} data - Data to update
 * @returns {Promise<object>} Update response
 */
async function updateUserData(baseURL, userId, data) {
  const context = await createRequestContext(baseURL);
  const response = await put(context, `/users/${userId}`, data);
  return response.json();
}

export { test, expect };
