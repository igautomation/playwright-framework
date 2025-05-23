/**
 * Data-Driven API Tests
 * 
 * Demonstrates data-driven testing approach for API tests
 */
const { test, expect } = require('@playwright/test');
const { ApiUtils } = require('../../../utils/api/apiUtils');
const config = require('../../../config');

// Read base URL from environment or config
const baseUrl = process.env.API_BASE_URL || config.api?.baseUrl;

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
  let apiUtils;
  
  test.beforeEach(({ request }) => {
    apiUtils = new ApiUtils(request, baseUrl);
  });
  
  // Data-driven test for user creation
  for (const userData of testData.users) {
    test(`Create user: ${userData.name} - ${userData.job}`, async ({ request }) => {
      // Send POST request to create a user
      const response = await apiUtils.post('/users', {
        name: userData.name,
        job: userData.job
      });
      
      // Verify response status
      expect(response.status()).toBe(userData.expectedStatus);
      
      // Verify response contains user data
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('name', userData.name);
      expect(responseBody).toHaveProperty('job', userData.job);
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('createdAt');
    });
  }
  
  // Data-driven test for user retrieval
  for (const userId of testData.userIds) {
    test(`Get user with ID: ${userId}`, async ({ request }) => {
      // Send GET request to get a specific user
      const response = await apiUtils.get(`/users/${userId}`);
      
      // Determine expected status based on user ID
      // Read from config or environment variables
      const maxValidId = parseInt(process.env.MAX_VALID_USER_ID || config.api?.testData?.maxValidUserId || '12');
      const expectedStatus = userId <= maxValidId ? 200 : 404;
      
      // Verify response status
      expect(response.status()).toBe(expectedStatus);
      
      // If user exists, verify response structure
      if (expectedStatus === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
        expect(responseBody.data).toHaveProperty('id', userId);
        expect(responseBody.data).toHaveProperty('email');
        expect(responseBody.data).toHaveProperty('first_name');
        expect(responseBody.data).toHaveProperty('last_name');
      }
    });
  }
  
  // Data-driven test for pagination
  for (const page of testData.pages) {
    test(`Get users from page ${page}`, async ({ request }) => {
      // Send GET request to list users with pagination
      const response = await apiUtils.get(`/users`, {
        params: { page }
      });
      
      // Verify response status
      expect(response.status()).toBe(200);
      
      // Verify response structure and data
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('page', page);
      expect(responseBody).toHaveProperty('data');
      expect(Array.isArray(responseBody.data)).toBeTruthy();
      
      // Determine expected user count based on page
      // Read from config or environment variables
      const maxPageWithData = parseInt(process.env.MAX_PAGE_WITH_DATA || config.api?.testData?.maxPageWithData || '2');
      const usersPerPage = parseInt(process.env.USERS_PER_PAGE || config.api?.testData?.usersPerPage || '6');
      const expectedUserCount = page <= maxPageWithData ? usersPerPage : 0;
      expect(responseBody.data.length).toBe(expectedUserCount);
    });
  }
  
  // Test with dynamically generated data
  for (const testCase of testData.queryParams) {
    test(`API with ${testCase.param}=${testCase.value}`, async ({ request }) => {
      // Create params object dynamically
      const params = { [testCase.param]: testCase.value };
      
      // Send GET request with params
      const response = await apiUtils.get('/users', { params });
      
      // Verify response status
      expect(response.status()).toBe(testCase.expectedStatus);
      
      // Verify response structure
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('data');
      expect(Array.isArray(responseBody.data)).toBeTruthy();
      
      // If per_page parameter was used, verify it affected the result
      if (testCase.param === 'per_page') {
        expect(responseBody.data.length).toBeLessThanOrEqual(testCase.value);
        expect(responseBody.per_page).toBe(testCase.value);
      }
    });
  }
});