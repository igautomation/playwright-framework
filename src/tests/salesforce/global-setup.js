const { chromium } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Global setup function for Salesforce tests
 * Creates and saves authentication state for reuse in tests
 */
async function globalSetup() {
  console.log('Starting Salesforce authentication with:', {
    loginUrl: process.env.SF_LOGIN_URL,
    username: process.env.SF_USERNAME,
    // Password is hidden for security
  });

  // Ensure auth directory exists
  const authDir = path.resolve(process.cwd(), 'auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Launch browser with error handling
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Log into Salesforce directly
    await page.goto(process.env.SF_LOGIN_URL);
    console.log('Navigated to login page');
    
    // Fill login form
    await page.getByRole('textbox', { name: 'Username' }).fill(process.env.SF_USERNAME);
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.SF_PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();
    console.log('Submitted login form');

    // Wait for successful login
    await page.waitForTimeout(10000); // Simple wait to ensure login completes
    
    // Take a screenshot for debugging
    await page.screenshot({ path: './auth/salesforce-auth-state.png' });
    
    // Save browser state for reuse in tests
    await context.storageState({ path: './auth/salesforce-storage-state.json' });

    console.log('✅ Salesforce authentication state saved successfully');
  } catch (error) {
    console.error(`❌ Error during Salesforce authentication: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run directly if called from command line
if (require.main === module) {
  globalSetup().catch(err => {
    console.error('Failed to run global setup:', err);
    process.exit(1);
  });
}

module.exports = globalSetup;