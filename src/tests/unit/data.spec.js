// src/tests/unit/data.spec.js
const { test, expect } = require('../../fixtures/combined');

test('Verify default test data', async ({ testData }) => {
  expect(testData.id).toBe('456');
  expect(testData.name).toBe('Default User');
});