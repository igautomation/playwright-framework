/**
 * @fileoverview Hybrid tests for Contact CRUD operations
 * Demonstrates creating records via API and verifying via UI
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage.js';
import { HomePage } from '../../../pages/HomePage.js';
import { createSalesforceApiContext } from '../../../utils/auth.js';

test.describe('Hybrid Contact Tests', () => {
  let apiContext;
  let contactId;

  test.beforeAll(async () => {
    apiContext = await createSalesforceApiContext();
  });

  test.afterAll(async () => {
    // Clean up test data
    if (contactId) {
      await apiContext.delete(`/services/data/v58.0/sobjects/Contact/${contactId}`);
    }
  });

  test('should create contact via API and verify via UI @ui @api', async ({ page }) => {
    // STEP 1: Create contact via API
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const contactData = {
      FirstName: 'Hybrid',
      LastName: 'TestContact',
      Email: uniqueEmail,
      Phone: '555-987-6543',
      Title: 'QA Engineer'
    };
    
    const createResponse = await apiContext.post('/services/data/v58.0/sobjects/Contact', {
      data: contactData
    });
    
    expect(createResponse.status()).toBe(201);
    const createResult = await createResponse.json();
    expect(createResult).toHaveProperty('id');
    expect(createResult).toHaveProperty('success', true);
    
    // Save the contact ID for verification and cleanup
    contactId = createResult.id;
    
    // STEP 2: Login to Salesforce UI
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEnvCredentials();
    
    // STEP 3: Navigate to the Contacts object
    const homePage = new HomePage(page);
    await homePage.navigateToObject('Contacts');
    
    // STEP 4: Search for the created contact
    await page.fill('[placeholder="Search this list..."], .searchBoxInput', contactData.Email);
    await page.press('[placeholder="Search this list..."], .searchBoxInput', 'Enter');
    await homePage.waitForLoad();
    
    // STEP 5: Verify contact appears in the list
    // Different locators for Lightning vs Classic
    try {
      // Try Lightning first
      const contactRow = page.locator(`.slds-truncate:has-text("${contactData.LastName}")`).first();
      await expect(contactRow).toBeVisible();
    } catch (error) {
      // Fallback to Classic
      const contactLink = page.locator(`a:has-text("${contactData.LastName}")`).first();
      await expect(contactLink).toBeVisible();
    }
    
    // STEP 6: Click on the contact to view details
    await page.click(`a:has-text("${contactData.LastName}")`);
    await homePage.waitForLoad();
    
    // STEP 7: Verify contact details
    await expect(page.locator('body')).toContainText(contactData.Email);
    await expect(page.locator('body')).toContainText(contactData.Phone);
    await expect(page.locator('body')).toContainText(contactData.Title);
  });
});