/**
 * Salesforce Lead Management Tests
 */
const { test, expect } = require('@playwright/test');
const config = require('../../config');

// Get Salesforce credentials from environment or config
const sfUsername = process.env.SALESFORCE_USERNAME || config.salesforce?.username;
const sfPassword = process.env.SALESFORCE_PASSWORD || config.salesforce?.password;
const sfLoginUrl = process.env.SALESFORCE_LOGIN_URL || config.salesforce?.loginUrl || 'https://login.salesforce.com';

test.describe('Salesforce Lead Management', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to Salesforce login page
    await page.goto(sfLoginUrl);
    
    // Fill login form and submit
    await page.fill('#username', sfUsername);
    await page.fill('#password', sfPassword);
    await page.click('#Login');
    
    // Wait for successful login
    await page.waitForSelector('.slds-global-header, .tabsNewClass', { timeout: 60000 });
  });
  
  test('should create a new lead', async ({ page }) => {
    // Generate unique data for lead
    const lastName = `Test Lead ${Date.now()}`;
    const company = `Test Company ${Date.now()}`;
    const email = `test.lead.${Date.now()}@example.com`;
    
    // Navigate to Leads tab
    await page.click('a[title="Leads"], .leadTab, [data-id="Lead"]');
    
    // Click New button
    await page.click('div[title="New"], button[title="New"], [data-aura-class="forceActionLink"][title="New"]');
    
    // Fill the lead form
    await page.waitForSelector('input[name="lastName"], .lastName input, [data-field="Last Name"] input');
    await page.fill('input[name="lastName"], .lastName input, [data-field="Last Name"] input', lastName);
    await page.fill('input[name="company"], .company input, [data-field="Company"] input', company);
    await page.fill('input[name="email"], .email input, [data-field="Email"] input', email);
    
    // Save the lead
    await page.click('button[name="SaveEdit"], button.slds-button_brand[title="Save"]');
    
    // Verify the lead was created
    await page.waitForSelector('.toastMessage, .forceToastMessage, .slds-theme_success');
    const toastMessage = await page.textContent('.toastMessage, .forceToastMessage');
    expect(toastMessage).toContain('created') || expect(toastMessage).toContain('success');
    
    // Verify lead details page is displayed
    const pageTitle = await page.textContent('.slds-page-header__title, .pageDescription, .entityNameTitle');
    expect(pageTitle).toContain(lastName) || expect(pageTitle).toContain('Lead');
  });
  
  test('should convert a lead', async ({ page }) => {
    // First create a lead to convert
    const lastName = `Convert Lead ${Date.now()}`;
    const company = `Convert Company ${Date.now()}`;
    
    // Navigate to Leads tab
    await page.click('a[title="Leads"], .leadTab, [data-id="Lead"]');
    
    // Click New button
    await page.click('div[title="New"], button[title="New"], [data-aura-class="forceActionLink"][title="New"]');
    
    // Fill the lead form
    await page.waitForSelector('input[name="lastName"], .lastName input, [data-field="Last Name"] input');
    await page.fill('input[name="lastName"], .lastName input, [data-field="Last Name"] input', lastName);
    await page.fill('input[name="company"], .company input, [data-field="Company"] input', company);
    
    // Save the lead
    await page.click('button[name="SaveEdit"], button.slds-button_brand[title="Save"]');
    
    // Wait for lead to be created
    await page.waitForSelector('.toastMessage, .forceToastMessage, .slds-theme_success');
    
    // Click Convert button
    await page.click('button[name="convert"], [title="Convert"], .forceActionLink[title="Convert"]');
    
    // Wait for convert dialog
    await page.waitForSelector('.modal-container, .slds-modal__container');
    
    // Click Convert button in dialog
    await page.click('.modal-container button.slds-button_brand, .slds-modal__container button.slds-button_brand');
    
    // Verify conversion success
    await page.waitForSelector('.toastMessage, .forceToastMessage, .slds-theme_success');
    const toastMessage = await page.textContent('.toastMessage, .forceToastMessage');
    expect(toastMessage).toContain('convert') || expect(toastMessage).toContain('success');
  });
});