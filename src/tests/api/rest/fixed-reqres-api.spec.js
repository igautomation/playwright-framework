/**
 * Reqres.in API Tests - Fixed Version
 * 
 * This test suite demonstrates API testing best practices using the Reqres.in API
 */
const { test, expect } = require('../../../fixtures/api-fixtures');

/**
 * Repository pattern for API interactions
 */
class ReqresApiRepository {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
    
    // Import the API header provider
    const { getApiBaseUrl, getApiHeaders } = require('../../../utils/api/apiHeaderProvider');
    
    // Get API configuration from data provider
    this.baseUrl = getApiBaseUrl();
    this.headers = getApiHeaders();
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
    // Reqres.in returns 201 for successful creation
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
    // Reqres.in returns 200 for successful update
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
    // Reqres.in returns 204 for successful deletion
    return response.status() === 204;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Response data
   */
  async registerUser(userData) {
    const response = await this.request.post(`${this.baseUrl}/register`, {
      data: userData,
      headers: this.headers
    });
    
    return {
      ok: response.ok(),
      status: response.status(),
      data: response.ok() ? await response.json() : await response.text()
    };
  }

  /**
   * Login a user
   * @param {Object} userData - User login data
   * @returns {Promise<Object>} - Response data
   */
  async loginUser(userData) {
    const response = await this.request.post(`${this.baseUrl}/login`, {
      data: userData,
      headers: this.headers
    });
    
    return {
      ok: response.ok(),
      status: response.status(),
      data: response.ok() ? await response.json() : await response.text()
    };
  }
}

// Import data provider
const { readYaml } = require('../../../utils/common/dataOrchestrator');

// Load test data from data provider
let testData;
try {
  const yamlData = readYaml('src/data/testData.yaml');
  testData = {
    newUser: yamlData.user,
    updatedUser: {
      name: yamlData.user.name + ' Updated',
      job: 'Senior ' + yamlData.user.job
    },
    registerUser: {
      email: yamlData.user.email,
      password: 'pistol'
    },
    loginUser: {
      email: yamlData.user.email,
      password: 'cityslicka'
    },
    invalidLogin: {
      email: 'invalid@example.com'
      // Missing password field to trigger error
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
    },
    registerUser: {
      email: 'eve.holt@reqres.in',
      password: 'pistol'
    },
    loginUser: {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka'
    },
    invalidLogin: {
      email: 'invalid@example.com'
      // Missing password field to trigger error
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
  });

  test('should create a user', async () => {
    // When: Creating a user via API
    const response = await apiRepo.createUser(testData.newUser);
    
    // Then: Response should have expected structure
    expect(response).toHaveProperty('name', testData.newUser.name);
    expect(response).toHaveProperty('job', testData.newUser.job);
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('createdAt');
  });

  test('should update a user', async () => {
    // When: Updating a user via API
    const response = await apiRepo.updateUser(2, testData.updatedUser);
    
    // Then: Response should have expected structure
    expect(response).toHaveProperty('name', testData.updatedUser.name);
    expect(response).toHaveProperty('job', testData.updatedUser.job);
    expect(response).toHaveProperty('updatedAt');
  });

  test('should delete a user', async () => {
    // When: Deleting a user via API
    const success = await apiRepo.deleteUser(2);
    
    // Then: Operation should be successful
    expect(success).toBeTruthy();
  });

  test('should register a user successfully', async () => {
    // When: Registering a user via API
    const response = await apiRepo.registerUser(testData.registerUser);
    
    // Then: Response should be successful
    expect(response.ok).toBeTruthy();
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty(process.env.API_TOKEN);
  });

  test('should login a user successfully', async () => {
    // When: Logging in a user via API
    const response = await apiRepo.loginUser(testData.loginUser);
    
    // Then: Response should be successful
    expect(response.ok).toBeTruthy();
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty(process.env.API_TOKEN);
  });

  test('should fail login with invalid credentials', async () => {
    // When: Logging in with invalid credentials
    const response = await apiRepo.loginUser(testData.invalidLogin);
    
    // Then: Response should indicate failure
    expect(response.ok).toBeFalsy();
    expect(response.status).toBe(400); // Reqres.in returns 400 for missing password
    expect(response.data).toContain('error');
  });
});