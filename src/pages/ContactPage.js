/**
 * ContactPage - Page Object
 * Generated from DOM extraction
 */
const { BasePage } = require('./BasePage');

class ContactPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // Page URL
    this.url = 'https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new';
    
    // Selectors
    this.globalActionsButton = 'button:has-text("Global Actions")';
    this.setupButton = 'button:has-text("Setup")';
    this.searchButton = '[aria-label="Search"]';
    this.favoriteThisItemButton = '[aria-label="Favorite this item"]';
    this.favoritesListButton = 'button:has-text("Favorites list")';
    this.salesforceHelpButton = 'button:has-text("Salesforce Help")';
    this.NotificationsButton = 'button:has-text("0Notifications")';
    this.viewProfileButton = 'button:has-text("View profile")';
    this.cancelAndCloseButton = 'button:has-text("Cancel and close")';
    this.globalCreateButtonButton = '.slds-button';
    this.searchSelect = '[data-target-selection-name]';
    this.thisItemDoesnSelect = '[data-target-selection-name]';
    this.globalActionsGlobalActionsSelect = '[data-target-selection-name]';
    this.guidanceCenterSelect = '[data-target-selection-name]';
    this.salesforceHelpSelect = '[data-target-selection-name]';
    this.setupSelect = '[data-target-selection-name]';
    this.NotificationsSelect = '[data-target-selection-name]';
    this.viewProfileSelect = '[data-target-selection-name]';
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }



  /**
   * Click globalActions button
   */
  async clickglobalActions() {
    await this.click(this.globalActionsButton);
  }

  /**
   * Click setup button
   */
  async clicksetup() {
    await this.click(this.setupButton);
  }

  /**
   * Click search button
   */
  async clicksearch() {
    await this.click(this.searchButton);
  }

  /**
   * Click favoriteThisItem button
   */
  async clickfavoriteThisItem() {
    await this.click(this.favoriteThisItemButton);
  }

  /**
   * Click favoritesList button
   */
  async clickfavoritesList() {
    await this.click(this.favoritesListButton);
  }

  /**
   * Click salesforceHelp button
   */
  async clicksalesforceHelp() {
    await this.click(this.salesforceHelpButton);
  }

  /**
   * Click Notifications button
   */
  async clickNotifications() {
    await this.click(this.NotificationsButton);
  }

  /**
   * Click viewProfile button
   */
  async clickviewProfile() {
    await this.click(this.viewProfileButton);
  }

  /**
   * Click cancelAndClose button
   */
  async clickcancelAndClose() {
    await this.click(this.cancelAndCloseButton);
  }

  /**
   * Click globalCreateButton button
   */
  async clickglobalCreateButton() {
    await this.click(this.globalCreateButtonButton);
  }

  /**
   * Select option in search dropdown
   * @param {string} value
   */
  async selectsearch(value) {
    await this.selectOption(this.searchSelect, value);
  }

  /**
   * Select option in thisItemDoesn dropdown
   * @param {string} value
   */
  async selectthisItemDoesn(value) {
    await this.selectOption(this.thisItemDoesnSelect, value);
  }

  /**
   * Select option in globalActionsGlobalActions dropdown
   * @param {string} value
   */
  async selectglobalActionsGlobalActions(value) {
    await this.selectOption(this.globalActionsGlobalActionsSelect, value);
  }

  /**
   * Select option in guidanceCenter dropdown
   * @param {string} value
   */
  async selectguidanceCenter(value) {
    await this.selectOption(this.guidanceCenterSelect, value);
  }

  /**
   * Select option in salesforceHelp dropdown
   * @param {string} value
   */
  async selectsalesforceHelp(value) {
    await this.selectOption(this.salesforceHelpSelect, value);
  }

  /**
   * Select option in setup dropdown
   * @param {string} value
   */
  async selectsetup(value) {
    await this.selectOption(this.setupSelect, value);
  }

  /**
   * Select option in Notifications dropdown
   * @param {string} value
   */
  async selectNotifications(value) {
    await this.selectOption(this.NotificationsSelect, value);
  }

  /**
   * Select option in viewProfile dropdown
   * @param {string} value
   */
  async selectviewProfile(value) {
    await this.selectOption(this.viewProfileSelect, value);
  }


}

module.exports = ContactPage;