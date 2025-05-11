/**
 * Combined API and UI Tests
 * 
 * This test suite demonstrates how to combine API and UI testing using industry best practices
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * API Repository for Reqres.in
 */
class ReqresApiRepository {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = 'https://reqres.in/api';
  }

  /**
   * Get list of users
   * @param {number} page - Page number
   * @returns {Promise<Object>} - Response data
   */
  async getUsers(page = 1) {
    const response = await this.request.get(`${this.baseUrl}/users?page=${page}`);
    if (!response.ok()) {
      throw new Error(`Failed to get users: ${response.statusText()}`);
    }
    return await response.json();
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Response data
   */
  async createUser(userData) {
    const response = await this.request.post(`${this.baseUrl}/users`, {
      data: userData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok()) {
      throw new Error(`Failed to create user: ${response.statusText()}`);
    }
    return await response.json();
  }
}

/**
 * Page Object for Reqres.in website
 */
class ReqresWebPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.supportSection = page.locator('text=Support ReqRes');
    this.mainContent = page.locator('main');
  }

  /**
   * Navigate to the website
   * @returns {Promise<void>}
   */
  async navigate() {
    await this.page.goto('https://reqres.in/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Display API results in the UI
   * @param {Object} data - API response data
   * @param {string} title - Section title
   * @returns {Promise<void>}
   */
  async displayApiResults(data, title) {
    await this.page.evaluate(({ data, title }) => {
      // Remove any existing results
      const existingResults = document.getElementById('api-results');
      if (existingResults) {
        existingResults.remove();
      }
      
      // Create a new results container
      const resultsDiv = document.createElement('div');
      resultsDiv.id = 'api-results';
      resultsDiv.style.padding = '20px';
      resultsDiv.style.margin = '20px';
      resultsDiv.style.border = '1px solid #2196f3';
      resultsDiv.style.borderRadius = '4px';
      resultsDiv.style.backgroundColor = '#e3f2fd';
      resultsDiv.style.fontFamily = 'Arial, sans-serif';
      
      // Create the HTML content based on the data type
      let content = `<h3 style="margin-top: 0;">${title}</h3>`;
      
      if (data.data && Array.isArray(data.data)) {
        // User list
        content += `
          <p><strong>Page:</strong> ${data.page} of ${data.total_pages}</p>
          <p><strong>Total Users:</strong> ${data.total}</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
            ${data.data.map(user => `
              <div style="border: 1px solid #ddd; border-radius: 4px; padding: 10px; background-color: white;">
                <img src="${user.avatar}" alt="${user.first_name}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">
                <p style="margin: 0; font-weight: bold;">${user.first_name} ${user.last_name}</p>
                <p style="margin: 0; font-size: 0.9em; color: #666;">${user.email}</p>
              </div>
            `).join('')}
          </div>
        `;
      } else if (data.name && data.job) {
        // Created user
        content += `
          <div style="background-color: white; padding: 15px; border-radius: 4px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Job:</strong> ${data.job}</p>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Created At:</strong> ${data.createdAt}</p>
          </div>
          <p style="margin-top: 15px; color: #4caf50;">✅ User created successfully!</p>
        `;
      } else {
        // Generic data
        content += `<pre style="background-color: white; padding: 15px; border-radius: 4px; overflow: auto;">${JSON.stringify(data, null, 2)}</pre>`;
      }
      
      resultsDiv.innerHTML = content;
      document.body.appendChild(resultsDiv);
    }, { data, title });
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<void>}
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: true
    });
  }
}

// Test data
const testData = {
  newUser: {
    name: 'John Doe',
    job: 'QA Engineer'
  }
};

test.describe('Combined API and UI Tests', () => {
  let apiRepo;
  let webPage;

  test.beforeEach(async ({ page, request }) => {
    apiRepo = new ReqresApiRepository(request);
    webPage = new ReqresWebPage(page);
  });

  test('should get users via API and display in UI', async () => {
    // Given: API repository and web page are initialized
    
    // When: Getting users from API
    const apiResponse = await apiRepo.getUsers();
    
    // Then: API response should have expected structure
    expect(apiResponse.page).toBe(1);
    expect(apiResponse.data).toBeInstanceOf(Array);
    expect(apiResponse.data.length).toBeGreaterThan(0);
    
    // When: Navigating to the website
    await webPage.navigate();
    
    // And: Displaying API results in the UI
    await webPage.displayApiResults(apiResponse, 'User List from API');
    
    // Then: Results should be visible in the UI
    await expect(webPage.page.locator('#api-results')).toBeVisible();
    
    // And: Take a screenshot
    await webPage.takeScreenshot('api-ui-users');
  });

  test('should create a user via API and display in UI', async () => {
    // Given: API repository and web page are initialized
    
    // When: Creating a user via API
    const apiResponse = await apiRepo.createUser(testData.newUser);
    
    // Then: API response should have expected structure
    expect(apiResponse.name).toBe(testData.newUser.name);
    expect(apiResponse.job).toBe(testData.newUser.job);
    expect(apiResponse.id).toBeTruthy();
    
    // When: Navigating to the website
    await webPage.navigate();
    
    // And: Displaying API results in the UI
    await webPage.displayApiResults(apiResponse, 'Created User from API');
    
    // Then: Results should be visible in the UI
    await expect(webPage.page.locator('#api-results')).toBeVisible();
    
    // And: Take a screenshot
    await webPage.takeScreenshot('api-ui-create-user');
  });

  test('should perform end-to-end API and UI workflow', async () => {
    // Given: API repository and web page are initialized
    
    // Step 1: Get users from API
    const usersResponse = await apiRepo.getUsers();
    expect(usersResponse.data.length).toBeGreaterThan(0);
    
    // Step 2: Navigate to the website
    await webPage.navigate();
    
    // Step 3: Display users in the UI
    await webPage.displayApiResults(usersResponse, 'User List from API');
    await webPage.takeScreenshot('api-ui-workflow-1');
    
    // Step 4: Create a new user via API
    const createResponse = await apiRepo.createUser(testData.newUser);
    expect(createResponse.name).toBe(testData.newUser.name);
    
    // Step 5: Display the created user in the UI
    await webPage.displayApiResults(createResponse, 'Created User from API');
    await webPage.takeScreenshot('api-ui-workflow-2');
    
    // Step 6: Get updated user list (would include the new user in a real API)
    const updatedUsersResponse = await apiRepo.getUsers();
    
    // Step 7: Display updated user list in the UI
    await webPage.displayApiResults(updatedUsersResponse, 'Updated User List from API');
    await webPage.takeScreenshot('api-ui-workflow-3');
    
    // Verify the workflow completed successfully
    await expect(webPage.page.locator('#api-results')).toBeVisible();
  });
});