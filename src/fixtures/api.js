// src/fixtures/api.js
const { test: base } = require('@playwright/test');

const apiTest = base.extend({
  apiUser: [
    async ({ request }, use) => {
      const response = await request.post('https://example.com/api/login', {
        data: {
          username: process.env.SF_USERNAME || 'testuser',
          password: process.env.SF_PASSWORD || 'password123',
        },
      });
      const token = (await response.json()).token || 'mock-api-token';
      await use(token);
    },
    { scope: 'test' },
  ],
});

module.exports = { apiTest };