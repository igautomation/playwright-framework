/**
 * Reqres.in API Tests
 * 
 * This test suite demonstrates API testing best practices using the Reqres.in API
 */
const { test, expect } = require('../../fixtures/api-fixtures');

/**
 * Repository pattern for API interactions
 */
class ReqresApiRepository {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = process.env.API_URL;
    
    // Define headers directly to ensure they're always included
    this.headers = {
      'Content-Type': 'application/json'
      // Note: x-api-key is not actually required by reqres.in
    };
  }

  /**
   * Get list of users
   * @param {number} page - Page number
   * @returns {Promise<Object>} - Response data
   */
  async getUsers(page = 1) {
    const response = await this.request.get(`${this.baseUrl}/users?page=${page}`, {
      headers: this.headers
    });
    if (!response.ok()) {
      throw new Error(`Failed to get users: ${response.statusText()}`);
    }
    return await response.json();
  }

  /**
   * Get a single user
   * @param {number} id - User ID
   * @returns {Promise<Object>} - Response data
   */
  async getUser(id) {
    const response = await this.request.get(`${this.baseUrl}/users/${id}`, {
      headers: this.headers
    });
    if (!response.ok()) {
      throw new Error(`Failed to get user ${id}: ${response.statusText()}`);
    }
    return await response.json();
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Response data
   */
  async createUser(userData) {
    const response = await this.request.post(`${this.baseUrl}/users`, {
      data: userData,
      headers: this.headers
    });
    if (!response.ok()) {
      throw new Error(`Failed to create user: ${response.statusText()}`);
    }
    return await response.json();
  }

  /**
   * Update a user
   * @param {number} id - User ID
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Response data
   */
  async updateUser(id, userData) {
    const response = await this.request.put(`${this.baseUrl}/users/${id}`, {
      data: userData,
      headers: this.headers
    });
    if (!response.ok()) {
      throw new Error(`Failed to update user ${id}: ${response.statusText()}`);
    }
    return await response.json();
  }

  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteUser(id) {
    const response = await this.request.delete(`${this.baseUrl}/users/${id}`, {
      headers: this.headers
    });
    return response.ok();
  }
}

// Import data provider
const { readYaml } = require('../../utils/common/dataOrchestrator');

// Load test data from data provider
let testData;
try {
  const yamlData = readYaml('src/data/testData.yaml');
  testData = {
    newUser: yamlData.user,
    updatedUser: {
      name: yamlData.user.name + ' Updated',
      job: 'Senior ' + yamlData.user.job
    }
  };
} catch (error) {
  console.warn('Failed to load test data from YAML:', error.message);
  // Fallback to default test data if data provider fails
  testData = {
    newUser: {
      name: 'John Doe',
      job: 'QA Engineer'
    },
    updatedUser: {
      name: 'John Updated',
      job: 'Senior QA Engineer'
    }
  };
}

test.describe('Reqres.in API Tests', () => {
  let apiRepo;

  test.beforeEach(async ({ request }) => {
    apiRepo = new ReqresApiRepository(request);
  });

  test('should get list of users', async () => {
    // When: Getting users from API
    const response = await apiRepo.getUsers();
});

    // Then: Response should have expected structure
    expect(response.page).toBe(1);
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty('email');
    expect(response.data[0]).toHaveProperty('first_name');
    expect(response.data[0]).toHaveProperty('last_name');
    
    console.log('Users API Response:', response);
  });

  test('should get a single user', async () => {
    // When: Getting a single user from API
    const response = await apiRepo.getUser(2);
    
    // Then: Response should have expected structure
    expect(response.data).toHaveProperty('id', 2);
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('first_name');
    expect(response.data).toHaveProperty('last_name');
    expect(response.data).toHaveProperty('avatar');
    
    console.log('Single User API Response:', response);
  });

  test('should create a user', async () => {
    // When: Creating a user via API
    const response = await apiRepo.createUser(testData.newUser);
    
    // Then: Response should have expected structure
    expect(response).toHaveProperty('name', testData.newUser.name);
    expect(response).toHaveProperty('job', testData.newUser.job);
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('createdAt');
    
    console.log('Create User API Response:', response);
  });

  test('should update a user', async () => {
    // When: Updating a user via API
    const response = await apiRepo.updateUser(2, testData.updatedUser);
    
    // Then: Response should have expected structure
    expect(response).toHaveProperty('name', testData.updatedUser.name);
    expect(response).toHaveProperty('job', testData.updatedUser.job);
    expect(response).toHaveProperty('updatedAt');
    
    console.log('Update User API Response:', response);
  });

  test('should delete a user', async () => {
    // When: Deleting a user via API
    const success = await apiRepo.deleteUser(2);
    
    // Then: Operation should be successful
    expect(success).toBeTruthy();
    
    console.log('Delete User API Response - Success:', success);
  });
});