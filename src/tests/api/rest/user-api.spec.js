/**
 * User API Tests
 *
 * Tests for user-related API endpoints
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../../utils/api');
const { SchemaValidator } = require('../../../utils/api/schemaValidator');
require('dotenv').config();

// Test data
const testData = {
  userId: 2,
  nonExistentUserId: 999,
};

// Define schemas
const userListSchema = {
  type: 'object',
  required: ['page', 'per_page', 'total', 'total_pages', 'data'],
  properties: {
    page: { type: 'number' },
    per_page: { type: 'number' },
    total: { type: 'number' },
    total_pages: { type: 'number' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'email', 'first_name', 'last_name', 'avatar'],
        properties: {
          id: { type: 'number' },
          email: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          avatar: { type: 'string' },
        },
      },
    },
  },
};

const singleUserSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['id', 'email', 'first_name', 'last_name', 'avatar'],
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        avatar: { type: 'string' },
      },
    },
  },
};

test.describe('User API Tests', () => {
  let apiClient;
  let schemaValidator;

  test.beforeEach(({ request }) => {
    apiClient = new ApiClient(process.env.REQRES_API_URL || 'https://reqres.in');
    // Set authentication token for API requests
    apiClient.setAuthToken(process.env.API_KEY || 'reqres-free-v1');
    schemaValidator = new SchemaValidator();
  });

  test('Get list of users', async ({ request }) => {
    // Send GET request to list users endpoint
    const responseData = await apiClient.get('/api/users', {
      params: { page: 1 },
    });

    // Verify response structure using schema validation
    const validationResult = schemaValidator.validate(responseData, userListSchema);
    expect(validationResult.valid).toBeTruthy();

    // Additional assertions
    expect(responseData.page).toBe(1);
    expect(responseData.data.length).toBeGreaterThan(0);
  });

  test('Get single user by ID', async ({ request }) => {
    // Send GET request to get a specific user
    const userId = testData.userId;
    const responseData = await apiClient.get(`/api/users/${userId}`);

    // Verify response structure using schema validation
    const validationResult = schemaValidator.validate(responseData, singleUserSchema);
    expect(validationResult.valid).toBeTruthy();

    // Additional assertions
    expect(responseData.data.id).toBe(userId);
  });

  test('Get non-existent user returns 404', async ({ request }) => {
    // Send GET request for a user that doesn't exist
    const userId = testData.nonExistentUserId;

    try {
      await apiClient.get(`/api/users/${userId}`);
      // If we get here, the request didn't fail as expected
      expect(false).toBeTruthy('Expected request to fail with 404');
    } catch (error) {
      // Verify response status is 404 Not Found
      expect(error.status).toBe(404);
    }
  });

  test('Get user resources', async ({ request }) => {
    // Send GET request to get user resources
    const responseData = await apiClient.get('/api/unknown');

    // Verify response structure
    expect(responseData).toHaveProperty('page');
    expect(responseData).toHaveProperty('per_page');
    expect(responseData).toHaveProperty('total');
    expect(responseData).toHaveProperty('data');
    expect(Array.isArray(responseData.data)).toBeTruthy();
  });
});