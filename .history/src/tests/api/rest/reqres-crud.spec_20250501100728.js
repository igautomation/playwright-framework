// src/tests/api/rest/reqres-crud.spec.js

// Import the custom Playwright test object and expect from combined fixture
import { test, expect } from '../../../../fixtures/combined.js';

// Import utility to send requests using apiClient and validate schemas
import ApiUtils from '../../../../utils/api/apiUtils.js';

// Import YAML test data for creating a user
import { readYaml } from '../../../../utils/common/dataOrchestrator.js';

// Define JSON schema for create user response validation
const createUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    job: { type: 'string' },
    createdAt: { type: 'string' }
  },
  required: ['id', 'name', 'job', 'createdAt']
};

// Define JSON schema for updated user response validation
const updateUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    job: { type: 'string' },
    updatedAt: { type: 'string' }
  },
  required: ['name', 'job', 'updatedAt']
};

// Describe block for grouping Reqres CRUD tests
test.describe.parallel('Reqres.in API CRUD Tests', () => {
  // Test: Create a new user using data from YAML
  test('Create User', async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      // Load test data from YAML file
      const userData = readYaml('src/data/testData.yaml').user;

      // Send POST request to create user
      const { status, body } = await apiUtils.sendRequest('POST', '/api/users', userData);

      // Basic assertions on response fields
      expect(status).toBe(201);
      expect(body.name).toBe(userData.name);
      expect(body.job).toBe(userData.job);

      // Validate response schema
      apiUtils.validateSchema(body, createUserSchema, 'POST /api/users');

      // Store user ID in annotations for use in dependent tests
      testInfo.annotations.push({ type: 'user_id', description: body.id });
    } catch (error) {
      // Retry and fail gracefully
      await retryDiagnostics(error);
      throw new Error('Create user failed: ' + error.message);
    }
  });

  // Test: Read user list with delay
  test('Read User List', async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      // Send GET request to fetch paginated user list
      const { status, body } = await apiUtils.sendRequest('GET', '/api/users?page=2&delay=1');

      // Assert HTTP 200 and presence of user data
      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Read user list failed: ' + error.message);
    }
  });

  // Test: Update a newly created user
  test('Update User', async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      // First, create a user to update
      const userData = readYaml('src/data/testData.yaml').user;
      const createResponse = await apiUtils.sendRequest('POST', '/api/users', userData);
      const userId = createResponse.body.id;

      // Update user's name and job with new data
      const updatePayload = { name: 'Updated User', job: 'QA Lead' };
      const { status, body } = await apiUtils.sendRequest(
        'PUT',
        `/api/users/${userId}`,
        updatePayload
      );

      // Assert updates and validate schema
      expect(status).toBe(200);
      expect(body.name).toBe(updatePayload.name);
      expect(body.job).toBe(updatePayload.job);
      apiUtils.validateSchema(body, updateUserSchema, `PUT /api/users/${userId}`);
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Update user failed: ' + error.message);
    }
  });

  // Test: Delete a user and ensure deletion is idempotent
  test('Delete User', async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);
    try {
      // First, create a user to delete
      const userData = readYaml('src/data/testData.yaml').user;
      const createResponse = await apiUtils.sendRequest('POST', '/api/users', userData);
      const userId = createResponse.body.id;

      // Send DELETE request
      const deleteResponse = await apiUtils.sendRequest('DELETE', `/api/users/${userId}`);
      expect(deleteResponse.status).toBe(204);

      // Send DELETE again to check idempotency
      const repeatDelete = await apiUtils.sendRequest('DELETE', `/api/users/${userId}`);
      expect(repeatDelete.status).toBe(204);
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Delete user failed: ' + error.message);
    }
  });
});
