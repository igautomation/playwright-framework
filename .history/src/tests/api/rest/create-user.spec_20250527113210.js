/**
 * Create User API Tests
 *
 * Tests for user creation API endpoints
 */
const { test, expect } = require('@playwright/test');
const ApiClient = require('../../../utils/api/apiClient');
const { SchemaValidator } = require('../../../utils/api/schemaValidator');
const config = require('../../../config.js'); // Explicit path with .js extension

// Debug config loading
console.log('Config file path:', require.resolve('../../../config'));
console.log('API base URL:', config.api.baseUrl);

// Define schemas
const createUserSchema = {
  type: 'object',
  required: ['name', 'job', 'id', 'createdAt'],
  properties: {
    name: { type: 'string' },
    job: { type: 'string' },
    id: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const updateUserSchema = {
  type: 'object',
  required: ['name', 'job', 'updatedAt'],
  properties: {
    name: { type: 'string' },
    job: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

test.describe('Create User API Tests', () => {
  let apiClient;
  let schemaValidator;

  test.beforeEach(({ request }) => {
    // Create a new API client with the correct URL and debug the requests
    apiClient = new ApiClient('https://reqres.in');
    console.log('Using API base URL:', apiClient.baseUrl);
    schemaValidator = new SchemaValidator();
  });
});

// Then update all API calls to include /api in the path
// For example:
const responseData = await apiClient.post('/api/users', userData);


  test('Create new user with valid data', async ({ request }) => {
    // Get user data from config
    const userData = {
      name: config.api.testData.newUser?.name || 'John Doe',
      job: config.api.testData.newUser?.job || 'Software Engineer',
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
    // Generate minimal user data from config
    const userData = {
      name: config.api.testData.newUser?.name || 'Jane Smith',
    };

    // Send POST request to create a user
    const responseData = await apiClient.post('/users', userData);

    // Verify response contains user data and id
    expect(responseData).toHaveProperty('name', userData.name);
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('createdAt');
  });

  test('Update user with PUT request', async ({ request }) => {
    // Get updated user data from config
    const updatedUserData = {
      name: `${config.api.testData.newUser?.name || 'John'} Updated`,
      job: config.api.testData.newUser?.job
        ? `Senior ${config.api.testData.newUser.job}`
        : 'Senior Engineer',
    };

    // Send PUT request to update a user
    const responseData = await apiClient.put(
      `/users/${config.api.testData.userId || 2}`,
      updatedUserData
    );

    // Verify response structure using schema validation
    const validationResult = schemaValidator.validate(responseData, updateUserSchema);
    expect(validationResult.valid).toBeTruthy();

    // Additional assertions
    expect(responseData.name).toBe(updatedUserData.name);
    expect(responseData.job).toBe(updatedUserData.job);
    expect(responseData.updatedAt).toBeDefined();
  });

  test('Update user with PATCH request', async ({ request }) => {
    // Generate partial user data from config
    const partialUserData = {
      job: config.api.testData.newUser?.job
        ? `${config.api.testData.newUser.job} Manager`
        : 'Product Manager',
    };

    // Send PATCH request to update a user
    const responseData = await apiClient.patch(
      `/users/${config.api.testData.userId || 2}`,
      partialUserData
    );

    // Verify response contains updated data
    expect(responseData).toHaveProperty('job', partialUserData.job);
    expect(responseData).toHaveProperty('updatedAt');
  });

  test('Delete user', async ({ request }) => {
    try {
      // Send DELETE request to delete a user
      await apiClient.delete(`/users/${config.api.testData.userId || 2}`);
      // If we get here, the request was successful (204 No Content)
      expect(true).toBeTruthy();
    } catch (error) {
      // If there's an error, the test should fail
      expect(error).toBeUndefined();
    }
  });
});
