/**
 * Salesforce Login Tests
 */
const { test, expect } = require('@playwright/test');
const config = require('../../config');

// Get Salesforce credentials from config
const sfUsername = config.credentials.salesforce.username;
const sfPassword = config.credentials.salesforce.password;
const sfLoginUrl = config.urls.salesforce;

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