// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Example Test: Data-Driven Testing
 * Demonstrates how to implement data-driven tests
 */

// Load test data from JSON file
const testDataPath = path.join(__dirname, '../../data/json/test-fixtures.json');
const testData = fs.existsSync(testDataPath) 
  ? JSON.parse(fs.readFileSync(testDataPath, 'utf8'))
  : { 
      users: [
        { username: 'user1', password: 'pass1', fullName: 'Test User 1' },
        { username: 'user2', password: 'pass2', fullName: 'Test User 2' },
        { username: 'user3', password: 'pass3', fullName: 'Test User 3' }
      ] 
    };

// Data-driven test using test.describe.parallel for parallel execution
test.describe.parallel('Data-driven login tests', () => {
  for (const user of testData.users) {
    test(`login with user ${user.username}`, async ({ page }) => {
      // Navigate to demo page
      await page.goto(process.env.TODO_APP_URL);
});

      // In a real app, we would log in with the user credentials
      // For this demo, we'll simulate by adding a todo with the user's name
      await page.getByPlaceholder('What needs to be done?').fill(`Task for ${user.fullName}`);
      await page.getByPlaceholder('What needs to be done?').press('Enter');
      
      // Verify the todo was added
      await expect(page.getByTestId('todo-item')).toContainText(user.fullName);
    });
  }
});

// Data-driven test using test.each
const searchTerms = [
  { term: 'Playwright', expectedTitle: 'Playwright' },
  { term: 'Automation', expectedTitle: 'Automation' },
  { term: 'Testing', expectedTitle: 'Testing' }
];

test.describe('Data-driven search tests', () => {
  for (const { term, expectedTitle } of searchTerms) {
    test(`search for ${term}`, async ({ page }) => {
      // Navigate to search page
      await page.goto(process.env.PLAYWRIGHT_DOCS_URL);
      
      // Perform search
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByPlaceholder('Search docs').fill(term);
      
      // Wait for search results
      // Replaced timeout with proper waiting
await page.waitForLoadState("networkidle"); // Give search time to update
      
      // Verify search results contain the expected term
      const searchResults = page.locator('.DocSearch-Hits');
      await expect(searchResults).toBeVisible();
      
      // Take a screenshot of search results
      await searchResults.screenshot({ path: `search-${term}.png` });
    });
  }
});