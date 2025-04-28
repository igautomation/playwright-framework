// src/tests/ui/smoke/demo-smoke.spec.js
require('module-alias/register');
const { test, expect } = require('@fixtures/combined');

test('@smoke Demo Smoke: Home page title', async ({ page }) => {
  await page.goto('https://automationexercise.com/');
  await expect(page).toHaveTitle(/Automation Exercise/);
});
