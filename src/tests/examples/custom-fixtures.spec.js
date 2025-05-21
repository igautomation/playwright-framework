// @ts-check
const { test: base, expect } = require('@playwright/test');

/**
 * Example Test: Custom Fixtures
 * Demonstrates how to create and use custom test fixtures
 */

// Define custom fixtures
const test = base.extend({
  // Authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto(process.env.TODO_APP_URL);
    
    // Add a todo to simulate authentication
    await page.getByPlaceholder('What needs to be done?').fill('Login fixture task');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // Use the authenticated page in the test
    await use(page);
  },
  
  // Custom API client fixture
  apiClient: async ({}, use) => {
    // Create a simple API client
    const client = {
      baseUrl: process.env.API_URL,
      
      async get(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        return response.json();
      },
      
      async post(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return response.json();
      }
    };
    
    // Use the API client in the test
    await use(client);
  },
  
  // Custom test data fixture
  testData: async ({}, use) => {
    // Create test data
    const data = {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ],
      products: [
        { id: 101, name: 'Product 1', price: 19.99 },
        { id: 102, name: 'Product 2', price: 29.99 }
      ]
    };
    
    // Use the test data in the test
    await use(data);
  }
});

// Test using the authenticated page fixture
test.describe('Custom Fixtures', () => {

test('using authenticated page fixture', async ({ authenticatedPage }) => {
  // Verify we're authenticated (todo exists)
  await expect(authenticatedPage.getByTestId('todo-item')).toHaveText('Login fixture task');
});

  // Add another todo
  await authenticatedPage.getByPlaceholder('What needs to be done?').fill('Another task');
  await authenticatedPage.getByPlaceholder('What needs to be done?').press('Enter');
  
  // Verify both todos exist
  await expect(authenticatedPage.getByTestId('todo-item')).toHaveCount(2);
});

// Test using the API client fixture
test('using API client fixture', async ({ apiClient }) => {
  // Use the API client to make a request
  const users = await apiClient.get('/users?page=1');
  
  // Verify the response
  expect(users).toHaveProperty('data');
  expect(Array.isArray(users.data)).toBeTruthy();
  expect(users.data.length).toBeGreaterThan(0);
});

// Test using the test data fixture
test('using test data fixture', async ({ page, testData }) => {
  // Navigate to the page
  await page.goto(process.env.TODO_APP_URL);
  
  // Use test data to create todos
  for (const user of testData.users) {
    await page.getByPlaceholder('What needs to be done?').fill(`Task for ${user.name}`);
    await page.getByPlaceholder('What needs to be done?').press('Enter');
  }
  
  // Verify todos were created
  await expect(page.getByTestId('todo-item')).toHaveCount(testData.users.length);
});
});
