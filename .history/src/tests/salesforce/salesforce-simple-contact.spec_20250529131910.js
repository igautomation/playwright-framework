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
      page.getByRole('button', { name: /Cancel/i }),
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
      // Try direct navigation to Contacts first
      console.log('Attempting direct navigation to Contacts');
      await page.goto(`${process.env.SF_INSTANCE_URL}/lightning/o/Contact/list`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check if we're on the contacts page
      const contactsHeader = page.getByText('Contacts', { exact: true });
      const newButton = page.getByRole('button', { name: /New/i });

      // If direct navigation didn't work, try App Launcher approach
      if (!(await newButton.isVisible({ timeout: 3000 }).catch(() => false))) {
        console.log('Direct navigation failed, trying App Launcher');

        // Navigate back to home
        await page.goto(process.env.SF_INSTANCE_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Try different selectors for App Launcher
        const appLauncherSelectors = [
          'button[aria-label="App Launcher"]',
          'div.slds-icon-waffle',
          '[data-id="AppLauncher"]',
          'button.slds-button[title="App Launcher"]',
          'one-app-launcher-header button',
        ];

        let appLauncherClicked = false;
        for (const selector of appLauncherSelectors) {
          const launcher = page.locator(selector).first();
          if (await launcher.isVisible({ timeout: 2000 }).catch(() => false)) {
            await launcher.click();
            appLauncherClicked = true;
            console.log(`Clicked App Launcher using selector: ${selector}`);
            break;
          }
        }

        if (!appLauncherClicked) {
          throw new Error('Could not find App Launcher');
        }

        // Search for Contacts
        await page.waitForTimeout(3000);
        const searchBox = page.locator('input[placeholder*="Search apps"]');
        await searchBox.waitFor({ state: 'visible', timeout: 10000 });
        await searchBox.fill('Contacts');
        await searchBox.press('Enter');
        console.log('Searched for contacts');

        // Try multiple selectors for Contacts
        await page.waitForTimeout(2000);
        const selectors = [
          'a[data-label="Contacts"]',
          'a[title="Contacts"]',
          'a[role="option"][aria-label*="Contacts"]',
          'one-app-launcher-menu-item:has-text("Contacts")',
          'p:has-text("Contacts")',
          'a:has-text("Contacts")',
          'lightning-formatted-text:has-text("Contacts")',
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

        // Wait for contacts page to load
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
      } else {
        console.log('Direct navigation to Contacts successful');
      }

      // Click New button
      await newButton.waitFor({ state: 'visible', timeout: 10000 });
      await newButton.click();
      console.log('Clicked New button');

      // Wait for contact form to load
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      // Generate a unique contact name for verification
      const contactName = 'Test Contact ' + Date.now();
      console.log('Using contact name:', contactName);

      // Fill in minimal required fields - try different selectors for Last Name
      let lastNameFilled = false;
      const lastNameSelectors = [
        page.getByLabel(/Last Name/i),
        page.locator('input[name*="lastName"]'),
        page.locator('input[placeholder*="Last Name"]'),
      ];

      for (const selector of lastNameSelectors) {
        if (await selector.isVisible({ timeout: 2000 }).catch(() => false)) {
          await selector.fill(contactName);
          lastNameFilled = true;
          console.log('Filled Last Name');
          break;
        }
      }

      if (!lastNameFilled) {
        throw new Error('Could not find Last Name field');
      }

      // Save the contact - try different selectors for Save button
      const saveSelectors = [
        page.getByRole('button', { name: 'Save', exact: true }),
        page.locator('button:has-text("Save")'),
        page.locator('button[title="Save"]'),
      ];

      let saveClicked = false;
      for (const selector of saveSelectors) {
        if (await selector.isVisible({ timeout: 2000 }).catch(() => false)) {
          await selector.click();
          saveClicked = true;
          console.log('Clicked Save button');
          break;
        }
      }

      if (!saveClicked) {
        throw new Error('Could not find Save button');
      }

      // Wait for save to complete
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);

      // Take screenshot for debugging
      await page.screenshot({ path: `./screenshots/after-save-${Date.now()}.png` });

      // Check for success indicators
      const successIndicators = [
        page.locator('.slds-theme_success'),
        page.locator('.slds-notify_toast'),
        page.getByText(/Contact Detail/i),
        page.getByText(/Contact Information/i),
        page.getByText(contactName),
        page.getByRole('tab', { name: /Details/i }),
        page.getByRole('tab', { name: /Related/i }),
      ];

      let success = false;
      for (const indicator of successIndicators) {
        if (await indicator.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(
            'Success indicator found:',
            await indicator.textContent().catch(() => 'No text')
          );
          success = true;
          break;
        }
      }

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
