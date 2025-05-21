/**
 * ReqRes API Tests
 * 
 * This test suite demonstrates API testing using the ReqRes API
 */
const { test, expect } = require('@playwright/test');

test.describe('ReqRes API Tests', () => {
  const baseUrl = process.env.API_URL;
  
  test('should get users list', async ({ request }) => {
    // Send GET request
    const response = await request.get(`${baseUrl}/users?page=1`);
    
    // Verify response status
    expect(response.status()).toBe(200);
    
    // Parse response body
    const body = await response.json();
    
    // Verify response structure
    expect(body).toHaveProperty('page', 1);
    expect(body).toHaveProperty('per_page');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('total_pages');
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
  });
  
  test('should get single user', async ({ request }) => {
    // Send GET request
    const response = await request.get(`${baseUrl}/users/2`);
    
    // Verify response status
    expect(response.status()).toBe(200);
    
    // Parse response body
    const body = await response.json();
    
    // Verify response structure
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id', 2);
    expect(body.data).toHaveProperty('email');
    expect(body.data).toHaveProperty('first_name');
    expect(body.data).toHaveProperty('last_name');
    expect(body.data).toHaveProperty('avatar');
  });
  
  test('should create user', async ({ request }) => {
    // Prepare request data
    const userData = {
      name: 'John Doe',
      job: 'Software Tester'
    };
    
    // Send POST request
    const response = await request.post(`${baseUrl}/users`, {
      data: userData
    });
    
    // Verify response status
    expect(response.status()).toBe(201);
    
    // Parse response body
    const body = await response.json();
    
    // Verify response structure
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name', userData.name);
    expect(body).toHaveProperty('job', userData.job);
    expect(body).toHaveProperty('createdAt');
  });
  
  test('should update user', async ({ request }) => {
    // Prepare request data
    const userData = {
      name: 'John Updated',
      job: 'Senior Software Tester'
    };
    
    // Send PUT request
    const response = await request.put(`${baseUrl}/users/2`, {
      data: userData
    });
    
    // Verify response status
    expect(response.status()).toBe(200);
    
    // Parse response body
    const body = await response.json();
    
    // Verify response structure
    expect(body).toHaveProperty('name', userData.name);
    expect(body).toHaveProperty('job', userData.job);
    expect(body).toHaveProperty('updatedAt');
  });
  
  test('should delete user', async ({ request }) => {
    // Send DELETE request
    const response = await request.delete(`${baseUrl}/users/2`);
    
    // Verify response status
    expect(response.status()).toBe(204);
  });
});