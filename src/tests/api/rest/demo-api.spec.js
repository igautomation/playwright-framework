// src/tests/api/rest/demo-api.spec.js
import { test, expect } from '../../../fixtures/combined.js';
const fetch = require('node-fetch');

test('@api Demo API: List all products', async () => {
  const response = await fetch('https://automationexercise.com/api/productsList');
  expect(response.status).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body.products)).toBeTruthy();
});
