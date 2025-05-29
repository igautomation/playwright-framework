/**
 * Salesforce Test using imported page objects and test data
 */
const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const LoginPage = require('../../pages/salesforce/LoginPage');
const AppLauncherPage = require('../../pages/salesforce/AppLauncherPage');
const ContactPage = require('../../pages/salesforce/ContactPage');
require('dotenv').config();

// Load test data
const contactDataPath = path.join(process.cwd(), 'src/data/json/salesforce-contact-data.json');
const contactTestData = JSON.parse(fs.readFileSync(contactDataPath, 'utf8'));

test.describe('Salesforce Tests', () => {
  let loginPage;
  let appLauncherPage;
  let contactPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    appLauncherPage = new AppLauncherPage(page);
    contactPage = new ContactPage(page);
    
    // Login to Salesforce
    await loginPage.navigate();
    await loginPage.login(
      process.env.SF_USERNAME || process.env.SALESFORCE_USERNAME,
      process.env.SF_PASSWORD || process.env.SALESFORCE_PASSWORD
    );
    
    // Wait for page to load after login
    await page.waitForSelector('.slds-global-header, .tabsNewClass, #home_Tab, .homeTab, .slds-context-bar', { 
      timeout: 30000 
    });
  });

  test('Create a contact using imported page objects and test data', async ({ page }) => {
    // Navigate to Accounts app
    await appLauncherPage.navigateToAccounts('account');
    
    // Create contact data with unique email
    const contactData = {
      ...contactTestData.contacts.standard,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: `test.${Date.now()}@example.com`
    };
    
    // Create the contact
    await contactPage.createContact(contactData);
    
    // Verify success message
    const expectedSuccessMessage = `Contact "${contactData.salutation} ${contactData.lastName}" was saved.`;
    await expect(page.locator('.slds-notify__content').getByText(expectedSuccessMessage, { exact: false })).toBeVisible();
    
    // Verify the contact was created under the "Postman" account
    await expect(page.getByRole('heading', { name: /Account.*Postman/i })).toBeVisible();
  });
});