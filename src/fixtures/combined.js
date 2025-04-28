// src/fixtures/combined.js
require('module-alias/register');

const { test: baseTest, expect } = require('@playwright/test');
const { test: customTest } = require('./customFixtures');
const { createRequestContext, get, post, put, del } = require("./api");

// Extend Playwright base test with custom fixtures
const test = customTest.extend({});

/**
 * Fetches user data for a specific user ID.
 *
 * @param {string} baseURL - Base API URL.
 * @param {string} userId - ID of the user to fetch.
 * @returns {Promise<object>} - User data JSON.
 */
async function fetchUserData(baseURL, userId) {
  const context = await createRequestContext(baseURL);
  const response = await get(context, `/users/${userId}`);
  return response.json();
}

/**
 * Updates user data for a specific user ID.
 *
 * @param {string} baseURL - Base API URL.
 * @param {string} userId - ID of the user to update.
 * @param {object} data - Data to update the user with.
 * @returns {Promise<object>} - Update response JSON.
 */
async function updateUserData(baseURL, userId, data) {
  const context = await createRequestContext(baseURL);
  const response = await put(context, `/users/${userId}`, data);
  return response.json();
}

// Export everything properly
module.exports = {
  test,
  expect,
  fetchUserData,
  updateUserData
};