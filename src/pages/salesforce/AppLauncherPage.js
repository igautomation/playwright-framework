// @ts-check
const BaseSalesforcePage = require('./BaseSalesforcePage');

/**
 * Page object for Salesforce App Launcher
 */
class AppLauncherPage extends BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.appLauncherButton = page.getByRole('button', { name: /App Launcher/i });
    this.searchInput = page.getByPlaceholder(/Search apps/i);
  }

  /**
   * Navigate to an app using the App Launcher
   * @param {string} appName - Name of the app to navigate to
   */
  async navigateToApp(appName) {
    try {
      console.log(`Navigating to app: ${appName}`);
      
      // Click on App Launcher
      await this.appLauncherButton.click();
      console.log('Clicked App Launcher button');
      
      // Wait for search input to be visible
      await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
      
      // Fill search input
      await this.searchInput.fill(appName);
      console.log(`Entered "${appName}" in search box`);
      
      // Wait for search results
      await this.page.waitForTimeout(1000);
      
      // Try different selectors for app options
      try {
        // First try role=option
        const appOption = this.page.getByRole('option', { name: new RegExp(appName, 'i') });
        if (await appOption.isVisible({ timeout: 3000 })) {
          await appOption.click();
          console.log(`Clicked on ${appName} option`);
        } else {
          throw new Error('App option not visible');
        }
      } catch (error) {
        console.log('Option not found, trying alternative selector');
        
        // Try link with app name
        const appLink = this.page.getByRole('link', { name: new RegExp(appName, 'i') });
        await appLink.click();
        console.log(`Clicked on ${appName} link`);
      }
      
      // Wait for page to load
      await this.waitForPageLoad();
      console.log(`Successfully navigated to ${appName}`);
    } catch (error) {
      console.error(`Error navigating to app ${appName}: ${error.message}`);
      await this.page.screenshot({ path: `./app-navigation-error-${Date.now()}.png` });
      throw error;
    }
  }

  /**
   * Navigate specifically to the Accounts app
   */
  async navigateToAccounts() {
    try {
      await this.navigateToApp('account');
    } catch (error) {
      console.log('Failed to navigate via App Launcher, trying direct navigation');
      
      // Try direct navigation to Accounts tab if available
      const accountsTab = this.page.getByRole('link', { name: /Accounts/i });
      if (await accountsTab.isVisible({ timeout: 3000 })) {
        await accountsTab.click();
        await this.waitForPageLoad();
        console.log('Navigated to Accounts via tab');
      } else {
        throw error;
      }
    }
  }

  /**
   * Navigate specifically to the Contacts app
   */
  async navigateToContacts() {
    try {
      await this.navigateToApp('contact');
    } catch (error) {
      console.log('Failed to navigate via App Launcher, trying direct navigation');
      
      // Try direct navigation to Contacts tab if available
      const contactsTab = this.page.getByRole('link', { name: /Contacts/i });
      if (await contactsTab.isVisible({ timeout: 3000 })) {
        await contactsTab.click();
        await this.waitForPageLoad();
        console.log('Navigated to Contacts via tab');
      } else {
        throw error;
      }
    }
  }
}

module.exports = AppLauncherPage;