/**
 * Tests for ApiClient utility
 */
const { test, expect } = require('@playwright/test');
const ApiClient = require('../../utils/api/apiClient');
const http = require('http');

// Create a simple HTTP server for testing
let server;
let serverUrl;
let requestLog = [];

test.beforeAll(async () => {
  // Create test server
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      // Log request for assertions
      requestLog.push({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: body || null
      });
      
      // Handle different endpoints
      if (req.url === '/users' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ users: [{ id: 1, name: 'Test User' }] }));
      } else if (req.url.startsWith('/users?') && req.method === 'GET') {
        // Handle query parameters
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          users: [{ id: 1, name: 'Test User' }],
          params: req.url.split('?')[1]
        }));
      } else if (req.url === '/users' && req.method === 'POST') {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: 2, ...JSON.parse(body) }));
      } else if (req.url.startsWith('/users/') && req.method === 'PUT') {
        const id = req.url.split('/')[2];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: parseInt(id), ...JSON.parse(body) }));
      } else if (req.url.startsWith('/users/') && req.method === 'PATCH') {
        const id = req.url.split('/')[2];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: parseInt(id), ...JSON.parse(body) }));
      } else if (req.url.startsWith('/users/') && req.method === 'DELETE') {
        res.writeHead(204);
        res.end();
      } else if (req.url === '/text') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Plain text response');
      } else if (req.url === '/error') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      } else if (req.url === '/auth' && req.headers.authorization) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ authenticated: true, token: req.headers.authorization }));
      } else if (req.url.startsWith('/query?')) {
        // Special endpoint for query parameter test
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true,
          query: req.url.split('?')[1]
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });
  });
  
  // Start server on random port
  await new Promise(resolve => {
    server.listen(0, 'localhost', () => {
      const address = server.address();
      serverUrl = `http://localhost:${address.port}`;
      resolve();
    });
  });
});

test.afterAll(async () => {
  // Close server
  await new Promise(resolve => server.close(resolve));
});

test.beforeEach(() => {
  // Clear request log before each test
  requestLog = [];
});

test.describe('ApiClient', () => {
  test('should make GET request and parse JSON response', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Make GET request
    const response = await apiClient.get('/users');
    
    // Verify response
    expect(response).toHaveProperty('users');
    expect(response.users).toHaveLength(1);
    expect(response.users[0].name).toBe('Test User');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('GET');
    expect(requestLog[0].url).toBe('/users');
  });
  
  test('should make POST request with JSON body', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Make POST request
    const userData = { name: 'New User', email: 'user@example.com' };
    const response = await apiClient.post('/users', userData);
    
    // Verify response
    expect(response).toHaveProperty('id', 2);
    expect(response).toHaveProperty('name', 'New User');
    expect(response).toHaveProperty('email', 'user@example.com');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('POST');
    expect(requestLog[0].url).toBe('/users');
    expect(JSON.parse(requestLog[0].body)).toEqual(userData);
  });
  
  test('should make PUT request to update resource', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Make PUT request
    const userData = { name: 'Updated User', role: 'admin' };
    const response = await apiClient.put('/users/1', userData);
    
    // Verify response
    expect(response).toHaveProperty('id', 1);
    expect(response).toHaveProperty('name', 'Updated User');
    expect(response).toHaveProperty('role', 'admin');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('PUT');
    expect(requestLog[0].url).toBe('/users/1');
    expect(JSON.parse(requestLog[0].body)).toEqual(userData);
  });
  
  test('should make PATCH request for partial update', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Make PATCH request
    const userData = { role: 'editor' };
    const response = await apiClient.patch('/users/1', userData);
    
    // Verify response
    expect(response).toHaveProperty('id', 1);
    expect(response).toHaveProperty('role', 'editor');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('PATCH');
    expect(requestLog[0].url).toBe('/users/1');
    expect(JSON.parse(requestLog[0].body)).toEqual(userData);
  });
  
  test('should make DELETE request', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Make DELETE request and expect no content
    await apiClient.delete('/users/1');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('DELETE');
    expect(requestLog[0].url).toBe('/users/1');
  });
  
  test('should handle text responses', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Make GET request to text endpoint
    const response = await apiClient.get('/text');
    
    // Verify response is text
    expect(response).toBe('Plain text response');
  });
  
  test('should handle error responses', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Make GET request to error endpoint
    try {
      await apiClient.get('/error');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Verify error
      expect(error.status).toBe(500);
      expect(error.data).toHaveProperty('error', 'Internal Server Error');
    }
  });
  
  test('should set auth token for requests', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Set auth token
    apiClient.setAuthToken('test-token');
    
    // Make request to auth endpoint
    const response = await apiClient.get('/auth');
    
    // Verify response
    expect(response).toHaveProperty('authenticated', true);
    expect(response).toHaveProperty('token', 'Bearer test-token');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].headers.authorization).toBe('Bearer test-token');
  });
  
  test('should format URL correctly', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Test various URL formats
    expect(apiClient.formatUrl('/users')).toBe('/users');
    expect(apiClient.formatUrl('users')).toBe('/users');
    expect(apiClient.formatUrl('https://example.com/api')).toBe('https://example.com/api');
  });
  
  test('should handle query parameters', async () => {
    // Create API client
    const apiClient = new ApiClient(serverUrl);
    
    // Make GET request with query parameters
    const response = await apiClient.get('/query', {
      params: {
        page: 1,
        limit: 10,
        filter: 'active'
      }
    });
    
    // Verify response
    expect(response).toHaveProperty('success', true);
    expect(response).toHaveProperty('query');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].url).toContain('/query?');
    expect(requestLog[0].url).toContain('page=1');
    expect(requestLog[0].url).toContain('limit=10');
    expect(requestLog[0].url).toContain('filter=active');
  });
});