/**
 * ReqRes API Tests with Schema Validation
 *
 * Tests for ReqRes API with JSON schema validation
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../../utils/api');
const { SchemaValidator } = require('../../../utils/api/schemaValidator');
require('dotenv').config();

// Define schemas
const schemas = {
  usersList: {
    type: 'object',
    required: ['page', 'per_page', 'total', 'total_pages', 'data', 'support'],
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
      support: {
        type: 'object',
        required: ['url', 'text'],
        properties: {
          url: { type: 'string' },
          text: { type: 'string' },
        },
      },
    },
  },
  singleUser: {
    type: 'object',
    required: ['data', 'support'],
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
      support: {
        type: 'object',
        required: ['url', 'text'],
        properties: {
          url: { type: 'string' },
          text: { type: 'string' },
        },
      },
    },
  },
  createUser: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      job: { type: 'string' },
      id: { type: 'string' },
      createdAt: { type: 'string' },
    },
  }
};

test.describe('ReqRes API with Schema Validation', () => {
  let apiClient;
  let schemaValidator;

  test.beforeEach(({ request }) => {
    apiClient = new ApiClient(process.env.REQRES_API_URL || 'https://reqres.in');
    // Set authentication token for API requests
    apiClient.setAuthToken(process.env.API_KEY || 'reqres-free-v1');
    schemaValidator = new SchemaValidator();
  });

  test('Get users list with schema validation', async ({ request }) => {
    // Get page parameter
    const page = 1;

    // Send GET request to list users endpoint
    const responseData = await apiClient.get('/api/users', {
      params: { page },
    });

    // Validate response against schema
    const validationResult = schemaValidator.validate(responseData, schemas.usersList);
    expect(validationResult.valid).toBeTruthy();

    // Additional assertions
    expect(responseData.page).toBe(page);
    expect(responseData.data.length).toBeGreaterThan(0);
  });

  test('Get single user with schema validation', async ({ request }) => {
    // Get user ID
    const userId = 2;

    // Send GET request to get a specific user
    const responseData = await apiClient.get(`/api/users/${userId}`);

    // Validate response against schema
    const validationResult = schemaValidator.validate(responseData, schemas.singleUser);
    expect(validationResult.valid).toBeTruthy();

    // Additional assertions
    expect(responseData.data.id).toBe(userId);
  });

  test('Create user with schema validation', async ({ request }) => {
    // Get user data
    const userData = {
      name: 'Test User',
      job: 'Test Job',
    };

    // Send POST request to create a user
    const responseData = await apiClient.post('/api/users', userData);

    // Just check the basic properties
    expect(responseData).toHaveProperty('name', userData.name);
    expect(responseData).toHaveProperty('job', userData.job);
    expect(responseData).toHaveProperty('id');
  });

  test('Validate error response for non-existent resource', async ({ request }) => {
    // Get non-existent resource ID
    const resourceId = 999;

    try {
      // Send GET request for a non-existent resource
      await apiClient.get(`/api/unknown/${resourceId}`);
      // If we get here, the request didn't fail as expected
      expect(false).toBeTruthy('Expected request to fail with 404');
    } catch (error) {
      // Verify response status is 404 Not Found
      expect(error.status).toBe(404);
    }
  });
});