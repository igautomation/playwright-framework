// src/tests/hybrid/demo-hybrid.spec.js
import { test, expect } from '../../../fixtures/combined.js';
const fetch = require('node-fetch');

test('@hybrid Demo Hybrid: UI and API in same test', async ({ page }) => {
  // UI Part
  await page.goto('https://automationexercise.com/');
  await expect(page).toHaveTitle(/Automation Exercise/);

  // API Part
  const response = await fetch('https://automationexercise.com/api/productsList');
  expect(response.status).toBe(200);
});
