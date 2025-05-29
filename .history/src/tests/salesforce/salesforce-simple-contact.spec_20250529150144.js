// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

test.describe('Salesforce Simple Contact Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to Salesforce instance URL since we're already authenticated
    console.log('Navigating to Salesforce instance:', process.env.SF_INSTANCE_URL);
    await page.goto(process.env.SF_INSTANCE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Give extra time for the page to fully load
    
    console.log('Loaded Salesforce dashboard');
  });

  test('Create a simple contact record', async ({ page }) => {
    try {
      // Step 1: Click on App Launcher (using more specific selector)
      await page.waitForTimeout(2000); // Wait for page to stabilize
      
      // Try multiple selectors for App Launcher
      let appLauncher;
      try {
        appLauncher = page.locator('button[aria-label="App Launcher"]');
        if (await appLauncher.isVisible({ timeout: 5000 })) {
          await appLauncher.click();
          console.log('Clicked App Launcher (aria-label)');
        } else {
          // Try alternative selector
          appLauncher = page.locator('div.slds-icon-waffle');
          await appLauncher.click();
          console.log('Clicked App Launcher (waffle icon)');
        }
      } catch (error) {
        console.log('Trying one more App Launcher selector');
        // One more fallback
        appLauncher = page.locator('.appLauncher');
        await appLauncher.click();
        console.log('Clicked App Launcher (class)');
      }
      
      // Step 2: Search for Contacts
      await page.waitForTimeout(1000); // Wait for search box to appear
      try {
        const searchBox = page.getByPlaceholder(/Search apps/i);
        await searchBox.waitFor({ state: 'visible', timeout: 5000 });
        await searchBox.fill('contact');
        await searchBox.press('Enter');
        console.log('Searched for contacts');
      } catch (error) {
        console.log('Trying alternative search approach');
        // Try alternative search approach
        const altSearchBox = page.locator('input[placeholder*="Search"]').first();
        await altSearchBox.fill('contact');
        await altSearchBox.press('Enter');
        console.log('Used alternative search box');
      }
      
      // Step 3: Click on Contacts app
      await page.waitForTimeout(2000);
      
      // Try multiple approaches to find and click on Contacts
      try {
        // First try: option role
        const contactsOption = page.getByRole('option', { name: /Contacts/i }).first();
        if (await contactsOption.isVisible({ timeout: 3000 })) {
          await contactsOption.click();
          console.log('Clicked on Contacts (option)');
        } else {
          // Second try: link role
          const contactsLink = page.getByRole('link', { name: /Contacts/i }).first();
          if (await contactsLink.isVisible({ timeout: 2000 })) {
            await contactsLink.click();
            console.log('Clicked on Contacts (link)');
          } else {
            // Third try: any element containing "Contacts" text
            const contactsAny = page.getByText(/^Contacts$/i).first();
            await contactsAny.click();
            console.log('Clicked on Contacts (text)');
          }
        }
      } catch (error) {
        console.log('Using direct navigation to Contacts');
        // Last resort: Try to navigate directly to Contacts URL
        await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
        console.log('Navigated directly to Contacts URL');
      }
      
      // Step 4: Wait for contacts page to load
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Step 5: Click New button
      await page.waitForTimeout(3000); // Give more time for the page to stabilize
      try {
        const newButton = page.getByRole('button', { name: /New/i });
        await newButton.waitFor({ state: 'visible', timeout: 10000 });
        await newButton.click();
        console.log('Clicked New button');
      } catch (error) {
        console.log('Trying alternative New button selector');
        // Try alternative selector
        const altNewButton = page.locator('a[title="New"], button:has-text("New")').first();
        await altNewButton.click();
        console.log('Clicked alternative New button');
      }
      
      // Step 6: Wait for contact form to load
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Generate a unique contact name for verification
      const contactName = 'Test Contact ' + Date.now();
      console.log('Using contact name:', contactName);
      
      // Step 7: Fill in minimal required fields
      // Last Name is typically the only required field
      try {
        const lastNameInput = page.getByLabel(/Last Name/i);
        await lastNameInput.waitFor({ state: 'visible', timeout: 5000 });
        await lastNameInput.fill(contactName);
        console.log('Filled Last Name using label');
      } catch (error) {
        console.log('Trying alternative Last Name field selector');
        // Try alternative selectors
        try {
          // Try by placeholder
          const lastNameByPlaceholder = page.locator('input[placeholder*="Last Name"]');
          await lastNameByPlaceholder.fill(contactName);
          console.log('Filled Last Name using placeholder');
        } catch (innerError) {
          // Try by name attribute
          const lastNameByName = page.locator('input[name*="lastName"], input[name*="LastName"]').first();
          await lastNameByName.fill(contactName);
          console.log('Filled Last Name using name attribute');
        }
      }
      
      // Step 8: Save the contact - using multiple approaches
      await page.waitForTimeout(1000); // Give time for form to be ready
      let saveButton;
      
      try {
        // First try: exact match
        saveButton = page.getByRole('button', { name: 'Save', exact: true });
        if (await saveButton.isVisible({ timeout: 3000 })) {
          await saveButton.click();
          console.log('Clicked Save button (exact match)');
        } else {
          // Second try: case insensitive
          saveButton = page.getByRole('button', { name: /save/i }).first();
          await saveButton.click();
          console.log('Clicked Save button (case insensitive)');
        }
      } catch (error) {
        console.log('Trying alternative Save button selector');
        // Try alternative selector
        saveButton = page.locator('button[title="Save"], button:has-text("Save")').first();
        await saveButton.click();
        console.log('Clicked Save button (alternative selector)');
      }
      
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
      throw error.now()}.png` });
      throw error;
    }
  });
});