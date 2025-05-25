/**
 * Create User API Tests
 * 
 * Tests for user creation API endpoints
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../../utils/api');
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
  let apiClient;
  let schemaValidator;
  let dataGenerator;
  
  test.beforeEach(({ request }) => {
    apiClient = new ApiClient(baseUrl);
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
    const responseData = await apiClient.post('/users', userData);
    
    // Verify response structure using schema validation
    const validationResult = schemaValidator.validate(responseData, createUserSchema);
    expect(validationResult.valid).toBeTruthy();
    
    // Additional assertions
    expect(responseData.name).toBe(userData.name);
    expect(responseData.job).toBe(userData.job);
    expect(responseData.id).toBeDefined();
    expect(responseData.createdAt).toBeDefined();
  });
  
  test('Create user with minimal data', async ({ request }) => {
    // Generate minimal user data
    const userData = {
      name: dataGenerator.firstName()
    };
    
    // Send POST request to create a user
    const responseData = await apiClient.post('/users', userData);
    
    // Verify response contains user data and id
    expect(responseData).toHaveProperty('name', userData.name);
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('createdAt');
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
    const responseData = await apiClient.put(`/users/${userId}`, updatedUserData);
    
    // Verify response structure using schema validation
    const validationResult = schemaValidator.validate(responseData, updateUserSchema);
    expect(validationResult.valid).toBeTruthy();
    
    // Additional assertions
    expect(responseData.name).toBe(updatedUserData.name);
    expect(responseData.job).toBe(updatedUserData.job);
    expect(responseData.updatedAt).toBeDefined();
  });
  
  test('Update user with PATCH request', async ({ request }) => {
    // Generate partial user data
    const partialUserData = {
      job: dataGenerator.jobTitle()
    };
    
    // Get user ID from environment or config
    const userId = parseInt(process.env.TEST_USER_ID) || config.api?.testData?.userId;
    
    // Send PATCH request to update a user
    const responseData = await apiClient.patch(`/users/${userId}`, partialUserData);
    
    // Verify response contains updated data
    expect(responseData).toHaveProperty('job', partialUserData.job);
    expect(responseData).toHaveProperty('updatedAt');
  });
  
  test('Delete user', async ({ request }) => {
    // Get user ID from environment or config
    const userId = parseInt(process.env.TEST_USER_ID) || config.api?.testData?.userId;
    
    try {
      // Send DELETE request to delete a user
      await apiClient.delete(`/users/${userId}`);
      // If we get here, the request was successful (204 No Content)
      expect(true).toBeTruthy();
    } catch (error) {
      // If there's an error, the test should fail
      expect(error).toBeUndefined();
    }
  });
});