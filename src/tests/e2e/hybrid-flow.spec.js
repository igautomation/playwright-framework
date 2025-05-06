/**
 * Hybrid flow tests combining API and UI testing
 */
const { test, expect } = require('../fixtures/baseFixtures');
const User = require('../../utils/api/models/User');
const TestDataFactory = require('../../utils/common/testDataFactory');

test.describe('Hybrid Flow Tests @e2e', () => {
  let testUser;

  test.beforeEach(() => {
    // Generate test user data
    testUser = new User(TestDataFactory.generateUser());
  });

  test('should create user via API and verify in UI @smoke', async ({
    page,
    apiClient,
    loginPage,
  }) => {
    // Step 1: Create user via API
    await apiClient.post('/user', testUser.toJSON());

    // Step 2: Login to the application
    await loginPage.navigate();
    await loginPage.login(
      process.env.USERNAME || 'Admin',
      process.env.PASSWORD || 'admin123'
    );

    // Step 3: Navigate to the user management page
    await page.goto(`${process.env.BASE_URL}/admin/viewSystemUsers`);

    // Step 4: Search for the created user
    await page.fill(
      'input[name="searchSystemUser[userName]"]',
      testUser.username
    );
    await page.click('button[type="submit"]');

    // Step 5: Verify the user is found
    const userRow = page.locator(
      `//div[contains(text(), "${testUser.username}")]`
    );
    await expect(userRow).toBeVisible();

    // Step 6: Clean up - delete the user via API
    await apiClient.delete(`/user/${testUser.username}`);
  });

  test('should update user via API and verify changes in UI', async ({
    page,
    apiClient,
    loginPage,
  }) => {
    // Step 1: Create user via API
    await apiClient.post('/user', testUser.toJSON());

    // Step 2: Update user via API
    const updatedEmail = `updated-${testUser.email}`;
    testUser.email = updatedEmail;
    await apiClient.put(`/user/${testUser.username}`, testUser.toJSON());

    // Step 3: Login to the application
    await loginPage.navigate();
    await loginPage.login(
      process.env.USERNAME || 'Admin',
      process.env.PASSWORD || 'admin123'
    );

    // Step 4: Navigate to the user management page
    await page.goto(`${process.env.BASE_URL}/admin/viewSystemUsers`);

    // Step 5: Search for the updated user
    await page.fill(
      'input[name="searchSystemUser[userName]"]',
      testUser.username
    );
    await page.click('button[type="submit"]');

    // Step 6: Click on the user to view details
    const userRow = page.locator(
      `//div[contains(text(), "${testUser.username}")]`
    );
    await userRow.click();

    // Step 7: Verify the updated email is displayed
    const emailField = page.locator(`//input[@value="${updatedEmail}"]`);
    await expect(emailField).toBeVisible();

    // Step 8: Clean up - delete the user via API
    await apiClient.delete(`/user/${testUser.username}`);
  });
});
