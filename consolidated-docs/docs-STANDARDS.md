<!-- Source: /Users/mzahirudeen/playwright-framework/docs/STANDARDS.md -->

# Test Standards

This document outlines the standards for writing tests in the Playwright framework.

## File Organization

1. **File Naming**: Use kebab-case for test files with `.spec.js` extension:
   - `login-page.spec.js`
   - `api-integration.spec.js`

2. **Directory Structure**: Organize tests by type and functionality:
   ```
   tests/
   ├── api/              # API tests
   │   ├── rest/         # REST API tests
   │   └── graphql/      # GraphQL API tests
   ├── e2e/              # End-to-end tests
   ├── integration/      # Integration tests
   └── unit/             # Unit tests
   ```

## Test Structure

1. **Test Grouping**: Use `test.describe` to group related tests:
   ```javascript
   test.describe('Login Functionality', () => {
     // Tests related to login
   });
   ```

2. **Test Hooks**: Use hooks for common setup and teardown:
   ```javascript
   test.describe('User Management', () => {
     test.beforeEach(async ({ page }) => {
       // Common setup
     });
     
     test.afterEach(async ({ page }) => {
       // Common teardown
     });
     
     // Tests
   });
   ```

3. **Test Naming**: Use descriptive names that explain the test's purpose:
   ```javascript
   test('should display error message for invalid credentials', async ({ page }) => {
     // Test implementation
   });
   ```

## Best Practices

1. **Environment Variables**: Use environment variables for configurable values:
   ```javascript
   await page.goto(process.env.BASE_URL);
   await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
   ```

2. **Page Objects**: Use page objects to encapsulate page interactions:
   ```javascript
   const loginPage = new LoginPage(page);
   await loginPage.login(username, password);
   ```

3. **Assertions**: Include clear assertions in every test:
   ```javascript
   await expect(page.locator('.error-message')).toBeVisible();
   await expect(page.locator('.error-message')).toHaveText('Invalid credentials');
   ```

4. **Waiting**: Use Playwright's built-in waiting mechanisms:
   ```javascript
   // Good
   await page.waitForSelector('#success-message');
   await expect(page.locator('#success-message')).toBeVisible();
   
   // Avoid
   await page.waitForTimeout(2000);
   ```

5. **Data Management**: Use test data factories or fixtures for test data:
   ```javascript
   const user = TestDataFactory.createUser();
   await userPage.createUser(user);
   ```

6. **Error Handling**: Use try/catch for expected errors:
   ```javascript
   try {
     await page.click('#non-existent-button');
     expect(false).toBeTruthy(); // Should not reach here
   } catch (error) {
     expect(error.message).toContain('Element not found');
   }
   ```

## Code Style

1. **Indentation**: Use 2 spaces for indentation.

2. **Line Length**: Keep lines under 100 characters.

3. **Comments**: Add comments for complex logic:
   ```javascript
   // Wait for both API response and animation to complete
   await Promise.all([
     page.waitForResponse('**/api/users'),
     page.waitForSelector('.user-list', { state: 'visible' })
   ]);
   ```

4. **Async/Await**: Use async/await for all asynchronous operations:
   ```javascript
   // Good
   await page.click('#submit');
   await page.waitForNavigation();
   
   // Avoid
   page.click('#submit').then(() => {
     page.waitForNavigation();
   });
   ```

## Documentation

1. **Test Description**: Add a brief description of what the test is verifying:
   ```javascript
   /**
    * Tests the login functionality with valid credentials
    * Verifies that the user is redirected to the dashboard
    */
   test('successful login redirects to dashboard', async ({ page }) => {
     // Test implementation
   });
   ```

2. **Test Data**: Document any special test data requirements:
   ```javascript
   /**
    * Requires:
    * - An active user account
    * - Admin privileges
    */
   test('admin can access user management', async ({ page }) => {
     // Test implementation
   });
   ```

## Validation

Run the validation script regularly to ensure tests meet these standards:

```bash
node ./scripts/utils/validate-tests.js
```