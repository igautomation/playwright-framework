const BasePage = require('./BasePage');

class ContactPage {
  constructor(page) {
    this.page = page;
    // Locators for navigating to the contact creation page
    this.accountLink = page.getByRole('link', { name: 'Postman' });
    this.newContactButton = page.getByLabel('Contacts').getByRole('button', { name: 'New' });

    // Locators for contact creation form fields
    this.salutationDropdown = page.getByRole('combobox', { name: 'Salutation' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: '*Last Name' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone', exact: true });
    this.homePhoneInput = page.getByRole('textbox', { name: 'Home Phone' });
    this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
    this.titleInput = page.getByRole('textbox', { name: 'Title' });
    this.otherPhoneInput = page.getByRole('textbox', { name: 'Other Phone' });
    this.departmentInput = page.getByRole('textbox', { name: 'Department' });
    this.faxInput = page.getByRole('textbox', { name: 'Fax' });
    this.birthdateInput = page.getByRole('textbox', { name: 'Birthdate' });
    this.yearDropdown = page.getByLabel('Pick a Year');
    this.previousMonthButton = page.getByRole('button', { name: 'Previous Month' });
    this.dayButton = page.getByLabel('-01-01').getByRole('button', { name: '1' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.leadSourceDropdown = page.getByRole('combobox', { name: 'Lead Source' });
    this.mailingStreetInput = page.getByRole('textbox', { name: 'Mailing Street' });
    this.mailingCityInput = page.getByRole('textbox', { name: 'Mailing City' });
    this.mailingZipInput = page.getByRole('textbox', { name: 'Mailing Zip/Postal Code' });
    this.mailingStateInput = page.getByRole('textbox', { name: 'Mailing State/Province' });
    this.mailingCountryInput = page.getByRole('textbox', { name: 'Mailing Country' });
    this.otherStreetInput = page.getByRole('textbox', { name: 'Other Street' });
    this.otherCityInput = page.getByRole('textbox', { name: 'Other City' });
    this.otherZipInput = page.getByRole('textbox', { name: 'Other Zip/Postal Code' });
    this.otherStateInput = page.getByRole('textbox', { name: 'Other State/Province' });
    this.otherCountryInput = page.getByRole('textbox', { name: 'Other Country' });
    this.languagesInput = page.getByRole('textbox', { name: 'Languages' });
    this.levelDropdown = page.getByRole('combobox', { name: 'Level' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Description' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
  }

  async createContact(contactData) {
    try {
      // Navigate to the contact creation page
      await this.accountLink.waitFor({ state: 'visible', timeout: 30000 });
      await this.accountLink.click();
      await this.page.waitForTimeout(3000);
      
      await this.newContactButton.waitFor({ state: 'visible', timeout: 30000 });
      await this.newContactButton.click();
      await this.page.waitForTimeout(3000);

      // Fill contact details
      await this.salutationDropdown.waitFor({ state: 'visible', timeout: 30000 });
      await this.salutationDropdown.click();
      await this.page.waitForTimeout(1000);
      
      const salutationOption = this.page.getByRole('option', { name: contactData.salutation });
      await salutationOption.waitFor({ state: 'visible', timeout: 10000 });
      await salutationOption.click();
      
      await this.firstNameInput.fill(contactData.firstName);
      await this.lastNameInput.fill(contactData.lastName);
      await this.phoneInput.fill(contactData.phone);
      await this.homePhoneInput.fill(contactData.homePhone);
      await this.mobileInput.fill(contactData.mobile);
      await this.titleInput.fill(contactData.title);
      await this.otherPhoneInput.fill(contactData.otherPhone);
      await this.departmentInput.fill(contactData.department);
      await this.faxInput.fill(contactData.fax);

      // Set birthdate
      await this.birthdateInput.click();
      await this.yearDropdown.selectOption(contactData.birthYear);
      await this.previousMonthButton.click({ clickCount: 3 });
      await this.dayButton.click();

      // Fill remaining fields
      await this.emailInput.fill(contactData.email);
      await this.leadSourceDropdown.click();
      await this.page.waitForTimeout(1000);
      
      const leadSourceOption = this.page.getByRole('option', { name: contactData.leadSource });
      await leadSourceOption.waitFor({ state: 'visible', timeout: 10000 });
      await leadSourceOption.click();
      
      await this.mailingStreetInput.fill(contactData.mailingStreet);
      await this.mailingCityInput.fill(contactData.mailingCity);
      await this.mailingZipInput.fill(contactData.mailingZip);
      await this.mailingStateInput.fill(contactData.mailingState);
      await this.mailingCountryInput.fill(contactData.mailingCountry);
      await this.otherStreetInput.fill(contactData.otherStreet);
      await this.otherCityInput.fill(contactData.otherCity);
      await this.otherZipInput.fill(contactData.otherZip);
      await this.otherStateInput.fill(contactData.otherState);
      await this.otherCountryInput.fill(contactData.otherCountry);
      await this.languagesInput.fill(contactData.languages);
      
      await this.levelDropdown.click();
      await this.page.waitForTimeout(1000);
      
      const levelOption = this.page.getByText(contactData.level);
      await levelOption.waitFor({ state: 'visible', timeout: 10000 });
      await levelOption.click();
      
      await this.descriptionInput.fill(contactData.description);

      // Save the contact
      await this.saveButton.click();
      await this.page.waitForTimeout(5000);
    } catch (error) {
      console.error('Error creating contact:', error);
      await this.page.screenshot({ path: 'contact-creation-error.png' });
      throw error;
    }
  }
}

module.exports = ContactPage;
