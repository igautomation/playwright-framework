/**
 * XPath practice page object
 */
const BasePage = require('./BasePage');
const logger = require('../utils/common/logger');

class XPathPracticePage extends BasePage {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    super(page);
    this.url = 'https://selectorshub.com/xpath-practice-page/';
    
    // Locators
    this.userTable = '//table[@id="resultTable"]';
    this.userTableRows = '//table[@id="resultTable"]//tbody/tr';
    this.downloadLink = '//a[contains(text(), "Download")]';
    this.checkboxes = '//input[@type="checkbox"]';
    this.inputFields = '//input[@type="text"]';
    this.dropdowns = '//select';
  }

  /**
   * Navigate to XPath practice page
   * @param {string} url - URL to navigate to (optional)
   * @returns {Promise<void>}
   */
  async navigate(url = '') {
    await super.navigate(url || this.url);
    logger.info('Navigated to XPath practice page');
  }

  /**
   * Verify user in table
   * @param {string} username - Username to verify
   * @param {string} userRole - User role to verify
   * @param {string} name - Name to verify
   * @param {string} status - Status to verify
   * @returns {Promise<boolean>} True if user found
   */
  async verifyUserInTable(username, userRole, name, status) {
    logger.info(`Verifying user in table: ${username}`);
    
    // Wait for table to be visible
    await this.page.waitForSelector(this.userTable);
    
    // Get all rows
    const rows = await this.page.$$(this.userTableRows);
    
    // Check each row for the user
    for (const row of rows) {
      const rowText = await row.textContent();
      
      if (rowText.includes(username) && 
          rowText.includes(userRole) && 
          rowText.includes(name) && 
          rowText.includes(status)) {
        logger.info(`User found: ${username}`);
        return true;
      }
    }
    
    logger.info(`User not found: ${username}`);
    return false;
  }

  /**
   * Click download link
   * @returns {Promise<void>}
   */
  async clickDownloadLink() {
    logger.info('Clicking download link');
    await this.page.click(this.downloadLink);
  }

  /**
   * Check all checkboxes
   * @returns {Promise<number>} Number of checkboxes checked
   */
  async checkAllCheckboxes() {
    logger.info('Checking all checkboxes');
    
    const checkboxes = await this.page.$$(this.checkboxes);
    
    for (const checkbox of checkboxes) {
      await checkbox.check();
    }
    
    return checkboxes.length;
  }

  /**
   * Fill all input fields
   * @param {string} value - Value to fill
   * @returns {Promise<number>} Number of fields filled
   */
  async fillAllInputFields(value) {
    logger.info(`Filling all input fields with: ${value}`);
    
    const inputFields = await this.page.$$(this.inputFields);
    
    for (const field of inputFields) {
      await field.fill(value);
    }
    
    return inputFields.length;
  }

  /**
   * Select option in all dropdowns
   * @param {string} value - Value to select
   * @returns {Promise<number>} Number of dropdowns changed
   */
  async selectInAllDropdowns(value) {
    logger.info(`Selecting in all dropdowns: ${value}`);
    
    const dropdowns = await this.page.$$(this.dropdowns);
    
    for (const dropdown of dropdowns) {
      await dropdown.selectOption(value);
    }
    
    return dropdowns.length;
  }
}

module.exports = XPathPracticePage;