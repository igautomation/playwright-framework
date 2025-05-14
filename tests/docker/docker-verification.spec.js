import { test, expect } from '@playwright/test';

/**
 * @description Tests to verify Docker functionality
 */

test.describe('Docker Verification Tests', () => {
  test('should verify Docker environment variables are accessible', async () => {
    // Check if we're running in Docker by checking environment variables
    const apiUrl = process.env.API_URL;
    console.log(`API_URL environment variable: ${apiUrl}`);
    expect(apiUrl).toBeTruthy();
  });

  test('should verify Docker file system is working', async () => {
    // This test verifies that the file system in Docker is working
    const fs = require('fs');
    
    // Create a temporary file
    const tempFilePath = '/tmp/docker-test-file.txt';
    const testContent = 'Docker test content';
    
    // Write to file
    fs.writeFileSync(tempFilePath, testContent);
    
    // Read from file
    const readContent = fs.readFileSync(tempFilePath, 'utf8');
    
    // Verify content
    expect(readContent).toBe(testContent);
    
    // Clean up
    fs.unlinkSync(tempFilePath);
  });

  test('should verify Docker networking is working', async ({ request }) => {
    // This test verifies that networking in Docker is working
    // by making a simple API request
    const response = await request.get('https://reqres.in/api/users/2');
    
    expect(response.ok()).toBeTruthy();
    
    const responseBody = await response.json();
    expect(responseBody.data).toBeTruthy();
    expect(responseBody.data.id).toBe(2);
  });
});