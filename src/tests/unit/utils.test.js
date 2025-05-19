// @ts-check
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/api/apiUtils');
const TestDataFactory = require('../../utils/common/testDataFactory');
const logger = require('../../utils/common/logger');

/**
 * Unit Test Suite
 * 
 * Tests for utility functions
 */
test.describe('Utility Unit Tests', () => {
  test('ApiClient should construct with correct defaults', () => {
    const baseUrl = 'https://api.example.com';
    const apiClient = new ApiClient(baseUrl);
    
    expect(apiClient.baseUrl).toBe(baseUrl);
    expect(apiClient.defaultHeaders['Content-Type']).toBe('application/json');
  });
  
  test('ApiClient should set auth token correctly', () => {
    const apiClient = new ApiClient('https://api.example.com');
    const token = 'test-token';
    
    apiClient.setAuthToken(token);
    
    expect(apiClient.defaultHeaders['Authorization']).toBe(`Bearer ${token}`);
  });
  
  test('TestDataFactory should create user with correct properties', () => {
    const user = TestDataFactory.createUser();
    
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('password');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('lastName');
  });
  
  test('TestDataFactory should override user properties', () => {
    const overrides = {
      username: 'testuser',
      email: 'test@example.com'
    };
    
    const user = TestDataFactory.createUser(overrides);
    
    expect(user.username).toBe(overrides.username);
    expect(user.email).toBe(overrides.email);
  });
  
  test('TestDataFactory should create multiple users', () => {
    const count = 5;
    const users = TestDataFactory.createUsers(count);
    
    expect(users).toHaveLength(count);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('username');
  });
  
  test('TestDataFactory should create product with correct properties', () => {
    const product = TestDataFactory.createProduct();
    
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('category');
  });
  
  test('Logger should format messages correctly', () => {
    // Mock console.log to capture output
    const originalConsoleLog = console.log;
    let capturedOutput = '';
    
    console.log = (message) => {
      capturedOutput = message;
    };
    
    // Log a message
    logger.info('Test message');
    
    // Restore console.log
    console.log = originalConsoleLog;
    
    // Verify format
    expect(capturedOutput).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[INFO\] Test message$/);
  });
});