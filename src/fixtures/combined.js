// src/fixtures/combined.js

// Import Playwright's base test, expect, and mergeTests
const { test: base, expect, mergeTests } = require('@playwright/test');
// Import custom API fixture
const { apiTest } = require('./api');

// Define the testData fixture separately
const testDataFixture = base.extend({
  testData: async ({}, use) => {
    await use({ id: '456', name: 'Default User' }); // Matches defaultTestData in config
  },
});

// Combine the base test with apiTest and testDataFixture using mergeTests
const test = mergeTests(base, apiTest, testDataFixture);

module.exports = { test, expect };