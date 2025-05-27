/**
 * Advanced tests for SalesforceUtils utility
 * Focuses on improving branch coverage
 */
const { test, expect } = require('@playwright/test');
const SalesforceUtils = require('../../utils/salesforce/salesforceUtils');
const http = require('http');

// Create a mock Salesforce API server for testing
let server;
let serverUrl;
let requestLog = [];

test.beforeAll(async () => {
  // Create test server with error responses
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
      
      // Handle different endpoints with error cases
      if (req.url === '/services/oauth2/token' && req.method === 'POST') {
        if (body.includes('error_token')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Authentication failure'
          }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            access_token: 'mock-access-token',
            instance_url: serverUrl,
            id: 'mock-org-id',
            token_type: 'Bearer'
          }));
        }
      } else if (req.url.includes('/sobjects/Account') && req.method === 'POST') {
        if (body.includes('error_trigger')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Bad request',
            message: 'Invalid field value'
          }));
        } else {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            id: '001xx000003DGb0AAG',
            success: true,
            errors: []
          }));
        }
      } else if (req.url.includes('/query/') && req.method === 'GET') {
        if (req.url.includes('error_query')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'MALFORMED_QUERY',
            message: 'Invalid SOQL query'
          }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            totalSize: 1,
            done: true,
            records: [
              {
                Id: '001xx000003DGb0AAG',
                Name: 'Test Account',
                attributes: {
                  type: 'Account',
                  url: '/services/data/v57.0/sobjects/Account/001xx000003DGb0AAG'
                }
              }
            ]
          }));
        }
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

test.describe('SalesforceUtils Error Handling', () => {
  test('should handle login errors', async () => {
    // Create SalesforceUtils instance with error trigger
    const sfUtils = new SalesforceUtils({
      username: 'error_token',
      password: 'password123',
      securityToken: 'token',
      loginUrl: serverUrl,
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    });
    
    // Attempt login and expect error
    try {
      await sfUtils.login();
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('Login failed');
    }
    
    // Clean up
    await sfUtils.dispose();
  });
  
  test('should handle create record errors', async () => {
    // Create SalesforceUtils instance
    const sfUtils = new SalesforceUtils({
      loginUrl: serverUrl
    });
    
    // Set access token directly to skip login
    sfUtils.accessToken = 'mock-access-token';
    sfUtils.instanceUrl = serverUrl;
    
    // Create request context
    sfUtils.requestContext = await require('@playwright/test').request.newContext({
      baseURL: serverUrl,
      extraHTTPHeaders: {
        'Authorization': `Bearer mock-access-token`,
        'Content-Type': 'application/json'
      }
    });
    
    // Attempt to create account with error trigger
    try {
      await sfUtils.createRecord('Account', {
        Name: 'error_trigger',
        Industry: 'Technology'
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('Failed to create Account');
    }
    
    // Clean up
    await sfUtils.dispose();
  });
  
  test('should handle query errors', async () => {
    // Create SalesforceUtils instance
    const sfUtils = new SalesforceUtils({
      loginUrl: serverUrl
    });
    
    // Set access token directly to skip login
    sfUtils.accessToken = 'mock-access-token';
    sfUtils.instanceUrl = serverUrl;
    
    // Create request context
    sfUtils.requestContext = await require('@playwright/test').request.newContext({
      baseURL: serverUrl,
      extraHTTPHeaders: {
        'Authorization': `Bearer mock-access-token`,
        'Content-Type': 'application/json'
      }
    });
    
    // Attempt query with error trigger
    try {
      await sfUtils.query("SELECT Id FROM Account WHERE Name = 'error_query'");
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('Query failed');
    }
    
    // Clean up
    await sfUtils.dispose();
  });
  
  test('should handle missing access token', async () => {
    // Create SalesforceUtils instance
    const sfUtils = new SalesforceUtils({
      loginUrl: serverUrl
    });
    
    // Mock login method to test auto-login
    const originalLogin = sfUtils.login;
    let loginCalled = false;
    sfUtils.login = async () => {
      loginCalled = true;
      sfUtils.accessToken = 'mock-access-token';
      sfUtils.instanceUrl = serverUrl;
      sfUtils.requestContext = await require('@playwright/test').request.newContext({
        baseURL: serverUrl,
        extraHTTPHeaders: {
          'Authorization': `Bearer mock-access-token`,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, instanceUrl: serverUrl };
    };
    
    // Call query without setting access token first
    await sfUtils.query("SELECT Id FROM Account");
    
    // Verify login was called automatically
    expect(loginCalled).toBeTruthy();
    
    // Restore original login method
    sfUtils.login = originalLogin;
    
    // Clean up
    await sfUtils.dispose();
  });
});