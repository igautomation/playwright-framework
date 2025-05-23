/**
 * User API Tests
 * 
 * Tests for user-related API endpoints
 */
const { test, expect } = require('@playwright/test');
const { ApiUtils } = require('../../../utils/api/apiUtils');
const { SchemaValidator } = require('../../../utils/api/schemaValidator');
const config = require('../../../config');

// Read base URL from environment or config
const baseUrl = process.env.API_BASE_URL || config.api?.baseUrl;

// Read test data from config or use environment variables
const testData = {
  userId: parseInt(process.env.TEST_USER_ID) || config.api?.testData?.userId,
  nonExistentUserId: parseInt(process.env.TEST_NONEXISTENT_USER_ID) || config.api?.testData?.nonExistentUserId
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
          email: { type: 'string', format: 'email' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          avatar: { type: 'string', format: 'uri' }
        }
      }
    }
  }
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
        email: { type: 'string', format: 'email' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        avatar: { type: 'string', format: 'uri' }
      }
    }
  }
};

test.describe('User API Tests', () => {
  let apiUtils;
  let schemaValidator;
  
  test.beforeEach(({ request }) => {
    apiUtils = new ApiUtils(request, baseUrl);
    schemaValidator = new SchemaValidator();
  });
  
  test('Get list of users', async ({ request }) => {
    // Send GET request to list users endpoint
    const response = await apiUtils.get('/users', {
      params: { page: 1 }
    });
    
    // Verify response status
    expect(response.status()).toBe(200);
    
    // Verify response structure using schema validation
    const responseBody = await response.json();
    const validationResult = schemaValidator.validate(responseBody, userListSchema);
    expect(validationResult.valid).toBeTruthy();
    
    // Additional assertions
    expect(responseBody.page).toBe(1);
    expect(responseBody.data.length).toBeGreaterThan(0);
  });
  
  test('Get single user by ID', async ({ request }) => {
    // Send GET request to get a specific user
    const userId = testData.userId;
    const response = await apiUtils.get(`/users/${userId}`);
    
    // Verify response status
    expect(response.status()).toBe(200);
    
    // Verify response structure using schema validation
    const responseBody = await response.json();
    const validationResult = schemaValidator.validate(responseBody, singleUserSchema);
    expect(validationResult.valid).toBeTruthy();
    
    // Additional assertions
    expect(responseBody.data.id).toBe(userId);
  });
  
  test('Get non-existent user returns 404', async ({ request }) => {
    // Send GET request for a user that doesn't exist
    const userId = testData.nonExistentUserId;
    const response = await apiUtils.get(`/users/${userId}`);
    
    // Verify response status is 404 Not Found
    expect(response.status()).toBe(404);
    
    // Verify response body is empty
    const responseBody = await response.json();
    expect(responseBody).toEqual({});
  });
  
  test('Get user resources', async ({ request }) => {
    // Send GET request to get user resources
    const response = await apiUtils.get('/unknown');
    
    // Verify response status
    expect(response.status()).toBe(200);
    
    // Verify response structure
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('page');
    expect(responseBody).toHaveProperty('per_page');
    expect(responseBody).toHaveProperty('total');
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBeTruthy();
  });
});