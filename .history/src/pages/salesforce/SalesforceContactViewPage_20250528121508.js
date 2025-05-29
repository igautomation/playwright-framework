/**
 * SalesforceContactViewPage Page Object
 * Generated from https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/r/Contact/003dL00000S5adqQAB/view
 * @generated
 */
const { BasePage } = require('./orangehrm/BasePage');

class SalesforceContactViewPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Page URL
    this.url =
      'https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/r/Contact/003dL00000S5adqQAB/view';

    // Selectors
    // Buttons
    this.global_actions = '[data-aura-rendered-by="19:1122;a"]';
    this.setup = '[data-aura-rendered-by="164:218;a"]';
    this.add_to_campaign = '[data-aura-rendered-by="1174:0"]';
    this.upload_files = '[data-aura-rendered-by="1312:0"]';
    this.show_all_past_activities_in_a_new_tab = '[data-aura-rendered-by="28:848;a"]';
    this.search = '[data-aura-rendered-by="275:0"]';
    this.favorite_this_item = '[data-aura-rendered-by="19:218;a"]';
    this.follow = '[data-aura-rendered-by="1207:0"]';
    this.to_do_list = '[data-aura-rendered-by="445:0"]';
    this.upcoming___overdue = '[data-aura-rendered-by="743:0"]';
    this.button = '[data-aura-rendered-by="1171:0"]';
    this.button = '[data-aura-rendered-by="1324:0"]';
    this.salesforce_help = '[data-aura-rendered-by="128:218;a"]';
    this.timeline_settings = '[data-aura-rendered-by="708:0"]';
    this.refresh = '[data-aura-rendered-by="719:0"]';
    this.expand_all = '[data-aura-rendered-by="728:0"]';
    this.minimize = '[data-aura-rendered-by="485:0"]';
    this.pop_out = '[data-aura-rendered-by="517:0"]';
    this.favorites_list = '[data-aura-rendered-by="43:218;a"]';
    this.notifications = '[data-aura-rendered-by="74:218;a"]';
    this.view_profile = '[data-aura-rendered-by="100:218;a"]';
    this.button = '[data-aura-rendered-by="5:1122;a"]';
    this.button = '[data-aura-rendered-by="214:0;p"]';

    // Inputs
    this.input = '#global-search-01';
    this.input = '[data-aura-rendered-by="1273:0"]';
    this.input = 'lightning-input';

    // Tables
    this.campaign_history = '[data-aura-rendered-by="639:0"]';

    // Lists
    this.list = '[data-aura-rendered-by="141:1122;a"]';
    this.list = '[data-aura-rendered-by="180:218;a"]';
    this.list = '[data-aura-rendered-by="432:0"]';
    this.list = '[data-aura-rendered-by="163:0;p"]';
    this.list = '[data-aura-rendered-by="1155:0"]';
    this.list = '[data-aura-rendered-by="1304:0"]';
    this.list = '[data-aura-rendered-by="2:1035;a"]';
    this.list = '[data-aura-rendered-by="752:0"]';

    // Cards
    this.campaign_history = '[data-aura-rendered-by="579:0"]';
    this.notes___attachments = '[data-aura-rendered-by="1238:0"]';
    this.card = '[data-aura-rendered-by="1092:0"]';
    // Modal/Dialog selectors
    this.modalContainer = '.slds-modal';
    this.modalHeader = '.slds-modal__header';
    this.modalContent = '.slds-modal__content';
    this.modalFooter = '.slds-modal__footer';
    this.modalCloseButton = '.slds-modal__close';
    this.modalTitle = '.slds-modal__header h2';
    this.modalBackdrop = '.slds-backdrop';
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    await this.page
      .waitForSelector('force-record-layout-section', { timeout: 30000 })
      .catch(() => {});
  }

  /**
   * Click Global Actions button
   */
  async clickGlobal_actions() {
    await this.click(this.global_actions);
  }

  /**
   * Click Setup button
   */
  async clickSetup() {
    await this.click(this.setup);
  }

  /**
   * Click Add to Campaign button
   */
  async clickAdd_to_campaign() {
    await this.click(this.add_to_campaign);
  }

  /**
   * Click Upload Files button
   */
  async clickUpload_files() {
    await this.click(this.upload_files);
  }

  /**
   * Click Show all past activities in a new tab button
   */
  async clickShow_all_past_activities_in_a_new_tab() {
    await this.click(this.show_all_past_activities_in_a_new_tab);
  }

  /**
   * Click Search button
   */
  async clickSearch() {
    await this.click(this.search);
  }

  /**
   * Click Favorite this item button
   */
  async clickFavorite_this_item() {
    await this.click(this.favorite_this_item);
  }

  /**
   * Click Follow button
   */
  async clickFollow() {
    await this.click(this.follow);
  }

  /**
   * Click To Do List button
   */
  async clickTo_do_list() {
    await this.click(this.to_do_list);
  }

  /**
   * Click Upcoming & Overdue button
   */
  async clickUpcoming___overdue() {
    await this.click(this.upcoming___overdue);
  }

  /**
   * Click button button
   */
  async clickButton() {
    await this.click(this.button);
  }

  /**
   * Click button button
   */
  async clickButton() {
    await this.click(this.button);
  }

  /**
   * Click Salesforce Help button
   */
  async clickSalesforce_help() {
    await this.click(this.salesforce_help);
  }

  /**
   * Click Timeline Settings button
   */
  async clickTimeline_settings() {
    await this.click(this.timeline_settings);
  }

  /**
   * Click Refresh button
   */
  async clickRefresh() {
    await this.click(this.refresh);
  }

  /**
   * Click Expand All button
   */
  async clickExpand_all() {
    await this.click(this.expand_all);
  }

  /**
   * Click Minimize button
   */
  async clickMinimize() {
    await this.click(this.minimize);
  }

  /**
   * Click Pop-out button
   */
  async clickPop_out() {
    await this.click(this.pop_out);
  }

  /**
   * Click Favorites list button
   */
  async clickFavorites_list() {
    await this.click(this.favorites_list);
  }

  /**
   * Click Notifications button
   */
  async clickNotifications() {
    await this.click(this.notifications);
  }

  /**
   * Click View profile button
   */
  async clickView_profile() {
    await this.click(this.view_profile);
  }

  /**
   * Click button button
   */
  async clickButton() {
    await this.click(this.button);
  }

  /**
   * Click button button
   */
  async clickButton() {
    await this.click(this.button);
  }

  /**
   * Fill input
   * @param {string} value
   */
  async fillInput(value) {
    await this.fill(this.input, value);
  }

  /**
   * Fill input
   * @param {string} value
   */
  async fillInput(value) {
    await this.fill(this.input, value);
  }

  /**
   * Fill input
   * @param {string} value
   */
  async fillInput(value) {
    await this.fill(this.input, value);
  }
  /**
   * Wait for a modal dialog to appear
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} - Whether the modal appeared
   */
  async waitForModal(timeout = 10000) {
    return await this.page
      .locator(this.modalContainer)
      .waitFor({
        state: 'visible',
        timeout,
      })
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Get the title of the current modal
   * @returns {Promise<string>} - Modal title text
   */
  async getModalTitle() {
    return await this.page.locator(this.modalTitle).textContent();
  }

  /**
   * Close the current modal by clicking the close button
   */
  async closeModal() {
    await this.click(this.modalCloseButton);
    await this.page
      .locator(this.modalContainer)
      .waitFor({ state: 'hidden' })
      .catch(() => {});
  }

  /**
   * Click a button in the modal footer by text
   * @param {string} buttonText - Text of the button to click
   */
  async clickModalButton(buttonText) {
    await this.page.locator(`${this.modalFooter} button`).filter({ hasText: buttonText }).click();
  }

  /**
   * Fill an input field in a modal by label
   * @param {string} label - Label text of the field
   * @param {string} value - Value to fill
   */
  async fillModalInput(label, value) {
    await this.page
      .locator(`${this.modalContent} label`)
      .filter({ hasText: label })
      .locator('xpath=..//input, ../textarea')
      .fill(value);
  }

  /**
   * Check if a modal is visible
   * @returns {Promise<boolean>} - Whether the modal is visible
   */
  async isModalVisible() {
    return await this.page.locator(this.modalContainer).isVisible();
  }

  /**
   * Get text content from the modal
   * @returns {Promise<string>} - Text content of the modal
   */
  async getModalContent() {
    return await this.page.locator(this.modalContent).textContent();
  }

  /**
   * Get all rows from Campaign History table
   * @returns {Promise<Array<Object>>} - Array of row objects with column values
   */
  async getCampaign_historyRows() {
    const rows = await this.page.locator('[role="grid"] tr, [role="row"]').all();
    const result = [];

    for (const row of rows) {
      const cells = await row.locator('td, [role="cell"]').all();
      const rowData = {};

      // If we have headers, use them as keys
      const headers = ['Campaign Name', 'Start Date', 'Type', 'Status', 'Action'];
      for (let i = 0; i < cells.length && i < headers.length; i++) {
        rowData[headers[i]] = await cells[i].textContent();
      }

      result.push(rowData);
    }

    return result;
  }

  /**
   * Get specific row from Campaign History table by matching criteria
   * @param {Object} criteria - Key-value pairs to match against row data
   * @returns {Promise<Object>} - Row data object
   */
  async getCampaign_historyRow(criteria) {
    const rows = await this.getCampaign_historyRows();

    return rows.find(row => {
      return Object.entries(criteria).every(([key, value]) => {
        return row[key] && row[key].includes(value);
      });
    });
  }

  /**
   * Click on a specific cell in Campaign History table
   * @param {Object} criteria - Key-value pairs to match against row data
   * @param {string|number} columnKey - Column name or index to click
   */
  async clickInCampaign_history(criteria, columnKey) {
    const rows = await this.page.locator('[role="grid"] tr, [role="row"]').all();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = await row.locator('td, [role="cell"]').all();
      const rowData = {};

      const headers = ['Campaign Name', 'Start Date', 'Type', 'Status', 'Action'];
      for (let j = 0; j < cells.length && j < headers.length; j++) {
        rowData[headers[j]] = await cells[j].textContent();
      }

      const matches = Object.entries(criteria).every(([key, value]) => {
        return rowData[key] && rowData[key].includes(value);
      });

      if (matches) {
        const columnIndex = typeof columnKey === 'string' ? headers.indexOf(columnKey) : columnKey;
        if (columnIndex !== -1) {
          await cells[columnIndex].click();
          return;
        }
      }
    }

    throw new Error('No matching row found in table');
  }
}

module.exports = SalesforceContactViewPage;
