/**
 * Create User API Tests
 * 
 * Tests for user creation API endpoints
 */
const { test, expect } = require('@playwright/test');
const { ApiUtils } = require('../../../utils/api/apiUtils');
const { SchemaValidator } = require('../../../utils/api/schemaValidator');
const { DataGenerator } = require('../../../utils/data/dataGenerator');
const config = require('../../../config');

// Read base URL from environment or config
const baseUrl = process.env.API_BASE_URL || config.api?.baseUrl;

// Define schemas
const createUserSchema = {
  type: 'object',
  required: ['name', 'job', 'id', 'createdAt'],
  properties: {
    name: { type: 'string' },
    job: { type: 'string' },
    id: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' }
  }
};

const updateUserSchema = {
  type: 'object',
  required: ['name', 'job', 'updatedAt'],
  properties: {
    name: { type: 'string' },
    job: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
};

test.describe('Create User API Tests', () => {
  let apiUtils;
  let schemaValidator;
  let dataGenerator;
  
  test.beforeEach(({ request }) => {
    apiUtils = new ApiUtils(request, baseUrl);
    schemaValidator = new SchemaValidator();
    dataGenerator = new DataGenerator();
  });
  
  test('Create new user with valid data', async ({ request }) => {
    // Generate random user data
    const userData = {
      name: dataGenerator.fullName(),
      job: dataGenerator.jobTitle()
    };
    
    // Send POST request to create a user
    const response = await apiUtils.post('/users', userData);
    
    // Verify response status
    expect(response.status()).toBe(201);
    
    // Verify response structure using schema validation
    const responseBody = await response.json();
    const validationResult = schemaValidator.validate(responseBody, createUserSchema);
    expect(validationResult.valid).toBeTruthy();
    
    // Additional assertions
    expect(responseBody.name).toBe(userData.name);
    expect(responseBody.job).toBe(userData.job);
    expect(responseBody.id).toBeDefined();
    expect(responseBody.createdAt).toBeDefined();
  });
  
  test('Create user with minimal data', async ({ request }) => {
    // Generate minimal user data
    const userData = {
      name: dataGenerator.firstName()
    };
    
    // Send POST request to create a user
    const response = await apiUtils.post('/users', userData);
    
    // Verify response status
    expect(response.status()).toBe(201);
    
    // Verify response contains user data and id
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('name', userData.name);
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('createdAt');
  });
  
  test('Update user with PUT request', async ({ request }) => {
    // Generate random user data
    const updatedUserData = {
      name: dataGenerator.fullName(),
      job: dataGenerator.jobTitle()
    };
    
    // Get user ID from environment or config
    const userId = parseInt(process.env.TEST_USER_ID) || config.api?.testData?.userId;
    
    // Send PUT request to update a user
    const response = await apiUtils.put(`/users/${userId}`, updatedUserData);
    
    // Verify response status
    expect(response.status()).toBe(200);
    
    // Verify response structure using schema validation
    const responseBody = await response.json();
    const validationResult = schemaValidator.validate(responseBody, updateUserSchema);
    expect(validationResult.valid).toBeTruthy();
    
    // Additional assertions
    expect(responseBody.name).toBe(updatedUserData.name);
    expect(responseBody.job).toBe(updatedUserData.job);
    expect(responseBody.updatedAt).toBeDefined();
  });
  
  test('Update user with PATCH request', async ({ request }) => {
    // Generate partial user data
    const partialUserData = {
      job: dataGenerator.jobTitle()
    };
    
    // Get user ID from environment or config
    const userId = parseInt(process.env.TEST_USER_ID) || config.api?.testData?.userId;
    
    // Send PATCH request to update a user
    const response = await apiUtils.patch(`/users/${userId}`, partialUserData);
    
    // Verify response status
    expect(response.status()).toBe(200);
    
    // Verify response contains updated data
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('job', partialUserData.job);
    expect(responseBody).toHaveProperty('updatedAt');
  });
  
  test('Delete user', async ({ request }) => {
    // Get user ID from environment or config
    const userId = parseInt(process.env.TEST_USER_ID) || config.api?.testData?.userId;
    
    // Send DELETE request to delete a user
    const response = await apiUtils.delete(`/users/${userId}`);
    
    // Verify response status for successful deletion (204 No Content)
    expect(response.status()).toBe(204);
  });
});