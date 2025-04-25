/**
 * @fileoverview Tests for Salesforce API functionality
 */
import { test, expect } from '@playwright/test';
import { createSalesforceApiContext } from '../../../utils/auth.js';

test.describe('Salesforce API', () => {
  let apiContext;
  
  test.beforeAll(async () => {
    apiContext = await createSalesforceApiContext();
  });
  
  test('should retrieve account records @api', async () => {
    // Arrange & Act
    const response = await apiContext.get('/services/data/v58.0/sobjects/Account/describe');
    
    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('name', 'Account');
    expect(data).toHaveProperty('fields');
    expect(Array.isArray(data.fields)).toBe(true);
  });
  
  test('should create and retrieve a contact record @api', async () => {
    // Arrange - Generate unique email to avoid duplicates
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const contactData = {
      FirstName: 'API',
      LastName: 'Test',
      Email: uniqueEmail,
      Phone: '555-123-4567'
    };
    
    // Act - Create contact
    const createResponse = await apiContext.post('/services/data/v58.0/sobjects/Contact', {
      data: contactData
    });
    
    // Assert - Verify creation
    expect(createResponse.status()).toBe(201);
    const createResult = await createResponse.json();
    expect(createResult).toHaveProperty('id');
    expect(createResult).toHaveProperty('success', true);
    
    // Get the ID of the created contact
    const contactId = createResult.id;
    
    // Act - Retrieve the created contact
    const retrieveResponse = await apiContext.get(`/services/data/v58.0/sobjects/Contact/${contactId}`);
    
    // Assert - Verify retrieval
    expect(retrieveResponse.status()).toBe(200);
    const retrieveResult = await retrieveResponse.json();
    expect(retrieveResult).toHaveProperty('Id', contactId);
    expect(retrieveResult).toHaveProperty('Email', uniqueEmail);
    
    // Cleanup - Delete the test contact
    const deleteResponse = await apiContext.delete(`/services/data/v58.0/sobjects/Contact/${contactId}`);
    expect(deleteResponse.status()).toBe(204);
  });
  
  test('should execute a SOQL query @api', async () => {
    // Arrange
    const query = 'SELECT Id, Name FROM Account LIMIT 5';
    const encodedQuery = encodeURIComponent(query);
    
    // Act
    const response = await apiContext.get(`/services/data/v58.0/query?q=${encodedQuery}`);
    
    // Assert
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result).toHaveProperty('records');
    expect(Array.isArray(result.records)).toBe(true);
  });
});