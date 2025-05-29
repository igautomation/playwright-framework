/**
 * Salesforce Account Test using imported page objects and test data
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const LoginPage = require('../../pages/salesforce/LoginPage');
const AppLauncherPage = require('../../pages/salesforce/AppLauncherPage');
const AccountPage = require('../../pages/salesforce/AccountPage');
require('dotenv').config();

// Load test data
const accountDataPath = path.join(process.cwd(), 'src/data/json/salesforce-account-data.json');
const accountTestData = JSON.parse(fs.readFileSync(accountDataPath, 'utf8'));

test.describe('Salesforce Account Tests', () => {
  let loginPage;
  let appLauncherPage;
  let accountPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    appLauncherPage = new AppLauncherPage(page);
    accountPage = new AccountPage(page);
    
    // Login to Salesforce
    await loginPage.navigate();
    await loginPage.login(
      process.env.SF_USERNAME || process.env.SALESFORCE_USERNAME
      process.env.SF_PASSWORD || process.env.SALESFORCE_PASSWORD
    );
    
    // Wait for page to load after login
    await page.waitForSelector('.slds-global-header, .tabsNewClass, #home_Tab, .homeTab, .slds-context-bar', { 
      timeout: 30000 
    });
  });

  test('Create an account using imported page objects and test data', async ({ page }) => {
    // Navigate to Accounts app
    await appLauncherPage.navigateToAccounts('account');
    
    // Create account data with unique name
    const accountData = {
      ...accountTestData.accounts.standard,
      name: `${accountTestData.accounts.standard.name} ${Date.now()}`
    };
    
    // Create the account
    const toastMessage = await accountPage.createAccount(accountData);
    
    // Verify success message
    expect(toastMessage).toContain('created') || expect(toastMessage).toContain('success');
    
    // Verify account header
    const headerText = await accountPage.getAccountHeaderText();
    expect(headerText).toContain(accountData.name);
  });
});