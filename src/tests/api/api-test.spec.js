// @ts-check
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api/apiUtils');

/**
 * API Test Suite
 * 
 * Tests for API endpoints using the API client
 */
test.describe('API Tests', () => {
  let apiClient;
  
  test.beforeEach(() => {
    apiClient = new ApiClient('https://reqres.in/api');
  });
  
  test('GET users endpoint returns correct data', async () => {
    const response = await apiClient.get('/users?page=1');
    
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBeGreaterThan(0);
    
    // Verify user structure
    const firstUser = response.data[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('first_name');
    expect(firstUser).toHaveProperty('last_name');
  });
  
  test('GET single user returns correct data', async () => {
    const userId = 2;
    const response = await apiClient.get(`/users/${userId}`);
    
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('id', userId);
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('first_name');
    expect(response.data).toHaveProperty('last_name');
  });
  
  test('POST create user works correctly', async () => {
    const userData = {
      name: 'John Doe',
      job: 'Software Tester'
    };
    
    const response = await apiClient.post('/users', userData);
    
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('name', userData.name);
    expect(response).toHaveProperty('job', userData.job);
    expect(response).toHaveProperty('createdAt');
  });
  
  test('PUT update user works correctly', async () => {
    const userId = 2;
    const userData = {
      name: 'John Updated',
      job: 'Senior Tester'
    };
    
    const response = await apiClient.put(`/users/${userId}`, userData);
    
    expect(response).toHaveProperty('name', userData.name);
    expect(response).toHaveProperty('job', userData.job);
    expect(response).toHaveProperty('updatedAt');
  });
  
  test('DELETE user works correctly', async () => {
    const userId = 2;
    
    // Using fetch directly for DELETE to verify status code
    const response = await fetch(`https://reqres.in/api/users/${userId}`, {
      method: 'DELETE'
    });
    
    expect(response.status).toBe(204);
  });
});