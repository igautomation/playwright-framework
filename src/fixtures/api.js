// src/fixtures/api.js

import { request } from '@playwright/test';

// Function to create an isolated API request context
// Accepts a base URL and optional headers
async function createRequestContext(baseURL, extraHTTPHeaders = {}) {
  if (!baseURL) {
    throw new Error('Base URL must be provided to createRequestContext()');
  }

  return await request.newContext({
    baseURL: baseURL,
    extraHTTPHeaders: extraHTTPHeaders,
  });
}

// Core function to issue HTTP requests using a method + endpoint
// Accepts method, endpoint, payload (if applicable), and headers
async function makeApiRequest(context, method, endpoint, payload = {}, headers = {}) {
  if (!context || !method || !endpoint) {
    throw new Error('API context, method, and endpoint are required.');
  }

  const options = {
    headers: headers,
  };

  // Only attach data for non-GET requests
  if (method.toUpperCase() !== 'GET') {
    options.data = payload;
  }

  switch (method.toUpperCase()) {
    case 'GET':
      return await context.get(endpoint, options);
    case 'POST':
      return await context.post(endpoint, options);
    case 'PUT':
      return await context.put(endpoint, options);
    case 'DELETE':
      return await context.delete(endpoint, options);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

// Export individual methods for convenience
async function get(context, endpoint, headers = {}) {
  return await makeApiRequest(context, 'GET', endpoint, {}, headers);
}

async function post(context, endpoint, payload = {}, headers = {}) {
  return await makeApiRequest(context, 'POST', endpoint, payload, headers);
}

async function put(context, endpoint, payload = {}, headers = {}) {
  return await makeApiRequest(context, 'PUT', endpoint, payload, headers);
}

async function del(context, endpoint, headers = {}) {
  return await makeApiRequest(context, 'DELETE', endpoint, {}, headers);
}

// Export all API helpers
export { createRequestContext, get, post, put, del };
