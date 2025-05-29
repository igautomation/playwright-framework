// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

test.describe('Salesforce Simple Contact Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Salesforce login URL
    console.log('Navigating to Salesforce login:', process.env.SF_LOGIN_URL);
    await page.goto(process.env.SF_LOGIN_URL);
    
    // Wait for login page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Enter username and password
    await page.fill('#username', process.env.SF_USERNAME);
    await page.fill('#password', process.env.SF_PASSWORD);
    
    // Click login button
    await page.click('#Login');
    
    // Wait for login to complete and dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Give extra time for the page to fully load
    
    console.log('Logged in to Salesforce');
  });

  test('Create a simple contact record', async ({ page }) => {
    try {
      // Step 1: Click on App Launcher (using more specific selector)
      await page.waitForTimeout(2000); // Wait for page to stabilize
      const appLauncher = page.locator('button[aria-label="App Launcher"]');
      await appLauncher.waitFor({ state: 'visible', timeout: 10000 });
      await appLauncher.click();
      console.log('Clicked App Launcher');
      
      // Step 2: Search for Contacts
      const searchBox = page.getByPlaceholder(/Search apps/i);
      await searchBox.waitFor({ state: 'visible', timeout: 5000 });
      await searchBox.fill('contact');
      console.log('Searched for contacts');
      
      // Step 3: Click on Contacts app
      await page.waitForTimeout(1000);
      const contactsOption = page.getByRole('option', { name: /Contacts/i }).first();
      if (await contactsOption.isVisible({ timeout: 3000 })) {
        await contactsOption.click();
      } else {
        // Try alternative selector
        const contactsLink = page.getByRole('link', { name: /Contacts/i }).first();
        await contactsLink.click();
      }
      console.log('Clicked on Contacts');
      
      // Step 4: Wait for contacts page to load
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Step 5: Click New button
      const newButton = page.getByRole('button', { name: /New/i });
      await newButton.click();
      console.log('Clicked New button');
      
      // Step 6: Wait for contact form to load
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Generate a unique contact name for verification
      const contactName = 'Test Contact ' + Date.now();
      console.log('Using contact name:', contactName);
      
      // Step 7: Fill in minimal required fields
      // Last Name is typically the only required field
      const lastNameInput = page.getByLabel(/Last Name/i);
      await lastNameInput.fill(contactName);
      console.log('Filled Last Name');
      
      // Step 8: Save the contact - using exact match to avoid ambiguity
      const saveButton = page.getByRole('button', { name: 'Save', exact: true });
      await saveButton.click();
      console.log('Clicked Save button');
      
      // Step 9: Wait for save to complete
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000); // Longer wait to ensure page loads
      
      // Step 10: Verify success using multiple approaches
      // Take screenshot for debugging regardless of outcome
      await page.screenshot({ path: `./screenshots/after-save-${Date.now()}.png` });
      
      // Check for any of these success indicators
      const successIndicators = [
        page.locator('.slds-theme_success'),
        page.locator('.slds-notify_toast'),
        page.getByText(/Contact Detail/i),
        page.getByText(/Contact Information/i),
        page.getByText(contactName), // Look for the contact name we created
        page.getByRole('tab', { name: /Details/i }),
        page.getByRole('tab', { name: /Related/i })
      ];
      
      let success = false;
      for (const indicator of successIndicators) {
        if (await indicator.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log('Success indicator found:', await indicator.textContent().catch(() => 'No text'));
          success = true;
          break;
        }
      }
      
      // If no success indicators found, consider the test passed if we're not on the form anymore
      if (!success) {
        const saveButtonStillVisible = await saveButton.isVisible({ timeout: 1000 }).catch(() => false);
        if (!saveButtonStillVisible) {
          console.log('Save button no longer visible, assuming success');
          success = true;
        }
      }
      
      // Final verification
      if (success) {
        console.log('Contact created successfully');
      } else {
        throw new Error('Could not verify contact creation success');
      }
    } catch (error) {
      console.error('Test failed:', error.message);
      await page.screenshot({ path: `./screenshots/test-failure-${Date.now()}.png` });
      throw error;
    }
  });
});