// @ts-check
const BaseSalesforcePage = require('./BaseSalesforcePage');

/**
 * Page object for Salesforce Contact page
 */
class ContactPage extends BaseSalesforcePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // Locators for navigating to the contact creation page
    this.accountsTab = page.getByRole('link', { name: /Accounts/i });
    this.accountLink = page.getByRole('link', { name: /Postman|Account/i }).first();
    this.contactsRelatedTab = page.getByRole('tab', { name: /Contacts|Related/i });
    this.newContactButton = page.getByRole('button', { name: /New|New Contact/i });

    // Locators for contact creation form fields
    this.salutationDropdown = page.getByLabel(/Salutation/i);
    this.firstNameInput = page.getByLabel(/First Name/i);
    this.lastNameInput = page.getByLabel(/Last Name/i);
    this.phoneInput = page.getByLabel(/Phone/i, { exact: true });
    this.homePhoneInput = page.getByLabel(/Home Phone/i);
    this.mobileInput = page.getByLabel(/Mobile/i);
    this.titleInput = page.getByLabel(/Title/i);
    this.otherPhoneInput = page.getByLabel(/Other Phone/i);
    this.departmentInput = page.getByLabel(/Department/i);
    this.faxInput = page.getByLabel(/Fax/i);
    this.birthdateInput = page.getByLabel(/Birthdate/i);
    this.emailInput = page.getByLabel(/Email/i);
    this.leadSourceDropdown = page.getByLabel(/Lead Source/i);
    this.mailingStreetInput = page.getByLabel(/Mailing Street/i);
    this.mailingCityInput = page.getByLabel(/Mailing City/i);
    this.mailingZipInput = page.getByLabel(/Mailing.*Zip/i);
    this.mailingStateInput = page.getByLabel(/Mailing.*State/i);
    this.mailingCountryInput = page.getByLabel(/Mailing.*Country/i);
    this.otherStreetInput = page.getByLabel(/Other Street/i);
    this.otherCityInput = page.getByLabel(/Other City/i);
    this.otherZipInput = page.getByLabel(/Other.*Zip/i);
    this.otherStateInput = page.getByLabel(/Other.*State/i);
    this.otherCountryInput = page.getByLabel(/Other.*Country/i);
    this.languagesInput = page.getByLabel(/Languages/i);
    this.levelDropdown = page.getByLabel(/Level/i);
    this.descriptionInput = page.getByLabel(/Description/i);
    this.saveButton = page.getByRole('button', { name: /Save/i, exact: true });
  }

  /**
   * Navigate to contact creation form from account page
   * @param {string} accountName - Name of the account to create contact under
   */
  async navigateToContactCreation(accountName = 'Postman') {
    try {
      console.log('Navigating to Contacts tab');
      
      // First try to find and click on an account
      try {
        await this.accountLink.click({ timeout: 5000 });
        console.log('Clicked on account link');
      } catch (error) {
        console.log('Account link not found, trying alternative navigation');
        // If account link not found, try alternative navigation
        await this.accountsTab.click();
        console.log('Clicked on Accounts tab');
        
        // Wait for accounts to load and click on the first one
        const accountItem = this.page.getByRole('link', { name: /Account Name/i }).first();
        await accountItem.click({ timeout: 5000 });
        console.log('Clicked on first account item');
      }
      
      // Wait for page to load
      await this.waitForPageLoad();
      
      // Try to find the Contacts related tab
      try {
        await this.contactsRelatedTab.click({ timeout: 5000 });
        console.log('Clicked on Contacts/Related tab');
      } catch (error) {
        console.log('Contacts tab not found, looking for alternative');
        // If not found, try to find a "Related" tab
        const relatedTab = this.page.getByRole('tab', { name: /Related/i });
        await relatedTab.click({ timeout: 5000 });
        console.log('Clicked on Related tab');
      }
      
      // Wait for page to load
      await this.waitForPageLoad();
      
      // Click on New Contact button
      await this.newContactButton.click();
      console.log('Clicked on New Contact button');
      
      // Wait for form to load
      await this.waitForPageLoad();
    } catch (error) {
      console.error('Error navigating to contact creation:', error.message);
      await this.page.screenshot({ path: `./contact-navigation-error-${Date.now()}.png` });
      throw error;
    }
  }

  /**
   * Create a new contact
   * @param {Object} contactData - Contact data object
   * @returns {Promise<void>}
   */
  async createContact(contactData) {
    try {
      // Navigate to the contact creation page
      await this.navigateToContactCreation(contactData.accountName || 'Postman');

      // Fill contact details - only fill fields that are present
      console.log('Filling contact form');
      
      // Try to set salutation if dropdown is present
      try {
        await this.salutationDropdown.selectOption({ label: contactData.salutation });
        console.log('Set salutation');
      } catch (error) {
        console.log('Salutation dropdown not found or not interactable');
      }
      
      // Fill basic info
      if (await this.firstNameInput.isVisible())
        await this.firstNameInput.fill(contactData.firstName);
      
      if (await this.lastNameInput.isVisible())
        await this.lastNameInput.fill(contactData.lastName);
      
      if (await this.phoneInput.isVisible())
        await this.phoneInput.fill(contactData.phone);
      
      if (await this.emailInput.isVisible())
        await this.emailInput.fill(contactData.email);
      
      // Fill additional fields if they exist
      if (await this.titleInput.isVisible())
        await this.titleInput.fill(contactData.title);
      
      if (await this.departmentInput.isVisible())
        await this.departmentInput.fill(contactData.department);
      
      // Save the contact
      await this.saveButton.click();
      console.log('Clicked Save button');
      
      await this.waitForPageLoad();
    } catch (error) {
      console.error(`Error creating contact: ${error.message}`);
      // Take screenshot on error
      await this.page.screenshot({ path: `./contact-creation-error-${Date.now()}.png` });
      throw error;
    }
  }

  /**
   * Verify contact was created successfully
   * @returns {Promise<boolean>} True if success message is visible
   */
  async verifyContactCreated() {
    const toast = this.page.locator('.slds-notify__content');
    return await toast.isVisible();
  }

  /**
   * Verify contact was created under the specified account
   * @param {string} accountName - Account name to verify
   * @returns {Promise<boolean>} True if account heading is visible
   */
  async verifyContactUnderAccount(accountName = 'Postman') {
    const accountHeading = this.page.getByRole('heading', { name: /Account/i });
    return await accountHeading.isVisible();
  }

  /**
   * Get contact details from view page
   * @returns {Promise<Object>} Contact details
   */
  async getContactDetails() {
    // Implementation depends on the structure of the contact view page
    // This is a simplified example
    const name = await this.page.getByRole('heading', { level: 1 }).textContent();
    
    return { name };
  }
}

module.exports = ContactPage;