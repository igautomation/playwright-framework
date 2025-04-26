/**
 * Home Page Object for Salesforce
 */
import { BasePage } from './BasePage.js';

/**
 * Page object for Salesforce home page
 */
export class HomePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page
   */
  constructor(page) {
    super(page);
    
    // Navigation menu locators - handle both Lightning and Classic
    this.appLauncher = {
      lightning: 'button.slds-button[data-aura-class="uiButton"]',
      classic: '#AllTab_Tab'
    };
    
    this.searchBox = {
      lightning: '[data-aura-class="forceSearchInputEntitySelector"] input, .searchBoxInput',
      classic: '#phSearchInput'
    };
    
    this.userMenu = {
      lightning: '.branding-userProfile-button, .profileTrigger',
      classic: '#userNavLabel'
    };
    
    this.setupLink = {
      lightning: '[data-id="setupLink"]',
      classic: '#setupLink'
    };
  }

  /**
   * Navigate to home page
   * @returns {Promise<void>}
   */
  async goto() {
    await this.page.goto('/home/home.jsp');
    await this.waitForLoad();
  }

  /**
   * Open App Launcher
   * @returns {Promise<void>}
   */
  async openAppLauncher() {
    const launcher = this.getHealingLocator(this.appLauncher);
    await launcher.click();
    // Wait for app launcher to open
    await this.page.waitForSelector('.appLauncherDesktopInternal, .appLauncher', { state: 'visible' });
  }

  /**
   * Search for an item in global search
   * @param {string} searchTerm - Term to search for
   * @returns {Promise<void>}
   */
  async globalSearch(searchTerm) {
    const searchInput = this.getHealingLocator(this.searchBox);
    await searchInput.click();
    await searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  /**
   * Navigate to a specific object tab
   * @param {string} objectName - Name of the object (e.g., "Accounts", "Contacts")
   * @returns {Promise<void>}
   */
  async navigateToObject(objectName) {
    // Try to use app launcher first (Lightning)
    try {
      await this.openAppLauncher();
      
      // Search for the object in App Launcher
      const searchInput = this.page.locator('.slds-input');
      await searchInput.fill(objectName);
      
      // Click on the search result
      const searchResult = this.page.locator(`.slds-app-launcher__tile-body:has-text("${objectName}")`);
      await searchResult.click();
      await this.waitForLoad();
    } catch (error) {
      // Fallback to classic navigation
      try {
        // Try classic tabs
        await this.page.click(`#${objectName}_Tab`);
        await this.waitForLoad();
      } catch (classicError) {
        // If both fail, try direct URL
        const objectNameSingular = objectName.endsWith('s') 
          ? objectName.substring(0, objectName.length - 1) 
          : objectName;
        
        await this.page.goto(`/lightning/o/${objectNameSingular}/list`);
        await this.waitForLoad();
      }
    }
  }

  /**
   * Log out from Salesforce
   * @returns {Promise<void>}
   */
  async logout() {
    const userMenu = this.getHealingLocator(this.userMenu);
    await userMenu.click();
    
    // Find and click logout - different in Lightning and Classic
    try {
      // Lightning
      await this.page.click('a[data-id="logout"]');
    } catch (error) {
      // Classic
      await this.page.click('#userNav-menuItems a.logout');
    }
    
    // Wait for redirect to login page
    await this.page.waitForURL(/login\.salesforce\.com/);
  }
}