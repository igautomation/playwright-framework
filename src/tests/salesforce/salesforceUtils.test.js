/**
 * Tests for SalesforceUtils utility
 */
const { test, expect } = require('@playwright/test');
const SalesforceUtils = require('../../utils/salesforce/salesforceUtils');
const http = require('http');

// Create a mock Salesforce API server for testing
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
      if (req.url === '/services/oauth2/token' && req.method === 'POST') {
        // Mock OAuth token response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: 'mock-access-token',
          instance_url: serverUrl,
          id: 'mock-org-id',
          token_type: 'Bearer'
        }));
      } else if (req.url.startsWith('/services/data/v') && req.url.includes('/sobjects/Account') && req.method === 'POST') {
        // Mock create account response
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id: '001xx000003DGb0AAG',
          success: true,
          errors: []
        }));
      } else if (req.url.startsWith('/services/data/v') && req.url.includes('/query/') && req.method === 'GET') {
        // Mock SOQL query response
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
      } else if (req.url.includes('/sobjects/Account/001xx000003DGb0AAG') && req.method === 'PATCH') {
        // Mock update response
        res.writeHead(204);
        res.end();
      } else if (req.url.includes('/sobjects/Account/001xx000003DGb0AAG') && req.method === 'DELETE') {
        // Mock delete response
        res.writeHead(204);
        res.end();
      } else {
        // Default 404 response
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

test.describe('SalesforceUtils', () => {
  test('should login to Salesforce API', async () => {
    // Create SalesforceUtils instance with mock server URL
    const sfUtils = new SalesforceUtils({
      username: 'test@example.com',
      password: 'password123',
      securityToken: 'token',
      loginUrl: serverUrl,
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    });
    
    // Login
    const result = await sfUtils.login();
    
    // Verify result
    expect(result.success).toBeTruthy();
    expect(result.instanceUrl).toBe(serverUrl);
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('POST');
    expect(requestLog[0].url).toBe('/services/oauth2/token');
    expect(requestLog[0].body).toContain('grant_type=password');
    expect(requestLog[0].body).toContain('username=test%40example.com');
    
    // Verify token was set
    expect(sfUtils.accessToken).toBe('mock-access-token');
    
    // Clean up
    await sfUtils.dispose();
  });
  
  test('should create a record', async () => {
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
    
    // Create account
    const accountData = {
      Name: 'Test Account',
      Industry: 'Technology'
    };
    
    const result = await sfUtils.createRecord('Account', accountData);
    
    // Verify result
    expect(result.success).toBeTruthy();
    expect(result.id).toBe('001xx000003DGb0AAG');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('POST');
    expect(requestLog[0].url).toContain('/sobjects/Account');
    expect(JSON.parse(requestLog[0].body)).toEqual(accountData);
    
    // Clean up
    await sfUtils.dispose();
  });
  
  test('should query records', async () => {
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
    
    // Query accounts
    const soql = "SELECT Id, Name FROM Account WHERE Name = 'Test Account'";
    const result = await sfUtils.query(soql);
    
    // Verify result
    expect(result.records).toHaveLength(1);
    expect(result.records[0].Name).toBe('Test Account');
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('GET');
    expect(requestLog[0].url).toContain('/query/');
    
    // Clean up
    await sfUtils.dispose();
  });
  
  test('should update a record', async () => {
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
    
    // Update account
    const accountData = {
      Industry: 'Healthcare'
    };
    
    const result = await sfUtils.updateRecord('Account', '001xx000003DGb0AAG', accountData);
    
    // Verify result
    expect(result).toBeTruthy();
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('PATCH');
    expect(requestLog[0].url).toContain('/sobjects/Account/001xx000003DGb0AAG');
    expect(JSON.parse(requestLog[0].body)).toEqual(accountData);
    
    // Clean up
    await sfUtils.dispose();
  });
  
  test('should delete a record', async () => {
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
    
    // Delete account
    const result = await sfUtils.deleteRecord('Account', '001xx000003DGb0AAG');
    
    // Verify result
    expect(result).toBeTruthy();
    
    // Verify request
    expect(requestLog).toHaveLength(1);
    expect(requestLog[0].method).toBe('DELETE');
    expect(requestLog[0].url).toContain('/sobjects/Account/001xx000003DGb0AAG');
    
    // Clean up
    await sfUtils.dispose();
  });
});