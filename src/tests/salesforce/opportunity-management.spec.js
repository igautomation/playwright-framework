/**
 * Salesforce Opportunity Management Tests
 */
const { test, expect } = require('@playwright/test');
const config = require('../../config');

// Get Salesforce credentials from environment or config
const sfUsername = process.env.SALESFORCE_USERNAME || config.salesforce?.username;
const sfPassword = process.env.SALESFORCE_PASSWORD || config.salesforce?.password;
const sfLoginUrl = process.env.SALESFORCE_LOGIN_URL || config.salesforce?.loginUrl || 'https://login.salesforce.com';

test.describe('Salesforce Opportunity Management', () => {
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
  
  test('should create a new opportunity', async ({ page }) => {
    // Generate unique data for opportunity
    const oppName = `Test Opportunity ${Date.now()}`;
    const closeDate = new Date();
    closeDate.setMonth(closeDate.getMonth() + 1);
    const closeDateStr = `${closeDate.getMonth() + 1}/${closeDate.getDate()}/${closeDate.getFullYear()}`;
    
    // Navigate to Opportunities tab
    await page.click('a[title="Opportunities"], .opportunityTab, [data-id="Opportunity"]');
    
    // Click New button
    await page.click('div[title="New"], button[title="New"], [data-aura-class="forceActionLink"][title="New"]');
    
    // Fill the opportunity form
    await page.waitForSelector('input[name="Name"], .opportunityName input, [data-field="Name"] input');
    await page.fill('input[name="Name"], .opportunityName input, [data-field="Name"] input', oppName);
    
    // Fill close date
    await page.fill('input[name="CloseDate"], .closeDate input, [data-field="Close Date"] input', closeDateStr);
    
    // Select stage
    await page.click('input[name="StageName"], .stageName input, [data-field="Stage"] input');
    await page.click('lightning-base-combobox-item[data-value="Prospecting"], .slds-listbox__option[data-value="Prospecting"]');
    
    // Save the opportunity
    await page.click('button[name="SaveEdit"], button.slds-button_brand[title="Save"]');
    
    // Verify the opportunity was created
    await page.waitForSelector('.toastMessage, .forceToastMessage, .slds-theme_success');
    const toastMessage = await page.textContent('.toastMessage, .forceToastMessage');
    expect(toastMessage).toContain('created') || expect(toastMessage).toContain('success');
    
    // Verify opportunity details page is displayed
    const pageTitle = await page.textContent('.slds-page-header__title, .pageDescription, .entityNameTitle');
    expect(pageTitle).toContain(oppName) || expect(pageTitle).toContain('Opportunity');
  });
  
  test('should update opportunity stage', async ({ page }) => {
    // First create an opportunity to update
    const oppName = `Update Opportunity ${Date.now()}`;
    
    // Navigate to Opportunities tab
    await page.click('a[title="Opportunities"], .opportunityTab, [data-id="Opportunity"]');
    
    // Click New button
    await page.click('div[title="New"], button[title="New"], [data-aura-class="forceActionLink"][title="New"]');
    
    // Fill the opportunity form
    await page.waitForSelector('input[name="Name"], .opportunityName input, [data-field="Name"] input');
    await page.fill('input[name="Name"], .opportunityName input, [data-field="Name"] input', oppName);
    
    // Fill close date
    const closeDate = new Date();
    closeDate.setMonth(closeDate.getMonth() + 1);
    const closeDateStr = `${closeDate.getMonth() + 1}/${closeDate.getDate()}/${closeDate.getFullYear()}`;
    await page.fill('input[name="CloseDate"], .closeDate input, [data-field="Close Date"] input', closeDateStr);
    
    // Select stage
    await page.click('input[name="StageName"], .stageName input, [data-field="Stage"] input');
    await page.click('lightning-base-combobox-item[data-value="Prospecting"], .slds-listbox__option[data-value="Prospecting"]');
    
    // Save the opportunity
    await page.click('button[name="SaveEdit"], button.slds-button_brand[title="Save"]');
    
    // Wait for opportunity to be created
    await page.waitForSelector('.toastMessage, .forceToastMessage, .slds-theme_success');
    
    // Now update the stage
    await page.click('button[name="Edit"], button[title="Edit"], .forceActionLink[title="Edit"]');
    
    // Change stage to Qualification
    await page.click('input[name="StageName"], .stageName input, [data-field="Stage"] input');
    await page.click('lightning-base-combobox-item[data-value="Qualification"], .slds-listbox__option[data-value="Qualification"]');
    
    // Save the changes
    await page.click('button[name="SaveEdit"], button.slds-button_brand[title="Save"]');
    
    // Verify update success
    await page.waitForSelector('.toastMessage, .forceToastMessage, .slds-theme_success');
    const toastMessage = await page.textContent('.toastMessage, .forceToastMessage');
    expect(toastMessage).toContain('saved') || expect(toastMessage).toContain('success');
    
    // Verify stage was updated
    const stageField = await page.textContent('[data-field="Stage"] .slds-form-element__static, .test-id__field-value[data-field="StageName"]');
    expect(stageField).toContain('Qualification');
  });
});