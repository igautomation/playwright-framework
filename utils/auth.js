/**
 * Authentication utilities for Salesforce
 */
import { request } from '@playwright/test';
import jsforce from 'jsforce';

/**
 * Login to Salesforce UI
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<void>}
 */
export async function loginToSalesforce(page) {
  const username = process.env.SALESFORCE_USERNAME;
  const password = process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_SECURITY_TOKEN;
  const loginUrl = process.env.SALESFORCE_BASE_URL || 'https://login.salesforce.com';

  if (!username || !password) {
    throw new Error('Salesforce credentials not found in environment variables');
  }

  // Navigate to login page
  await page.goto(loginUrl);

  // Enter credentials
  await page.fill('#username', username);
  await page.fill('#password', password);
  
  // Click login button
  await page.click('#Login');
  
  // Wait for navigation to complete - check for common Salesforce elements
  await page.waitForSelector('div.slds-global-header', { timeout: 30000 })
    .catch(() => page.waitForSelector('#oneHeader', { timeout: 30000 }))
    .catch(() => page.waitForSelector('#userNavLabel', { timeout: 30000 }));
  
  console.log('✅ Successfully logged into Salesforce UI');
}

/**
 * Get Salesforce REST API access token using OAuth
 * @returns {Promise<string>} Access token
 */
export async function getSalesforceToken() {
  const username = process.env.SALESFORCE_USERNAME;
  const password = process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_SECURITY_TOKEN;
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const loginUrl = process.env.SALESFORCE_BASE_URL || 'https://login.salesforce.com';

  if (!username || !password || !clientId || !clientSecret) {
    throw new Error('Salesforce API credentials not found in environment variables');
  }

  const conn = new jsforce.Connection({
    loginUrl,
    oauth2: {
      clientId,
      clientSecret
    }
  });

  try {
    const userInfo = await conn.login(username, password);
    return conn.accessToken;
  } catch (error) {
    console.error('❌ Failed to authenticate with Salesforce API:', error);
    throw error;
  }
}

/**
 * Create authenticated API context
 * @returns {Promise<import('@playwright/test').APIRequestContext>}
 */
export async function createSalesforceApiContext() {
  const token = await getSalesforceToken();
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL;

  return await request.newContext({
    baseURL: instanceUrl,
    extraHTTPHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}