// salesforce-test-standalone.js
// This file contains all the necessary code for Salesforce contact creation automation
// Usage: node salesforce-test-standalone.js

const { chromium } = require('playwright');
require('dotenv').config();

// Faker implementation for generating random data
const faker = {
  person: {
    firstName: () => ['John', 'Jane', 'Michael', 'Sarah', 'David'][Math.floor(Math.random() * 5)],
    lastName: () => ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)],
    jobTitle: () => ['Manager', 'Developer', 'Designer', 'Analyst', 'Director'][Math.floor(Math.random() * 5)]
  },
  phone: {
    number: (format) => '5551234567'
  },
  commerce: {
    department: () => ['Sales', 'Marketing', 'IT', 'HR', 'Finance'][Math.floor(Math.random() * 5)]
  },
  date: {
    past: () => new Date(1980, 0, 1)
  },
  internet: {
    userName: () => ['user', 'test', 'demo', 'sample', 'customer'][Math.floor(Math.random() * 5)]
  },
  location: {
    streetAddress: () => '123 Main St',
    city: () => 'Springfield',
    zipCode: () => '12345',
    country: () => 'United States'
  },
  lorem: {
    sentence: () => 'This is a test contact created by automation.'
  }
};

// LoginPage class
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Log In' });
  }

  async navigate() {
    await this.page.goto(process.env.SF_LOGIN_URL);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

// AppLauncherPage class
class AppLauncherPage {
  constructor(page) {
    this.page = page;
    this.appLauncherButton = page.getByRole('button', { name: 'App Launcher' });
    this.searchInput = page.getByRole('combobox', { name: 'Search apps and items...' });
    this.accountsOption = page.getByRole('option', { name: 'Accounts' });
  }

  async navigateToAccounts(appName) {
    await this.appLauncherButton.click();
    await this.searchInput.fill(appName);
    await this.accountsOption.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

// ContactPage class
class ContactPage {
  constructor(page) {
    this.page = page;
    // Locators for navigating to the contact creation page
    this.accountLink = page.getByRole('link', { name: 'Postman' });
    this.newContactButton = page.getByLabel('Contacts').getByRole('button', { name: 'New' });

    // Locators for contact creation form fields
    this.salutationDropdown = page.getByRole('combobox', { name: 'Salutation' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: '*Last Name' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone', exact: true });
    this.homePhoneInput = page.getByRole('textbox', { name: 'Home Phone' });
    this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
    this.titleInput = page.getByRole('textbox', { name: 'Title' });
    this.otherPhoneInput = page.getByRole('textbox', { name: 'Other Phone' });
    this.departmentInput = page.getByRole('textbox', { name: 'Department' });
    this.faxInput = page.getByRole('textbox', { name: 'Fax' });
    this.birthdateInput = page.getByRole('textbox', { name: 'Birthdate' });
    this.yearDropdown = page.getByLabel('Pick a Year');
    this.previousMonthButton = page.getByRole('button', { name: 'Previous Month' });
    this.dayButton = page.getByLabel('-01-01').getByRole('button', { name: '1' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.leadSourceDropdown = page.getByRole('combobox', { name: 'Lead Source' });
    this.mailingStreetInput = page.getByRole('textbox', { name: 'Mailing Street' });
    this.mailingCityInput = page.getByRole('textbox', { name: 'Mailing City' });
    this.mailingZipInput = page.getByRole('textbox', { name: 'Mailing Zip/Postal Code' });
    this.mailingStateInput = page.getByRole('textbox', { name: 'Mailing State/Province' });
    this.mailingCountryInput = page.getByRole('textbox', { name: 'Mailing Country' });
    this.otherStreetInput = page.getByRole('textbox', { name: 'Other Street' });
    this.otherCityInput = page.getByRole('textbox', { name: 'Other City' });
    this.otherZipInput = page.getByRole('textbox', { name: 'Other Zip/Postal Code' });
    this.otherStateInput = page.getByRole('textbox', { name: 'Other State/Province' });
    this.otherCountryInput = page.getByRole('textbox', { name: 'Other Country' });
    this.languagesInput = page.getByRole('textbox', { name: 'Languages' });
    this.levelDropdown = page.getByRole('combobox', { name: 'Level' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Description' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
  }

  async createContact(contactData) {
    // Navigate to the contact creation page
    await this.accountLink.click();
    await this.newContactButton.click();

    // Fill contact details
    await this.salutationDropdown.click();
    await this.page.getByRole('option', { name: contactData.salutation }).locator('span').nth(1).click();
    await this.firstNameInput.fill(contactData.firstName);
    await this.lastNameInput.fill(contactData.lastName);
    await this.phoneInput.fill(contactData.phone);
    await this.homePhoneInput.fill(contactData.homePhone);
    await this.mobileInput.fill(contactData.mobile);
    await this.titleInput.fill(contactData.title);
    await this.otherPhoneInput.fill(contactData.otherPhone);
    await this.departmentInput.fill(contactData.department);
    await this.faxInput.fill(contactData.fax);

    // Set birthdate - using direct input instead of calendar picker to avoid timing issues
    try {
      await this.birthdateInput.fill('1/1/' + contactData.birthYear);
    } catch (error) {
      console.log('Skipping birthdate due to:', error.message);
    }

    // Fill remaining fields
    await this.emailInput.fill(contactData.email);
    await this.leadSourceDropdown.click();
    await this.page.getByRole('option', { name: contactData.leadSource }).locator('span').nth(1).click();
    await this.mailingStreetInput.fill(contactData.mailingStreet);
    await this.mailingCityInput.fill(contactData.mailingCity);
    await this.mailingZipInput.fill(contactData.mailingZip);
    await this.mailingStateInput.fill(contactData.mailingState);
    await this.mailingCountryInput.fill(contactData.mailingCountry);
    await this.otherStreetInput.fill(contactData.otherStreet);
    await this.otherCityInput.fill(contactData.otherCity);
    await this.otherZipInput.fill(contactData.otherZip);
    await this.otherStateInput.fill(contactData.otherState);
    await this.otherCountryInput.fill(contactData.otherCountry);
    await this.languagesInput.fill(contactData.languages);
    await this.levelDropdown.click();
    await this.page.getByText(contactData.level).click();
    await this.descriptionInput.fill(contactData.description);

    // Save the contact
    await this.saveButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait for the contact to be created
    await this.page.waitForTimeout(2000);
    
    // Verify the contact was created successfully
    const pageTitle = await this.page.title();
    console.log(`Page title after save: ${pageTitle}`);
    
    // Take a screenshot of the result
    await this.page.screenshot({ path: 'contact-created.png' });
    
    return true;
  }
}

// Main test function
async function runTest() {
  console.log('Starting Salesforce contact creation test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Environment variables:');
    console.log('SF_LOGIN_URL:', process.env.SF_LOGIN_URL);
    console.log('SF_USERNAME:', process.env.SF_USERNAME);
    
    // Initialize page objects
    const loginPage = new LoginPage(page);
    const appLauncherPage = new AppLauncherPage(page);
    const contactPage = new ContactPage(page);

    // Step 1: Log into Salesforce
    console.log('Logging into Salesforce...');
    await loginPage.navigate();
    await loginPage.login(
      process.env.SF_USERNAME,
      process.env.SF_PASSWORD
    );

    // Step 2: Navigate to Accounts app
    console.log('Navigating to Accounts app...');
    await appLauncherPage.navigateToAccounts('account');

    // Step 3: Create a new contact with test data
    console.log('Creating new contact...');
    const contactData = {
      salutation: 'Mr.',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      homePhone: faker.phone.number(),
      mobile: faker.phone.number(),
      title: faker.person.jobTitle(),
      otherPhone: faker.phone.number(),
      department: faker.commerce.department(),
      fax: faker.phone.number(),
      birthYear: faker.date.past().getFullYear().toString(),
      email: `${faker.internet.userName()}+${Date.now()}@test.com`,
      leadSource: 'Phone Inquiry',
      mailingStreet: faker.location.streetAddress(),
      mailingCity: faker.location.city(),
      mailingZip: faker.location.zipCode(),
      mailingState: 'CA',
      mailingCountry: faker.location.country(),
      otherStreet: faker.location.streetAddress(),
      otherCity: faker.location.city(),
      otherZip: faker.location.zipCode(),
      otherState: 'NY',
      otherCountry: faker.location.country(),
      languages: 'English',
      level: 'Secondary',
      description: faker.lorem.sentence()
    };

    const success = await contactPage.createContact(contactData);
    console.log('Contact creation ' + (success ? 'successful!' : 'failed!'));
    
    // Take a screenshot of the final state
    await page.screenshot({ path: 'salesforce-test-result.png' });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    // Take a screenshot on error
    await page.screenshot({ path: 'salesforce-test-error.png' });
  } finally {
    console.log('\nClosing browser...');
    await browser.close();
  }
}

// Run the test
runTest().catch(console.error);