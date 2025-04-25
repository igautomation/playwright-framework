// Global setup file - this runs before all tests
import { chromium } from '@playwright/test';
import { loginToSalesforce } from '../utils/auth';

async function globalSetup() {
  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login to Salesforce and store authentication state
    await loginToSalesforce(page);
    
    // Save storage state for reuse in tests
    await context.storageState({ path: 'state/salesforce-auth-state.json' });
    console.log('✅ Authentication setup completed successfully');
  } catch (error) {
    console.error('❌ Authentication setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;