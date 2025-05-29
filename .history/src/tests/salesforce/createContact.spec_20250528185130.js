const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const LoginPage = require('../../pages/salesforce/LoginPage');
const AppLauncherPage = require('../../pages/salesforce/AppLauncherPage');
const ContactPage = require('../../pages/salesforce/ContactPage');
require('dotenv').config();

test('Create a new contact under Postman account', async ({ page }) => {
  // Increase test timeout
  test.setTimeout(120000);
  
  // Initialize page objects
  const loginPage = new LoginPage(page);
  const appLauncherPage = new AppLauncherPage(page);
  const contactPage = new ContactPage(page);

  try {
    // Step 1: Log into Salesforce
    await loginPage.navigate();
    await loginPage.login(
      process.env.SF_USERNAME || process.env.SF_USERNAME,
      process.env.SALESFORCE_PASSWORD || process.env.SF_USERNAME
    );

    // Step 2: Navigate to Accounts app
    await appLauncherPage.navigateToAccounts('account');

    // Step 3: Create a new contact under the "Postman" account
    const contactData = {
      salutation: 'Mr.',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number('###########'),
      homePhone: faker.phone.number('###########'),
      mobile: faker.phone.number('###########'),
      title: faker.person.jobTitle(),
      otherPhone: faker.phone.number('###########'),
      department: faker.commerce.department(),
      fax: faker.phone.number('###########'),
      birthYear: faker.date.past(50, new Date(2000, 0, 1)).getFullYear().toString(),
      email: `${faker.internet.userName()}+${Date.now()}@test.com`, // Ensure email uniqueness
      leadSource: 'Phone Inquiry',
      mailingStreet: faker.location.streetAddress(),
      mailingCity: faker.location.city(),
      mailingZip: faker.location.zipCode('######'),
      mailingState: 'IN',
      mailingCountry: faker.location.country(),
      otherStreet: faker.location.streetAddress(),
      otherCity: faker.location.city(),
      otherZip: faker.location.zipCode('######'),
      otherState: 'IN',
      otherCountry: faker.location.country(),
      languages: 'English',
      level: 'Primary',
      description: faker.lorem.sentence(),
    };
    
    await contactPage.createContact(contactData);

    // Step 4: Validate the success message
    const expectedSuccessMessage = `Contact "${contactData.salutation} ${contactData.lastName}" was saved.`;
    
    // Try multiple locator strategies for success message
    let successMessageFound = false;
    const successMessageLocators = [
      page.locator('.slds-notify__content').getByText(expectedSuccessMessage, { exact: false }),
      page.locator('.slds-notify__content:has-text("' + contactData.lastName + '")'),
      page.locator('.toastMessage:has-text("' + contactData.lastName + '")')
    ];
    
    for (const locator of successMessageLocators) {
      try {
        await expect(locator).toBeVisible({ timeout: 10000 });
        successMessageFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!successMessageFound) {
      throw new Error('Success message not found');
    }

    // Step 5: Verify the contact was created under the "Postman" account
    const accountHeaderLocators = [
      page.getByRole('heading', { name: /Account.*Postman/i }),
      page.locator('h1:has-text("Postman")'),
      page.locator('.slds-page-header__title:has-text("Postman")')
    ];
    
    let accountHeaderFound = false;
    for (const locator of accountHeaderLocators) {
      try {
        await expect(locator).toBeVisible({ timeout: 10000 });
        accountHeaderFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!accountHeaderFound) {
      throw new Error('Account header not found');
    }
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'test-failure.png' });
    throw error;
  }
});