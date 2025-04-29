// src/fixtures/combined.js

import { test as base, expect } from '@playwright/test';
import { customTest } from './customFixtures.js';
import { createRequestContext, get, post, put, del } from './api.js';

const test = customTest.extend({});

/**
 * Fetch user data by ID.
 */
async function fetchUserData(baseURL, userId) {
  const context = await createRequestContext(baseURL);
  const response = await get(context, `/users/${userId}`);
  return response.json();
}

/**
 * Update user data by ID.
 */
async function updateUserData(baseURL, userId, data) {
  const context = await createRequestContext(baseURL);
  const response = await put(context, `/users/${userId}`, data);
  return response.json();
}

// Export everything cleanly
export { test, expect, fetchUserData, updateUserData };
