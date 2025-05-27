/**
 * Data-Driven API Tests
 *
 * Demonstrates data-driven testing approach for API tests
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../../utils/api');
const config = require('../../../config');

// Use config for all settings

// Read test data from config or environment variables
const testData = {
  userIds: process.env.TEST_USER_IDS
    ? process.env.TEST_USER_IDS.split(',').map(Number)
    : config.api?.testData?.userIds || [1, 2, 3, 23],
  pages: process.env.TEST_PAGES
    ? process.env.TEST_PAGES.split(',').map(Number)
    : config.api?.testData?.pages || [1, 2, 3],
  users: config.api?.testData?.users || [
    {
      name: process.env.TEST_USER1_NAME || 'User 1',
      job: process.env.TEST_USER1_JOB || 'Job 1',
      expectedStatus: parseInt(process.env.TEST_USER1_STATUS || '201'),
    },
    {
      name: process.env.TEST_USER2_NAME || 'User 2',
      job: process.env.TEST_USER2_JOB || 'Job 2',
      expectedStatus: parseInt(process.env.TEST_USER2_STATUS || '201'),
    },
    {
      name: process.env.TEST_USER3_NAME || 'User 3',
      job: process.env.TEST_USER3_JOB || 'Job 3',
      expectedStatus: parseInt(process.env.TEST_USER3_STATUS || '201'),
    },
  ],
  queryParams: config.api?.testData?.queryParams || [
    {
      param: process.env.TEST_PARAM1_NAME || 'page',
      value: parseInt(process.env.TEST_PARAM1_VALUE || '1'),
      expectedStatus: parseInt(process.env.TEST_PARAM1_STATUS || '200'),
    },
    {
      param: process.env.TEST_PARAM2_NAME || 'per_page',
      value: parseInt(process.env.TEST_PARAM2_VALUE || '3'),
      expectedStatus: parseInt(process.env.TEST_PARAM2_STATUS || '200'),
    },
  ],
};

test.describe('Data-Driven API Tests', () => {
  let apiClient;

  test.beforeEach(({ request }) => {
    apiClient = new ApiClient('https://reqres.in');
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
      // Read from config or environment variables
      const maxValidId = parseInt(
        process.env.MAX_VALID_USER_ID || config.api?.testData?.maxValidUserId || '12'
      );
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
      // Read from config or environment variables
      const maxPageWithData = parseInt(
        process.env.MAX_PAGE_WITH_DATA || config.api?.testData?.maxPageWithData || '2'
      );
      const usersPerPage = parseInt(
        process.env.USERS_PER_PAGE || config.api?.testData?.usersPerPage || '6'
      );
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
    });/**
 * Data-Driven API Tests
 * 
 * Demonstrates data-driven testing approach for API tests
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../../utils/api');
const config = require('../../../config');

// Use config for all settings

// Read test data from config or environment variables
const testData = {
  userIds: process.env.TEST_USER_IDS ? process.env.TEST_USER_IDS.split(',').map(Number) : config.api?.testData?.userIds || [1, 2, 3, 23],
  pages: process.env.TEST_PAGES ? process.env.TEST_PAGES.split(',').map(Number) : config.api?.testData?.pages || [1, 2, 3],
  users: config.api?.testData?.users || [
    { 
      name: process.env.TEST_USER1_NAME || 'User 1', 
      job: process.env.TEST_USER1_JOB || 'Job 1', 
      expectedStatus: parseInt(process.env.TEST_USER1_STATUS || '201') 
    },
    { 
      name: process.env.TEST_USER2_NAME || 'User 2', 
      job: process.env.TEST_USER2_JOB || 'Job 2', 
      expectedStatus: parseInt(process.env.TEST_USER2_STATUS || '201') 
    },
    { 
      name: process.env.TEST_USER3_NAME || 'User 3', 
      job: process.env.TEST_USER3_JOB || 'Job 3', 
      expectedStatus: parseInt(process.env.TEST_USER3_STATUS || '201') 
    }
  ],
  queryParams: config.api?.testData?.queryParams || [
    { 
      param: process.env.TEST_PARAM1_NAME || 'page', 
      value: parseInt(process.env.TEST_PARAM1_VALUE || '1'), 
      expectedStatus: parseInt(process.env.TEST_PARAM1_STATUS || '200') 
    },
    { 
      param: process.env.TEST_PARAM2_NAME || 'per_page', 
      value: parseInt(process.env.TEST_PARAM2_VALUE || '3'), 
      expectedStatus: parseInt(process.env.TEST_PARAM2_STATUS || '200') 
    }
  ]
};

test.describe('Data-Driven API Tests', () => {
  let apiClient;
  
  test.beforeEach(({ request }) => {
    apiClient = new ApiClient('https://reqres.in');
  });
  
  // Data-driven test for user creation
  for (const userData of testData.users) {
    test(`Create user: ${userData.name} - ${userData.job}`, async ({ request }) => {
      try {
        // Send POST request to create a user
        const responseData = await apiClient.post('/api/users', {
          name: userData.name,
          job: userData.job
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
      // Read from config or environment variables
      const maxValidId = parseInt(process.env.MAX_VALID_USER_ID || config.api?.testData?.maxValidUserId || '12');
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
        params: { page }
      });
      
      // Verify response structure and data
      expect(responseData).toHaveProperty('page', page);
      expect(responseData).toHaveProperty('data');
      expect(Array.isArray(responseData.data)).toBeTruthy();
      
      // Determine expected user count based on page
      // Read from config or environment variables
      const maxPageWithData = parseInt(process.env.MAX_PAGE_WITH_DATA || config.api?.testData?.maxPageWithData || '2');
      const usersPerPage = parseInt(process.env.USERS_PER_PAGE || config.api?.testData?.usersPerPage || '6');
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
          params: { [testCase.param]: testCase.value }
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

  }
});
