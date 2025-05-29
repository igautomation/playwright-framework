const { chromium } = require('@playwright/test');
require('dotenv').config();

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Log into Salesforce
  await page.goto(process.env.SALESFORCE_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(process.env.SF);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.SALESFORCE_PASSWORD);
  await page.getByRole('button', { name: 'Log In' }).click();

  // Save browser state for reuse in tests
  await page.context().storageState({ path: 'state.json' });

  await browser.close();
}

module.exports = globalSetup;