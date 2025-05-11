/**
 * API and UI combined test for Playwright Framework
 * 
 * This test demonstrates how to combine API testing with minimal UI verification
 * using a public API endpoint
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Simple API utility class
class ApiUtils {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
  }

  /**
   * Get data from an API endpoint
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data
   */
  async getData(endpoint) {
    const response = await this.request.get(endpoint);
    return await response.json();
  }

  /**
   * Post data to an API endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to post
   * @returns {Promise<Object>} - Response data
   */
  async postData(endpoint, data) {
    const response = await this.request.post(endpoint, {
      data: data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  }
}

test.describe('API and UI Combined Test Suite', () => {
  let apiUtils;

  test.beforeEach(async ({ request }) => {
    apiUtils = new ApiUtils(request);
  });

  test('should get users via API and display in UI', async ({ page }) => {
    // Get users from API
    const apiResponse = await apiUtils.getData('https://reqres.in/api/users?page=1');
    
    // Navigate to the website
    await page.goto('https://reqres.in/');
    
    // Create a simple UI element to display API results
    await page.evaluate((userData) => {
      const resultsDiv = document.createElement('div');
      resultsDiv.id = 'api-results';
      resultsDiv.style.padding = '20px';
      resultsDiv.style.margin = '20px';
      resultsDiv.style.border = '1px solid #ccc';
      resultsDiv.innerHTML = `<h3>API Results</h3><p>Total users: ${userData.total}</p>`;
      document.body.appendChild(resultsDiv);
    }, apiResponse);
    
    // Take a screenshot showing the API results
    await page.screenshot({ path: path.join(screenshotsDir, 'api-ui-users.png') });
    
    // Verify our custom element is visible
    await expect(page.locator('#api-results')).toBeVisible();
  });

  test('should create a user via API and display in UI', async ({ page }) => {
    // Create user data
    const userData = {
      name: 'John Doe',
      job: 'QA Engineer'
    };
    
    // Create user via API
    const apiResponse = await apiUtils.postData('https://reqres.in/api/users', userData);
    
    // Navigate to the website
    await page.goto('https://reqres.in/');
    
    // Create a simple UI element to display API results
    await page.evaluate((data) => {
      const resultsDiv = document.createElement('div');
      resultsDiv.id = 'api-results';
      resultsDiv.style.padding = '20px';
      resultsDiv.style.margin = '20px';
      resultsDiv.style.border = '1px solid #ccc';
      resultsDiv.innerHTML = `<h3>Created User</h3><p>Name: ${data.name}</p><p>Job: ${data.job}</p>`;
      document.body.appendChild(resultsDiv);
    }, apiResponse);
    
    // Take a screenshot showing the API results
    await page.screenshot({ path: path.join(screenshotsDir, 'api-ui-create-user.png') });
    
    // Verify our custom element is visible
    await expect(page.locator('#api-results')).toBeVisible();
  });
});