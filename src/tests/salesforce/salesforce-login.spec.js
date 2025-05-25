/**
 * Salesforce Login Tests
 */
const { test, expect } = require('@playwright/test');
const config = require('../../config');

// Get Salesforce credentials from environment or config
const sfUsername = process.env.SALESFORCE_USERNAME || config.salesforce?.username;
const sfPassword = process.env.SALESFORCE_PASSWORD || config.salesforce?.password;
const sfLoginUrl = process.env.SALESFORCE_LOGIN_URL || config.salesforce?.loginUrl || 'https://login.salesforce.com';

test.describe('Salesforce Authentication', () => {
  test('should login to Salesforce successfully', async ({ page }) => {
    // Navigate to Salesforce login page
    await page.goto(sfLoginUrl);
    
    // Fill login form
    await page.fill('#username', sfUsername);
    await page.fill('#password', sfPassword);
    
    // Click login button
    await page.click('#Login');
    
    // Wait for successful login (home page loads)
    await page.waitForSelector('.slds-global-header, .tabsNewClass, #home_Tab, .homeTab', { timeout: 60000 });
    
    // Verify login was successful
    const url = page.url();
    expect(url).toContain('.lightning.force.com') || expect(url).toContain('.salesforce.com');
    
    // Verify user menu is present (indicating logged in state)
    const userMenuExists = await page.isVisible('.profileTrigger, .branding-userProfile-button, .userProfile-button');
    expect(userMenuExists).toBeTruthy();
  });
});