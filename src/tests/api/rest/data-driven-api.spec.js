/**
 * Data-Driven API Tests
 *
 * Demonstrates data-driven testing approach for API tests
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../../utils/api');
require('dotenv').config();

// Test data
const testData = {
  userIds: [1, 2, 3, 23],
  pages: [1, 2, 3],
  users: [
    { 
      name: 'User 1', 
      job: 'Job 1', 
      expectedStatus: 201 
    },
    { 
      name: 'User 2', 
      job: 'Job 2', 
      expectedStatus: 201 
    },
    { 
      name: 'User 3', 
      job: 'Job 3', 
      expectedStatus: 201 
    }
  ],
  queryParams: [
    { 
      param: 'page', 
      value: 1, 
      expectedStatus: 200 
    },
    { 
      param: 'per_page', 
      value: 3, 
      expectedStatus: 200 
    }
  ],
};

test.describe('Data-Driven API Tests', () => {
  let apiClient;

  test.beforeEach(({ request }) => {
    apiClient = new ApiClient(process.env.REQRES_API_URL || 'https://reqres.in');
    // Set authentication token for API requests
    apiClient.setAuthToken(process.env.API_KEY || 'reqres-free-v1');
  });

  // Data-driven test for user creation
  for (const userData of testData.users) {
    test(`Create user: ${userData.name} - ${userData.job}`, async ({ request }) => {
      try {
        // Send POST request to create a user
        const responseData = await apiClient.post('/api/users', {
          name: userData.name,
          job: userData.job,
        });

        // Verify response contains user data
        expect(responseData).toHaveProperty('name', userData.name);
        expect(responseData).toHaveProperty('job', userData.job);
        expect(responseData).toHaveProperty('id');
        expect(responseData).toHaveProperty('createdAt');
      } catch (error) {
        // Check if error status matches expected status (for non-201 cases)
        if (userData.expectedStatus !== 201) {
          expect(error.status).toBe(userData.expectedStatus);
        } else {
          throw error;
        }
      }
    });
  }

  // Data-driven test for user retrieval
  for (const userId of testData.userIds) {
    test(`Get user with ID: ${userId}`, async ({ request }) => {
      // Determine expected status based on user ID
      const maxValidId = 12;
      const expectedStatus = userId <= maxValidId ? 200 : 404;

      try {
        // Send GET request to get a specific user
        const responseData = await apiClient.get(`/api/users/${userId}`);

        // If we get here, the request was successful
        expect(expectedStatus).toBe(200);
        expect(responseData).toHaveProperty('data');
        expect(responseData.data).toHaveProperty('id', userId);
        expect(responseData.data).toHaveProperty('email');
        expect(responseData.data).toHaveProperty('first_name');
        expect(responseData.data).toHaveProperty('last_name');
      } catch (error) {
        // If we expect a 404, that's fine
        if (expectedStatus === 404) {
          expect(error.status).toBe(404);
        } else {
          throw error;
        }
      }
    });
  }

  // Data-driven test for pagination
  for (const page of testData.pages) {
    test(`Get users from page ${page}`, async ({ request }) => {
      // Send GET request to list users with pagination
      const responseData = await apiClient.get('/api/users', {
        params: { page },
      });

      // Verify response structure and data
      expect(responseData).toHaveProperty('page', page);
      expect(responseData).toHaveProperty('data');
      expect(Array.isArray(responseData.data)).toBeTruthy();

      // Determine expected user count based on page
      const maxPageWithData = 2;
      const usersPerPage = 6;
      const expectedUserCount = page <= maxPageWithData ? usersPerPage : 0;
      expect(responseData.data.length).toBe(expectedUserCount);
    });
  }

  // Test with dynamically generated data
  for (const testCase of testData.queryParams) {
    test(`API with ${testCase.param}=${testCase.value}`, async ({ request }) => {
      try {
        // Send GET request with params
        const responseData = await apiClient.get('/api/users', {
          params: { [testCase.param]: testCase.value },
        });

        // Verify response structure
        expect(responseData).toHaveProperty('data');
        expect(Array.isArray(responseData.data)).toBeTruthy();

        // If per_page parameter was used, verify it affected the result
        if (testCase.param === 'per_page') {
          expect(responseData.data.length).toBeLessThanOrEqual(testCase.value);
          expect(responseData.per_page).toBe(testCase.value);
        }
      } catch (error) {
        // Check if error status matches expected status (for non-200 cases)
        if (testCase.expectedStatus !== 200) {
          expect(error.status).toBe(testCase.expectedStatus);
        } else {
          throw error;
        }
      }
    });
  }
});