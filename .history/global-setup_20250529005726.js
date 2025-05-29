/**
 * Global setup for Playwright tests
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function globalSetup() {
  console.log('Running global setup...');
  
  // Create necessary directories
  const directories = [
    './reports/test-results',
    './reports/html',
    './allure-results',
    './visual-baselines',
    './visual-diffs',
    './auth'
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      console.log(`Created directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Setup Salesforce authentication state
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Log into Salesforce
    await page.goto(process.env.SF_URL || process.env.SALESFORCE_URL);
    await page.getByRole('textbox', { name: 'Username' }).fill(process.env.SF_USERNAME || process.env.);
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.SF_PASSWORD || process.env.SALESFORCE_PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();
    
    // Wait for login to complete
    await page.waitForSelector('.slds-global-header, .tabsNewClass, #home_Tab, .homeTab, .slds-context-bar', { timeout: 30000 });

    // Save browser state for reuse in tests
    await page.context().storageState({ path: './auth/salesforce-storage-state.json' });
    console.log('Salesforce authentication state saved');

    await browser.close();
  } catch (error) {
    console.error('Error during Salesforce authentication:', error);
  }
  
  console.log('Global setup complete');
}

module.exports = globalSetup;