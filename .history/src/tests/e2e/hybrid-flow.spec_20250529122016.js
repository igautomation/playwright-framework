/**
 * Hybrid Flow Tests
 * 
 * End-to-end tests combining UI and API interactions
 */
require('dotenv').config();
const { test, expect } = require('@playwright/test');

test.describe('Hybrid Flow', () => {
  let authToken;
  const baseUrl = 'https://opensource-demo.orangehrmlive.com';
  
  test.beforeEach(async ({ page, request }) => {
    // UI Login to get auth token
    await page.goto(baseUrl);
    
    // Fill in login form
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    
    // Intercept network requests to capture auth token
    await page.route('**/api/v2/auth/login', async route => {
      // Continue the request
      await route.continue();
      // Get the response
      const response = await route.request().response();
      const responseBody = await response.json();
      // Store the token
      authToken = responseBody?.data?.access_token || '';
    });
    
    // Click login button
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard/index');
  });
  
  test('should create employee via API and verify in UI', async ({ page, request }) => {
    // Skip if no auth token
    test.skip(!authToken, 'Auth token not captured');
    
    // Create employee via API
    const employeeData = {
      firstName: 'John',
      middleName: 'William',
      lastName: 'Doe',
      employeeId: '1234'
    };
    
    const response = await request.post(`${baseUrl}/web/index.php/api/v2/pim/employees`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: employeeData
    });
    
    // Verify API response
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData.data).toBeDefined();
    const employeeId = responseData.data.empNumber;
    
    // Navigate to PIM page to verify employee in UI
    await page.getByRole('link', { name: 'PIM' }).click();
    
    // Search for the employee
    await page.getByPlaceholder('Type for hints...').fill(`${employeeData.firstName} ${employeeData.lastName}`);
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Wait for search results
    await page.waitForSelector('.oxd-table-card');
    
    // Verify employee is found in the table
    const employeeRow = page.locator('.oxd-table-card').first();
    await expect(employeeRow).toContainText(employeeData.firstName);
    await expect(employeeRow).toContainText(employeeData.lastName);
    await expect(employeeRow).toContainText(employeeData.employeeId);
  });
  
  test('should update employee data via API and verify in UI', async ({ page, request }) => {
    // Skip if no auth token
    //test.skip(!authToken, 'Auth token not captured');
    
    // First, get an existing employee via API
    const employeesResponse = await request.get(`${baseUrl}/web/index.php/api/v2/pim/employees`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(employeesResponse.status()).toBe(200);
    const employees = await employeesResponse.json();
    
    // Skip if no employees found
    test.skip(!employees.data || employees.data.length === 0, 'No employees found');
    
    // Get the first employee
    const employee = employees.data[0];
    const employeeId = employee.empNumber;
    
    // Update employee via API
    const updatedData = {
      firstName: 'Updated',
      lastName: 'Employee',
      middleName: 'Test'
    };
    
    const updateResponse = await request.put(`${baseUrl}/web/index.php/api/v2/pim/employees/${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: updatedData
    });
    
    // Verify API response
    expect(updateResponse.status()).toBe(200);
    
    // Navigate to PIM page to verify updated employee in UI
    await page.getByRole('link', { name: 'PIM' }).click();
    
    // Search for the employee
    await page.getByPlaceholder('Type for hints...').fill(`${updatedData.firstName} ${updatedData.lastName}`);
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Wait for search results
    await page.waitForSelector('.oxd-table-card');
    
    // Verify employee is found with updated data
    const employeeRow = page.locator('.oxd-table-card').first();
    await expect(employeeRow).toContainText(updatedData.firstName);
    await expect(employeeRow).toContainText(updatedData.lastName);
  });
});