/**
 * User API tests
 */
const { test, expect } = require('@playwright/test');
const User = require('../../../utils/api/models/User');
const TestDataFactory = require('../../../utils/common/testDataFactory');
const schemaValidator = require('../../../utils/api/schemaValidator');
const fs = require('fs');
const path = require('path');

// Load user schema
const userSchemaPath = path.resolve(
  __dirname,
  '../../../../data/schemas/user.schema.json'
);
let userSchema;

test.beforeAll(() => {
  // Load user schema if it exists
  if (fs.existsSync(userSchemaPath)) {
    userSchema = JSON.parse(fs.readFileSync(userSchemaPath, 'utf8'));
    schemaValidator.addSchema('user', userSchema);
  }
});

test.describe('User API @api', () => {
  let testUser;

  test.beforeEach(() => {
    // Generate test user data
    testUser = new User(TestDataFactory.generateUser());
  });

  test('should create a new user @smoke', async ({ request }) => {
    // Create a simple API client
    const apiClient = {
      post: async (url, data) => {
        const response = await request.post(url, { data });
        return await response.json();
      },
      get: async (url) => {
        const response = await request.get(url);
        return await response.json();
      },
      put: async (url, data) => {
        const response = await request.put(url, { data });
        return await response.json();
      },
      delete: async (url) => {
        const response = await request.delete(url);
        return await response.json();
      }
    };
    
    // Create user
    const response = await apiClient.post('/user', testUser.toJSON());

    // Verify response
    expect(response).toBeDefined();
    expect(response.id).toBeDefined();
    expect(response.username).toBe(testUser.username);

    // Validate against schema if available
    if (userSchema) {
      const result = schemaValidator.validate('user', response);
      expect(result.valid).toBeTruthy();
    }
  });

  test('should get user by username', async ({ request }) => {
    // Create a simple API client
    const apiClient = {
      post: async (url, data) => {
        const response = await request.post(url, { data });
        return await response.json();
      },
      get: async (url) => {
        const response = await request.get(url);
        return await response.json();
      },
      put: async (url, data) => {
        const response = await request.put(url, { data });
        return await response.json();
      },
      delete: async (url) => {
        const response = await request.delete(url);
        return await response.json();
      }
    };
    
    // Create user first
    await apiClient.post('/user', testUser.toJSON());

    // Get user
    const response = await apiClient.get(`/user/${testUser.username}`);

    // Verify response
    expect(response).toBeDefined();
    expect(response.username).toBe(testUser.username);
    expect(response.email).toBe(testUser.email);

    // Validate against schema if available
    if (userSchema) {
      const result = schemaValidator.validate('user', response);
      expect(result.valid).toBeTruthy();
    }
  });

  test('should update user', async ({ request }) => {
    // Create a simple API client
    const apiClient = {
      post: async (url, data) => {
        const response = await request.post(url, { data });
        return await response.json();
      },
      get: async (url) => {
        const response = await request.get(url);
        return await response.json();
      },
      put: async (url, data) => {
        const response = await request.put(url, { data });
        return await response.json();
      },
      delete: async (url) => {
        const response = await request.delete(url);
        return await response.json();
      }
    };
    
    // Create user first
    await apiClient.post('/user', testUser.toJSON());

    // Update user
    testUser.email = `updated-${testUser.email}`;
    const response = await apiClient.put(
      `/user/${testUser.username}`,
      testUser.toJSON()
    );

    // Verify response
    expect(response).toBeDefined();

    // Get updated user
    const updatedUser = await apiClient.get(`/user/${testUser.username}`);
    expect(updatedUser.email).toBe(testUser.email);
  });

  test('should delete user', async ({ request }) => {
    // Create a simple API client
    const apiClient = {
      post: async (url, data) => {
        const response = await request.post(url, { data });
        return await response.json();
      },
      get: async (url) => {
        const response = await request.get(url);
        if (!response.ok()) {
          const error = new Error('API request failed');
          error.response = response;
          throw error;
        }
        return await response.json();
      },
      put: async (url, data) => {
        const response = await request.put(url, { data });
        return await response.json();
      },
      delete: async (url) => {
        const response = await request.delete(url);
        return await response.json();
      }
    };
    
    // Create user first
    await apiClient.post('/user', testUser.toJSON());

    // Delete user
    const response = await apiClient.delete(`/user/${testUser.username}`);

    // Verify response
    expect(response).toBeDefined();

    // Try to get deleted user (should fail)
    try {
      await apiClient.get(`/user/${testUser.username}`);
      // If we get here, the user was not deleted
      expect(false).toBeTruthy();
    } catch (error) {
      // Expected error
      expect(error.response.status()).toBe(404);
    }
  });
});
