// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Create User API', () => {
  test('should create a user successfully', async () => {
    const userData = {
      name: 'John Doe',
      job: 'Software Engineer'
    };
    
    const response = await fetch(`${process.env.API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name', userData.name);
    expect(data).toHaveProperty('job', userData.job);
    expect(data).toHaveProperty('createdAt');
  });
});