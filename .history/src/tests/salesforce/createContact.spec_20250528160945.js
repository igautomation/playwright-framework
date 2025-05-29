const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const LoginPage = require('../../pages/salesforce/LoginPage');
const AppLauncherPage = require('../../pages/salesforce/AppLauncherPage');
const ContactPage = require('../../pages/salesforce/ContactPage');
require('dotenv').config();

test('Create a new contact under Postman account', async ({ page }) => {
  // Initialize page objects
  const loginPage = new LoginPage(page);
  const appLauncherPage = new AppLauncherPage(page);
  const contactPage = new ContactPage(page);

  // Step 1: Log into Salesforce
  await loginPage.navigate();
  await loginPage.login(
    process.env.SF_USERNAME || process.env.S,
    process.env.SF_PASSWORD || process.env.SALESFORCE_PASSWORD
  );

  // Wait for successful login
  await page.waitForSelector('.slds-global-header, .tabsNewClass, #home_Tab, .homeTab, .slds-context-bar', { 
    timeout: 30000 
  });

  // Step 2: Navigate to Accounts app
  await appLauncherPage.navigateToAccounts('account');

  // Step 3: Create a new contact under the "Postman" account
  const contactData = {
    salutation: 'Mr.',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number('###-###-####'),
    homePhone: faker.phone.number('###-###-####'),
    mobile: faker.phone.number('###-###-####'),
    title: faker.person.jobTitle(),
    otherPhone: faker.phone.number('###-###-####'),
    department: faker.commerce.department(),
    fax: faker.phone.number('###-###-####'),
    birthYear: faker.date.past(50, new Date(2000, 0, 1)).getFullYear().toString(),
    email: `test.${Date.now()}@example.com`,
    leadSource: 'Phone Inquiry',
    mailingStreet: faker.location.streetAddress(),
    mailingCity: faker.location.city(),
    mailingZip: faker.location.zipCode('#####'),
    mailingState: 'IN',
    mailingCountry: 'United States',
    otherStreet: faker.location.streetAddress(),
    otherCity: faker.location.city(),
    otherZip: faker.location.zipCode('#####'),
    otherState: 'IN',
    otherCountry: 'United States',
    languages: 'English',
    level: 'Primary',
    description: faker.lorem.sentence(),
  };
  
  try {
    await contactPage.createContact(contactData);
    
    // Verify success message
    const expectedSuccessMessage = `Contact "${contactData.salutation} ${contactData.lastName}" was saved.`;
    await expect(page.locator('.slds-notify__content').getByText(expectedSuccessMessage, { exact: false })).toBeVisible();
    
    // Verify the contact was created under the "Postman" account
    await expect(page.getByRole('heading', { name: /Account.*Postman/i })).toBeVisible();
  } catch (error) {
    console.error('Error creating contact:', error);
    await page.screenshot({ path: 'contact-error.png' });
    throw error;
  }
});