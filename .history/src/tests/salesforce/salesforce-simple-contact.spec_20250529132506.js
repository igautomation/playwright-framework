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
    await page.waitForTimeout(10000); // Give extra time for the page to fully load
    
    // Check for and handle any post-login prompts or dialogs
    await page.waitForLoadState('networkidle');
    
    // Check if we need to dismiss any dialogs
    const dismissButtons = [
      page.getByRole('button', { name: /Dismiss/i }),
      page.getByRole('button', { name: /Skip/i }),
      page.getByRole('button', { name: /Next/i }),
      page.getByRole('button', { name: /Not Now/i }),
      page.getByRole('button', { name: /Cancel/i })
    ];
    
    for (const button of dismissButtons) {
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        await page.waitForTimeout(1000);
      }
    }
    
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
      await page.waitForTimeout(2000); // Wait for app launcher to fully open
      const searchBox = page.locator('input[placeholder*="Search apps"]');
      await searchBox.waitFor({ state: 'visible', timeout: 10000 });
      await searchBox.fill('contact');
      await searchBox.press('Enter');
      console.log('Searched for contacts');
      
      // Step 3: Click on Contacts app
      await page.waitForTimeout(2000);
      
      // Try multiple selectors for Contacts
      const selectors = [
        'a[data-label="Contacts"]',
        'a[title="Contacts"]',
        'a[role="option"][aria-label*="Contacts"]',
        'one-app-launcher-menu-item:has-text("Contacts")',
        'p:has-text("Contacts")'
      ];
      
      let clicked = false;
      for (const selector of selectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          await element.click();
          clicked = true;
          console.log(`Clicked on Contacts using selector: ${selector}`);
          break;
        }
      }
      
      if (!clicked) {
        console.log('Could not find Contacts app, taking screenshot for debugging');
        await page.screenshot({ path: `./screenshots/app-launcher-${Date.now()}.png` });
        throw new Error('Could not find Contacts app');
      }
      
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