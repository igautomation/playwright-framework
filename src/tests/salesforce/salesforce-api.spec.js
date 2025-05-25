/**
 * Salesforce API Tests
 */
const { test, expect } = require('@playwright/test');
const SalesforceUtils = require('../../utils/salesforce/salesforceUtils');

test.describe('Salesforce API Tests', () => {
  let sfUtils;
  
  test.beforeAll(async () => {
    // Initialize Salesforce utils
    sfUtils = new SalesforceUtils();
    
    // Login to Salesforce API
    await sfUtils.login();
  });
  
  test('should create and retrieve an account', async () => {
    // Generate unique account name
    const accountName = `Test Account ${Date.now()}`;
    
    // Create account via API
    const createResult = await sfUtils.createRecord('Account', {
      Name: accountName,
      Industry: 'Technology',
      Type: 'Customer'
    });
    
    // Verify account was created
    expect(createResult.success).toBeTruthy();
    expect(createResult.id).toBeDefined();
    
    // Query the account to verify
    const queryResult = await sfUtils.query(
      `SELECT Id, Name, Industry, Type FROM Account WHERE Id = '${createResult.id}'`
    );
    
    // Verify query results
    expect(queryResult.records).toHaveLength(1);
    expect(queryResult.records[0].Name).toBe(accountName);
    expect(queryResult.records[0].Industry).toBe('Technology');
    expect(queryResult.records[0].Type).toBe('Customer');
    
    // Clean up - delete the account
    const deleteResult = await sfUtils.deleteRecord('Account', createResult.id);
    expect(deleteResult).toBeTruthy();
  });
  
  test('should create and update a contact', async () => {
    // Generate unique contact data
    const firstName = `Test`;
    const lastName = `Contact ${Date.now()}`;
    const email = `test.contact.${Date.now()}@example.com`;
    
    // Create contact via API
    const createResult = await sfUtils.createRecord('Contact', {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Phone: '555-123-4567'
    });
    
    // Verify contact was created
    expect(createResult.success).toBeTruthy();
    expect(createResult.id).toBeDefined();
    
    // Update the contact
    const updateResult = await sfUtils.updateRecord('Contact', createResult.id, {
      Title: 'QA Engineer',
      Department: 'Engineering'
    });
    
    // Verify update was successful
    expect(updateResult).toBeTruthy();
    
    // Query the contact to verify updates
    const queryResult = await sfUtils.query(
      `SELECT Id, FirstName, LastName, Email, Title, Department FROM Contact WHERE Id = '${createResult.id}'`
    );
    
    // Verify query results
    expect(queryResult.records).toHaveLength(1);
    expect(queryResult.records[0].FirstName).toBe(firstName);
    expect(queryResult.records[0].LastName).toBe(lastName);
    expect(queryResult.records[0].Email).toBe(email);
    expect(queryResult.records[0].Title).toBe('QA Engineer');
    expect(queryResult.records[0].Department).toBe('Engineering');
    
    // Clean up - delete the contact
    const deleteResult = await sfUtils.deleteRecord('Contact', createResult.id);
    expect(deleteResult).toBeTruthy();
  });
  
  test('should query opportunities', async () => {
    // Query recent opportunities
    const queryResult = await sfUtils.query(
      'SELECT Id, Name, StageName, Amount FROM Opportunity ORDER BY CreatedDate DESC LIMIT 5'
    );
    
    // Verify we got results
    expect(queryResult.records).toBeDefined();
    
    // If there are opportunities, verify their structure
    if (queryResult.records.length > 0) {
      const opportunity = queryResult.records[0];
      expect(opportunity.Id).toBeDefined();
      expect(opportunity.Name).toBeDefined();
      expect(opportunity.StageName).toBeDefined();
    }
  });
  
  test.afterAll(async () => {
    // Clean up resources
    await sfUtils.dispose();
  });
});