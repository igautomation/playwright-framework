/**
 * ContactPage - Test Suite
 * Generated from page object
 */
const { test, expect } = require('@playwright/test');
const { ContactPage } = require('../src/pages/ContactPage');

test.describe('ContactPage Tests', () => {
  let page;
  let contactPage;

  test.beforeEach(async ({ browser }) => {
    // Create a new context with storage state (logged in session)
    const context = await browser.newContext({
      storageState: './auth/salesforce-storage-state.json'
    });
    
    page = await context.newPage();
    contactPage = new ContactPage(page);
    
    // Navigate to the page
    await contactPage.goto();
  });

  test('should create a new record with valid data', async () => {
    // Fill in form fields
    await contactPage.fillFirstName('Test');
    await contactPage.fillLastName('User');
    await contactPage.fillEmail('test@example.com');
    
    // Submit the form
    await contactPage.clickSave();
    
    // Verify success
    await expect(page.locator('.toastMessage')).toContainText('created');
  });

  test('should show validation errors for required fields', async () => {
    // Submit without filling required fields
    await contactPage.clickSave();
    
    // Verify validation errors
    await expect(page.locator('.errorMessage')).toBeVisible();
  });

  test('should cancel form submission', async () => {
    // Fill some data
    await contactPage.fillFirstName('Test');
    
    // Click cancel
    await contactPage.clickCancel();
    
    // Verify we're back to the list view
    await expect(page).toHaveURL(/.*/lightning/o/Contact/list/);
  });
});