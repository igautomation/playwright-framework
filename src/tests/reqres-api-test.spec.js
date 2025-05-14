/**
 * Reqres.in API Tests
 * 
 * This test demonstrates API testing capabilities using the Reqres.in API
 * https://reqres.in/
 */
const { test, expect } = require('@playwright/test');

// API utility class
class ApiUtils {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = 'https://reqres.in/api';
    
    // Headers for API requests
    this.headers = {
      'Content-Type': 'application/json'
      // Note: x-api-key is not actually required by reqres.in
    };
  }

  /**
   * Get data from an API endpoint
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data and status
   */
  async getData(endpoint) {
    // Add retry logic for handling rate limiting
    let retries = 3;
    let response;
    
    while (retries > 0) {
      response = await this.request.get(`${this.baseUrl}${endpoint}`, {
        headers: this.headers
      });
      const status = response.status();
      
      // If we get rate limited (429) or server error (5xx), wait and retry
      if (status === 429 || (status >= 500 && status < 600)) {
        console.log(`Received status ${status}, retrying... (${retries} attempts left)`);
        retries--;
        // Exponential backoff: wait longer with each retry
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 2000));
      } else {
        // Otherwise break out of the retry loop
        break;
      }
    }
    
    const data = await response.json().catch(() => ({}));
    return {
      data,
      status: response.status()
    };
  }

  /**
   * Post data to an API endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to post
   * @returns {Promise<Object>} - Response data and status
   */
  async postData(endpoint, data) {
    // Add retry logic for handling rate limiting
    let retries = 3;
    let response;
    
    while (retries > 0) {
      response = await this.request.post(`${this.baseUrl}${endpoint}`, {
        data: data,
        headers: this.headers
      });
      const status = response.status();
      
      // If we get rate limited (429) or server error (5xx), wait and retry
      if (status === 429 || (status >= 500 && status < 600)) {
        console.log(`Received status ${status}, retrying... (${retries} attempts left)`);
        retries--;
        // Exponential backoff: wait longer with each retry
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 2000));
      } else {
        // Otherwise break out of the retry loop
        break;
      }
    }
    
    const responseData = await response.json().catch(() => ({}));
    return {
      data: responseData,
      status: response.status()
    };
  }

  /**
   * Update data via PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} - Response data and status
   */
  async updateData(endpoint, data) {
    // Add retry logic for handling rate limiting
    let retries = 3;
    let response;
    
    while (retries > 0) {
      response = await this.request.put(`${this.baseUrl}${endpoint}`, {
        data: data,
        headers: this.headers
      });
      const status = response.status();
      
      // If we get rate limited (429) or server error (5xx), wait and retry
      if (status === 429 || (status >= 500 && status < 600)) {
        console.log(`Received status ${status}, retrying... (${retries} attempts left)`);
        retries--;
        // Exponential backoff: wait longer with each retry
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 2000));
      } else {
        // Otherwise break out of the retry loop
        break;
      }
    }
    
    const responseData = await response.json().catch(() => ({}));
    return {
      data: responseData,
      status: response.status()
    };
  }

  /**
   * Update data via PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} - Response data and status
   */
  async patchData(endpoint, data) {
    // Add retry logic for handling rate limiting
    let retries = 3;
    let response;
    
    while (retries > 0) {
      response = await this.request.patch(`${this.baseUrl}${endpoint}`, {
        data: data,
        headers: this.headers
      });
      const status = response.status();
      
      // If we get rate limited (429) or server error (5xx), wait and retry
      if (status === 429 || (status >= 500 && status < 600)) {
        console.log(`Received status ${status}, retrying... (${retries} attempts left)`);
        retries--;
        // Exponential backoff: wait longer with each retry
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 2000));
      } else {
        // Otherwise break out of the retry loop
        break;
      }
    }
    
    const responseData = await response.json().catch(() => ({}));
    return {
      data: responseData,
      status: response.status()
    };
  }

  /**
   * Delete data
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response status
   */
  async deleteData(endpoint) {
    // Add retry logic for handling rate limiting
    let retries = 3;
    let response;
    
    while (retries > 0) {
      response = await this.request.delete(`${this.baseUrl}${endpoint}`, {
        headers: this.headers
      });
      const status = response.status();
      
      // If we get rate limited (429) or server error (5xx), wait and retry
      if (status === 429 || (status >= 500 && status < 600)) {
        console.log(`Received status ${status}, retrying... (${retries} attempts left)`);
        retries--;
        // Exponential backoff: wait longer with each retry
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 2000));
      } else {
        // Otherwise break out of the retry loop
        break;
      }
    }
    
    return {
      status: response.status()
    };
  }
}

test.describe('Reqres.in API Tests', () => {
  let apiUtils;

  // Set timeout between tests to avoid rate limiting
  test.beforeEach(async ({ request }) => {
    // Add delay to avoid rate limiting (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    apiUtils = new ApiUtils(request);
  });
  
  // Configure tests to run serially to avoid rate limiting
  test.describe.configure({ mode: 'serial' });

  test('should get list of users', async ({ request }) => {
    // Try direct request
    console.log('Attempting direct request...');
    const directResponse = await request.get('https://reqres.in/api/users?page=1', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Direct request status:', directResponse.status());
    
    // Get users from API using our utility
    const { data: apiResponse, status } = await apiUtils.getData('/users?page=1');
    console.log('API response status:', status);
    
    // Verify API response structure and status code
    expect(status).toBe(200);
    expect(apiResponse.page).toBe(1);
    expect(apiResponse.data.length).toBeGreaterThan(0);
    expect(apiResponse.per_page).toBeTruthy();
    expect(apiResponse.total).toBeTruthy();
    
    // Verify user data structure
    const firstUser = apiResponse.data[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('first_name');
    expect(firstUser).toHaveProperty('last_name');
    expect(firstUser).toHaveProperty('avatar');
    
    console.log('Users API Response:', apiResponse);
  });

  test('should get a single user', async ({ request }) => {
    // Get a single user from API
    const { data: apiResponse, status } = await apiUtils.getData('/users/2');
    
    // Verify API response structure and status code
    expect(status).toBe(200);
    expect(apiResponse.data.id).toBe(2);
    expect(apiResponse.data.email).toBeTruthy();
    expect(apiResponse.data.first_name).toBeTruthy();
    expect(apiResponse.data.last_name).toBeTruthy();
    expect(apiResponse.data.avatar).toBeTruthy();
    
    console.log('Single User API Response:', apiResponse);
  });

  test('should return 404 for non-existent user', async () => {
    // Get a non-existent user from API
    const { status } = await apiUtils.getData('/users/999');
    console.log('API response status for non-existent user:', status);
    
    // Verify API response status code
    expect(status).toBe(404);
  });

  test('should create a user', async () => {
    // Create user data
    const userData = {
      name: 'John Doe',
      job: 'QA Engineer'
    };
    
    // Create user via API
    const { data: apiResponse, status } = await apiUtils.postData('/users', userData);
    
    // Verify API response and status code
    expect(status).toBe(201);
    expect(apiResponse.name).toBe(userData.name);
    expect(apiResponse.job).toBe(userData.job);
    expect(apiResponse.id).toBeTruthy();
    expect(apiResponse.createdAt).toBeTruthy();
    
    console.log('Create User API Response:', apiResponse);
  });

  test('should update a user with PUT', async () => {
    // Update user data
    const userData = {
      name: 'John Updated',
      job: 'Senior QA Engineer'
    };
    
    // Update user via API
    const { data: apiResponse, status } = await apiUtils.updateData('/users/2', userData);
    
    // Verify API response and status code
    expect(status).toBe(200);
    expect(apiResponse.name).toBe(userData.name);
    expect(apiResponse.job).toBe(userData.job);
    expect(apiResponse.updatedAt).toBeTruthy();
    
    console.log('Update User API Response:', apiResponse);
  });

  test('should update a user with PATCH', async () => {
    // Update user data
    const userData = {
      name: 'John Patched',
      job: 'Lead QA Engineer'
    };
    
    // Update user via API
    const { data: apiResponse, status } = await apiUtils.patchData('/users/2', userData);
    
    // Verify API response and status code
    expect(status).toBe(200);
    expect(apiResponse.name).toBe(userData.name);
    expect(apiResponse.job).toBe(userData.job);
    expect(apiResponse.updatedAt).toBeTruthy();
    
    console.log('Patch User API Response:', apiResponse);
  });

  test('should delete a user', async () => {
    // Delete user via API
    const { status } = await apiUtils.deleteData('/users/2');
    
    // Verify API response status code
    expect(status).toBe(204);
    
    console.log('Delete User API Response - Status:', status);
  });

  test('should register a user successfully', async () => {
    // Register user data
    const userData = {
      email: 'eve.holt@reqres.in',
      password: 'pistol'
    };
    
    // Register user via API
    const { data: apiResponse, status } = await apiUtils.postData('/register', userData);
    
    // Verify API response and status code
    expect(status).toBe(200);
    expect(apiResponse.id).toBeTruthy();
    expect(apiResponse.token).toBeTruthy();
    
    console.log('Register User API Response:', apiResponse);
  });

  test('should fail to register with missing password', async () => {
    // Register user data with missing password
    const userData = {
      email: 'sydney@fife'
    };
    
    // Register user via API
    const { data: apiResponse, status } = await apiUtils.postData('/register', userData);
    
    // Verify API response and status code
    expect(status).toBe(400);
    expect(apiResponse.error).toBeTruthy();
    
    console.log('Failed Register API Response:', apiResponse);
  });

  test('should login successfully', async () => {
    // Login data
    const loginData = {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka'
    };
    
    // Login via API
    const { data: apiResponse, status } = await apiUtils.postData('/login', loginData);
    
    // Verify API response and status code
    expect(status).toBe(200);
    expect(apiResponse.token).toBeTruthy();
    
    console.log('Login API Response:', apiResponse);
  });

  test('should fail to login with missing password', async () => {
    // Login data with missing password
    const loginData = {
      email: 'peter@klaven'
    };
    
    // Login via API
    const { data: apiResponse, status } = await apiUtils.postData('/login', loginData);
    
    // Verify API response and status code
    expect(status).toBe(400);
    expect(apiResponse.error).toBeTruthy();
    
    console.log('Failed Login API Response:', apiResponse);
  });
});