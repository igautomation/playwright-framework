const { test, expect } = require('@playwright/test');
const ApiUtils = require('../../utils/api/apiUtils');

test.describe('API Utils @validation', () => {
  // Mock API responses using page.route instead of nock for simplicity
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route(`${process.env.EXAMPLE_API_URL}/users`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, name: 'Test User' }]),
      });
    });

    await page.route(`${process.env.EXAMPLE_API_URL}/users/1`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, name: 'Test User' }),
      });
    });
  });

  test('should handle auth token', async () => {
    const apiUtils = new ApiUtils(process.env.EXAMPLE_API_URL);
});

    apiUtils.setAuthToken('test-token');
    expect(apiUtils.defaultHeaders['Authorization']).toBe('Bearer test-token');
  });

  test('should set API key', async () => {
    const apiUtils = new ApiUtils(process.env.EXAMPLE_API_URL);
    apiUtils.setApiKey('test-api-key');
    expect(apiUtils.defaultHeaders['X-API-Key']).toBe('test-api-key');
  });

  // Simple validation test that doesn't require actual API calls
  test('should have correct base URL', async () => {
    const apiUtils = new ApiUtils(process.env.EXAMPLE_API_URL);
    expect(apiUtils.baseUrl).toBe(process.env.EXAMPLE_API_URL);
  });
});
