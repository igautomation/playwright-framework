/**
 * SalesforceNewContactDialog Page Object
 * Generated from https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new?count=3&nooverride=1&useRecordTypeCheck=1&navigationLocation=LIST_VIEW&uid=174811342884842430&backgroundContext=%2Flightning%2Fo%2FContact%2Flist%3FfilterName%3D__Recent
 * @generated
 */
const { BasePage } = require('../orangehrm/BasePage');

class SalesforceNewContactDialog extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // Page URL
    this.url = 'https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new?count=3&nooverride=1&useRecordTypeCheck=1&navigationLocation=LIST_VIEW&uid=174811342884842430&backgroundContext=%2Flightning%2Fo%2FContact%2Flist%3FfilterName%3D__Recent';
    
    // Selectors
    // Buttons
    this.global_actions = '[data-aura-rendered-by="19:1518;a"]';
    this.setup = '[data-aura-rendered-by="164:218;a"]';
    this.select_a_list_view__contacts = '[data-aura-rendered-by="630:0"]';
    this.new = '[data-aura-rendered-by="1015:0"]';
    this.intelligence_view = '[data-aura-rendered-by="1021:0"]';
    this.import = '[data-aura-rendered-by="1027:0"]';
    this.add_to_campaign = '[data-aura-rendered-by="1033:0"]';
    this.send_list_email = '[data-aura-rendered-by="1039:0"]';
    this.show_one_more_action = '[data-aura-rendered-by="979:0"]';
    this.sortname = '[data-aura-rendered-by="40:719;a"]';
    this.sortaccount_name = '[data-aura-rendered-by="57:719;a"]';
    this.sortaccount_site = '[data-aura-rendered-by="74:719;a"]';
    this.sortphone = '[data-aura-rendered-by="91:719;a"]';
    this.sortemail = '[data-aura-rendered-by="108:719;a"]';
    this.sortcontact_owner_alias = '[data-aura-rendered-by="125:719;a"]';
    this.show_actions = '[data-aura-rendered-by="1329:0"]';
    this.search = '[data-aura-rendered-by="275:0"]';
    this.favorite_this_item = '[data-aura-rendered-by="19:218;a"]';
    this.cancel = '[data-aura-rendered-by="728:0"]';
    this.save = '[data-aura-rendered-by="736:0"]';
    this.to_do_list = '[data-aura-rendered-by="445:0"]';
    this.list_view_controls = '[data-aura-rendered-by="849:0"]';
    this.select_list_display = '[data-aura-rendered-by="677:0"]';
    this.show_name_column_actions = '[data-aura-rendered-by="1051:0"]';
    this.show_account_name_column_actions = '[data-aura-rendered-by="1069:0"]';
    this.show_account_site_column_actions = '[data-aura-rendered-by="1087:0"]';
    this.show_phone_column_actions = '[data-aura-rendered-by="1105:0"]';
    this.show_email_column_actions = '[data-aura-rendered-by="1123:0"]';
    this.show_contact_owner_alias_column_actions = '[data-aura-rendered-by="1141:0"]';
    this.button = '[data-aura-rendered-by="960:0"]';
    this.button = '[data-aura-rendered-by="962:0"]';
    this.button = '[data-aura-rendered-by="964:0"]';
    this.button = '[data-aura-rendered-by="966:0"]';
    this.button = '[data-aura-rendered-by="968:0"]';
    this.salesforce_help = '[data-aura-rendered-by="128:218;a"]';
    this.locked_name__item_westley_yundt = '[data-aura-rendered-by="1224:0"]';
    this.edit_account_name__item__1_ = '[data-aura-rendered-by="1256:0"]';
    this.locked_account_site__item__1_ = '[data-aura-rendered-by="1271:0"]';
    this.edit_phone__item_1_827_741_5608_x931 = '[data-aura-rendered-by="1286:0"]';
    this.edit_email__item_ferne_jacobs88_gmail_com = '[data-aura-rendered-by="1305:0"]';
    this.locked_contact_owner_alias__item__1_ = '[data-aura-rendered-by="1320:0"]';
    this.minimize = '[data-aura-rendered-by="485:0"]';
    this.pop_out = '[data-aura-rendered-by="517:0"]';
    this.cancel_and_close = '[data-aura-rendered-by="553:0"]';
    this.favorites_list = '[data-aura-rendered-by="43:218;a"]';
    this.0notifications = '[data-aura-rendered-by="74:218;a"]';
    this.view_profile = '[data-aura-rendered-by="100:218;a"]';
    this.button = '[data-aura-rendered-by="5:1518;a"]';
    this.button = '[data-aura-rendered-by="970:0"]';
    this.button = '[data-aura-rendered-by="214:0;p"]';

    // Inputs
    this.item_number_column_width = '[aria-label="Item Number Column Width"]';
    this.select_32_items = '[data-aura-rendered-by="28:719;a"]';
    this.select_32_items_column_width = '[aria-label="Select 32 items Column Width"]';
    this.name_column_width = '[aria-label="Name Column Width"]';
    this.account_name_column_width = '[aria-label="Account Name Column Width"]';
    this.account_site_column_width = '[aria-label="Account Site Column Width"]';
    this.phone_column_width = '[aria-label="Phone Column Width"]';
    this.email_column_width = '[aria-label="Email Column Width"]';
    this.contact_owner_alias_column_width = '[aria-label="Contact Owner Alias Column Width"]';
    this.action_column_width = '[aria-label="Action Column Width"]';
    this.select_item_1 = '[data-aura-rendered-by="1189:0"]';
    this.input = '#global-search-01';

    // Tables
    this.recently_viewed = '[data-aura-rendered-by="792:0"]';

    // Lists
    this.list = '[data-aura-rendered-by="141:1518;a"]';
    this.list = '[data-aura-rendered-by="180:218;a"]';
    this.list = '[data-aura-rendered-by="996:0"]';
    this.list = '[data-aura-rendered-by="858:0"]';
    this.list = '[data-aura-rendered-by="686:0"]';
    this.list = '[data-aura-rendered-by="1060:0"]';
    this.list = '[data-aura-rendered-by="1078:0"]';
    this.list = '[data-aura-rendered-by="1096:0"]';
    this.list = '[data-aura-rendered-by="1114:0"]';
    this.list = '[data-aura-rendered-by="1132:0"]';
    this.list = '[data-aura-rendered-by="1150:0"]';
    this.list = '[data-aura-rendered-by="432:0"]';
    this.list = '[data-aura-rendered-by="163:0;p"]';
    this.list = '[data-aura-rendered-by="894:0"]';

    // Cards
    this.recently_viewed_contacts_list_view = '[data-aura-rendered-by="593:0"]';
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
    await this.page.waitForSelector('force-record-layout-section', { timeout: 30000 }).catch(() => {});
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
   * Click Select a List View: Contacts button
   */
  async clickSelect_a_list_view__contacts() {
    await this.click(this.select_a_list_view__contacts);
  }

  /**
   * Click New button
   */
  async clickNew() {
    await this.click(this.new);
  }

  /**
   * Click Intelligence View button
   */
  async clickIntelligence_view() {
    await this.click(this.intelligence_view);
  }

  /**
   * Click Import button
   */
  async clickImport() {
    await this.click(this.import);
  }

  /**
   * Click Add to Campaign button
   */
  async clickAdd_to_campaign() {
    await this.click(this.add_to_campaign);
  }

  /**
   * Click Send List Email button
   */
  async clickSend_list_email() {
    await this.click(this.send_list_email);
  }

  /**
   * Click Show one more action button
   */
  async clickShow_one_more_action() {
    await this.click(this.show_one_more_action);
  }

  /**
   * Click SortName button
   */
  async clickSortname() {
    await this.click(this.sortname);
  }

  /**
   * Click SortAccount Name button
   */
  async clickSortaccount_name() {
    await this.click(this.sortaccount_name);
  }

  /**
   * Click SortAccount Site button
   */
  async clickSortaccount_site() {
    await this.click(this.sortaccount_site);
  }

  /**
   * Click SortPhone button
   */
  async clickSortphone() {
    await this.click(this.sortphone);
  }

  /**
   * Click SortEmail button
   */
  async clickSortemail() {
    await this.click(this.sortemail);
  }

  /**
   * Click SortContact Owner Alias button
   */
  async clickSortcontact_owner_alias() {
    await this.click(this.sortcontact_owner_alias);
  }

  /**
   * Click Show Actions button
   */
  async clickShow_actions() {
    await this.click(this.show_actions);
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
   * Click Cancel button
   */
  async clickCancel() {
    await this.click(this.cancel);
  }

  /**
   * Click Save button
   */
  async clickSave() {
    await this.click(this.save);
  }

  /**
   * Click To Do List button
   */
  async clickTo_do_list() {
    await this.click(this.to_do_list);
  }

  /**
   * Click List View Controls button
   */
  async clickList_view_controls() {
    await this.click(this.list_view_controls);
  }

  /**
   * Click Select list display button
   */
  async clickSelect_list_display() {
    await this.click(this.select_list_display);
  }

  /**
   * Click Show Name Column Actions button
   */
  async clickShow_name_column_actions() {
    await this.click(this.show_name_column_actions);
  }

  /**
   * Click Show Account Name Column Actions button
   */
  async clickShow_account_name_column_actions() {
    await this.click(this.show_account_name_column_actions);
  }

  /**
   * Click Show Account Site Column Actions button
   */
  async clickShow_account_site_column_actions() {
    await this.click(this.show_account_site_column_actions);
  }

  /**
   * Click Show Phone Column Actions button
   */
  async clickShow_phone_column_actions() {
    await this.click(this.show_phone_column_actions);
  }

  /**
   * Click Show Email Column Actions button
   */
  async clickShow_email_column_actions() {
    await this.click(this.show_email_column_actions);
  }

  /**
   * Click Show Contact Owner Alias Column Actions button
   */
  async clickShow_contact_owner_alias_column_actions() {
    await this.click(this.show_contact_owner_alias_column_actions);
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
   * Click Locked Name: Item Westley Yundt button
   */
  async clickLocked_name__item_westley_yundt() {
    await this.click(this.locked_name__item_westley_yundt);
  }

  /**
   * Click Edit Account Name: Item {1} button
   */
  async clickEdit_account_name__item__1_() {
    await this.click(this.edit_account_name__item__1_);
  }

  /**
   * Click Locked Account Site: Item {1} button
   */
  async clickLocked_account_site__item__1_() {
    await this.click(this.locked_account_site__item__1_);
  }

  /**
   * Click Edit Phone: Item 1-827-741-5608 x931 button
   */
  async clickEdit_phone__item_1_827_741_5608_x931() {
    await this.click(this.edit_phone__item_1_827_741_5608_x931);
  }

  /**
   * Click Edit Email: Item ferne.jacobs88@gmail.com button
   */
  async clickEdit_email__item_ferne_jacobs88_gmail_com() {
    await this.click(this.edit_email__item_ferne_jacobs88_gmail_com);
  }

  /**
   * Click Locked Contact Owner Alias: Item {1} button
   */
  async clickLocked_contact_owner_alias__item__1_() {
    await this.click(this.locked_contact_owner_alias__item__1_);
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
   * Click Cancel and close button
   */
  async clickCancel_and_close() {
    await this.click(this.cancel_and_close);
  }

  /**
   * Click Favorites list button
   */
  async clickFavorites_list() {
    await this.click(this.favorites_list);
  }

  /**
   * Click 0Notifications button
   */
  async click0notifications() {
    await this.click(this.0notifications);
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
   * Click button button
   */
  async clickButton() {
    await this.click(this.button);
  }

  /**
   * Fill Item Number Column Width
   * @param {string} value
   */
  async fillItem_number_column_width(value) {
    await this.fill(this.item_number_column_width, value);
  }

  /**
   * Fill Select 32 items
   * @param {string} value
   */
  async fillSelect_32_items(value) {
    await this.fill(this.select_32_items, value);
  }

  /**
   * Fill Select 32 items Column Width
   * @param {string} value
   */
  async fillSelect_32_items_column_width(value) {
    await this.fill(this.select_32_items_column_width, value);
  }

  /**
   * Fill Name Column Width
   * @param {string} value
   */
  async fillName_column_width(value) {
    await this.fill(this.name_column_width, value);
  }

  /**
   * Fill Account Name Column Width
   * @param {string} value
   */
  async fillAccount_name_column_width(value) {
    await this.fill(this.account_name_column_width, value);
  }

  /**
   * Fill Account Site Column Width
   * @param {string} value
   */
  async fillAccount_site_column_width(value) {
    await this.fill(this.account_site_column_width, value);
  }

  /**
   * Fill Phone Column Width
   * @param {string} value
   */
  async fillPhone_column_width(value) {
    await this.fill(this.phone_column_width, value);
  }

  /**
   * Fill Email Column Width
   * @param {string} value
   */
  async fillEmail_column_width(value) {
    await this.fill(this.email_column_width, value);
  }

  /**
   * Fill Contact Owner Alias Column Width
   * @param {string} value
   */
  async fillContact_owner_alias_column_width(value) {
    await this.fill(this.contact_owner_alias_column_width, value);
  }

  /**
   * Fill Action Column Width
   * @param {string} value
   */
  async fillAction_column_width(value) {
    await this.fill(this.action_column_width, value);
  }

  /**
   * Fill Select item 1
   * @param {string} value
   */
  async fillSelect_item_1(value) {
    await this.fill(this.select_item_1, value);
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
    return await this.page.locator(this.modalContainer).waitFor({ 
      state: 'visible', 
      timeout 
    }).then(() => true).catch(() => false);
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
    await this.page.locator(this.modalContainer).waitFor({ state: 'hidden' })
      .catch(() => {});
  }

  /**
   * Click a button in the modal footer by text
   * @param {string} buttonText - Text of the button to click
   */
  async clickModalButton(buttonText) {
    await this.page.locator(`${this.modalFooter} button`)
      .filter({ hasText: buttonText })
      .click();
  }
  
  /**
   * Fill an input field in a modal by label
   * @param {string} label - Label text of the field
   * @param {string} value - Value to fill
   */
  async fillModalInput(label, value) {
    await this.page.locator(`${this.modalContent} label`)
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
   * Get all rows from Recently Viewed table
   * @returns {Promise<Array<Object>>} - Array of row objects with column values
   */
  async getRecently_viewedRows() {
    const rows = await this.page.locator('[role="grid"] tr, [role="row"]').all();
    const result = [];
    
    for (const row of rows) {
      const cells = await row.locator('td, [role="cell"]').all();
      const rowData = {};
      
      // If we have headers, use them as keys
      const headers = ["Item Number","","SortNameShow Name Column Actions","SortAccount NameShow Account Name Column Actions","SortAccount SiteShow Account Site Column Actions","SortPhoneShow Phone Column Actions","SortEmailShow Email Column Actions","SortContact Owner AliasShow Contact Owner Alias Column Actions","Action","Westley Yundt\n\nLocked Name: Item Westley Yundt","Kailey Wilkinson\n\nLocked Name: Item Kailey Wilkinson","Meggie Blanda\n\nLocked Name: Item Meggie Blanda","Braulio Harber\n\nLocked Name: Item Braulio Harber","Kay Cassin-Collier\n\nLocked Name: Item Kay Cassin-Collier","Oswaldo Larson\n\nLocked Name: Item Oswaldo Larson","Miracle Bechtelar\n\nLocked Name: Item Miracle Bechtelar","DD\n\nLocked Name: Item DD","AA\n\nLocked Name: Item AA","AA\n\nLocked Name: Item AA","Alvina Rau\n\nLocked Name: Item Alvina Rau","DOO\n\nLocked Name: Item DOO","111\n\nLocked Name: Item 111","Arianna Orn-Kuhic\n\nLocked Name: Item Arianna Orn-Kuhic","Eusebio Swift\n\nLocked Name: Item Eusebio Swift","Missouri Lynch\n\nLocked Name: Item Missouri Lynch","Irwin Kuphal\n\nLocked Name: Item Irwin Kuphal","Velva Schamberger\n\nLocked Name: Item Velva Schamberger","dd\n\nLocked Name: Item dd","d\n\nLocked Name: Item d","Princess Kertzmann\n\nLocked Name: Item Princess Kertzmann","Amani Gulgowski\n\nLocked Name: Item Amani Gulgowski","Gregg Heaney\n\nLocked Name: Item Gregg Heaney","Emelia Murazik\n\nLocked Name: Item Emelia Murazik","Willow Jast\n\nLocked Name: Item Willow Jast","Francis Wehner\n\nLocked Name: Item Francis Wehner","Ramiro Morar\n\nLocked Name: Item Ramiro Morar"];
      for (let i = 0; i < cells.length && i < headers.length; i++) {
        rowData[headers[i]] = await cells[i].textContent();
      }
      
      result.push(rowData);
    }
    
    return result;
  }

  /**
   * Get specific row from Recently Viewed table by matching criteria
   * @param {Object} criteria - Key-value pairs to match against row data
   * @returns {Promise<Object>} - Row data object
   */
  async getRecently_viewedRow(criteria) {
    const rows = await this.getRecently_viewedRows();
    
    return rows.find(row => {
      return Object.entries(criteria).every(([key, value]) => {
        return row[key] && row[key].includes(value);
      });
    });
  }

  /**
   * Click on a specific cell in Recently Viewed table
   * @param {Object} criteria - Key-value pairs to match against row data
   * @param {string|number} columnKey - Column name or index to click
   */
  async clickInRecently_viewed(criteria, columnKey) {
    const rows = await this.page.locator('[role="grid"] tr, [role="row"]').all();
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = await row.locator('td, [role="cell"]').all();
      const rowData = {};
      
      const headers = ["Item Number","","SortNameShow Name Column Actions","SortAccount NameShow Account Name Column Actions","SortAccount SiteShow Account Site Column Actions","SortPhoneShow Phone Column Actions","SortEmailShow Email Column Actions","SortContact Owner AliasShow Contact Owner Alias Column Actions","Action","Westley Yundt\n\nLocked Name: Item Westley Yundt","Kailey Wilkinson\n\nLocked Name: Item Kailey Wilkinson","Meggie Blanda\n\nLocked Name: Item Meggie Blanda","Braulio Harber\n\nLocked Name: Item Braulio Harber","Kay Cassin-Collier\n\nLocked Name: Item Kay Cassin-Collier","Oswaldo Larson\n\nLocked Name: Item Oswaldo Larson","Miracle Bechtelar\n\nLocked Name: Item Miracle Bechtelar","DD\n\nLocked Name: Item DD","AA\n\nLocked Name: Item AA","AA\n\nLocked Name: Item AA","Alvina Rau\n\nLocked Name: Item Alvina Rau","DOO\n\nLocked Name: Item DOO","111\n\nLocked Name: Item 111","Arianna Orn-Kuhic\n\nLocked Name: Item Arianna Orn-Kuhic","Eusebio Swift\n\nLocked Name: Item Eusebio Swift","Missouri Lynch\n\nLocked Name: Item Missouri Lynch","Irwin Kuphal\n\nLocked Name: Item Irwin Kuphal","Velva Schamberger\n\nLocked Name: Item Velva Schamberger","dd\n\nLocked Name: Item dd","d\n\nLocked Name: Item d","Princess Kertzmann\n\nLocked Name: Item Princess Kertzmann","Amani Gulgowski\n\nLocked Name: Item Amani Gulgowski","Gregg Heaney\n\nLocked Name: Item Gregg Heaney","Emelia Murazik\n\nLocked Name: Item Emelia Murazik","Willow Jast\n\nLocked Name: Item Willow Jast","Francis Wehner\n\nLocked Name: Item Francis Wehner","Ramiro Morar\n\nLocked Name: Item Ramiro Morar"];
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
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
  /**
   * Get all items from list list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async getListItems() {
    const items = await this.page.locator('ul li, [role="listitem"], [role="option"]').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in list list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickInList(textOrPattern) {
    await this.page.locator('ul li, [role="listitem"], [role="option"]')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }
}

module.exports = SalesforceNewContactDialog;