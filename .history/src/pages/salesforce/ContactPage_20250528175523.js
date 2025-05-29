const BasePage = require('./BasePage');

class ContactPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Define locator strategies for each element
    this.accountLinkStrategies = [
      { role: 'link', options: { name: 'Postman' } },
      'a:has-text("Postman")'
    ];
    
    this.newContactButtonStrategies = [
      { role: 'button', options: { name: 'New' } },
      'button:has-text("New")',
      '[title="New"]'
    ];
    
    this.salutationStrategies = [
      { role: 'combobox', options: { name: 'Salutation' } },
      '[name="salutation"]'
    ];
    
    this.salutationOptionStrategies = (value) => [
      { role: 'option', options: { name: value } },
      `[title="${value}"]`,
      `[data-value="${value}"]`
    ];
    
    this.formFieldStrategies = {
      firstName: [
        { role: 'textbox', options: { name: 'First Name' } },
        'input[name="firstName"]'
      ],
      lastName: [
        { role: 'textbox', options: { name: '*Last Name' } },
        'input[name="lastName"]'
      ],
      phone: [
        { role: 'textbox', options: { name: 'Phone', exact: true } },
        'input[name="phone"]'
      ],
      homePhone: [
        { role: 'textbox', options: { name: 'Home Phone' } },
        'input[name="homePhone"]'
      ],
      mobile: [
        { role: 'textbox', options: { name: 'Mobile' } },
        'input[name="mobilePhone"]'
      ],
      title: [
        { role: 'textbox', options: { name: 'Title' } },
        'input[name="title"]'
      ],
      otherPhone: [
        { role: 'textbox', options: { name: 'Other Phone' } },
        'input[name="otherPhone"]'
      ],
      department: [
        { role: 'textbox', options: { name: 'Department' } },
        'input[name="department"]'
      ],
      fax: [
        { role: 'textbox', options: { name: 'Fax' } },
        'input[name="fax"]'
      ],
      birthdate: [
        { role: 'textbox', options: { name: 'Birthdate' } },
        'input[name="birthdate"]'
      ],
      email: [
        { role: 'textbox', options: { name: 'Email' } },
        'input[name="email"]'
      ],
      mailingStreet: [
        { role: 'textbox', options: { name: 'Mailing Street' } },
        'textarea[name="street"]'
      ],
      mailingCity: [
        { role: 'textbox', options: { name: 'Mailing City' } },
        'input[name="city"]'
      ],
      mailingZip: [
        { role: 'textbox', options: { name: 'Mailing Zip/Postal Code' } },
        'input[name="postalCode"]'
      ],
      mailingState: [
        { role: 'textbox', options: { name: 'Mailing State/Province' } },
        'input[name="province"]'
      ],
      mailingCountry: [
        { role: 'textbox', options: { name: 'Mailing Country' } },
        'input[name="country"]'
      ],
      otherStreet: [
        { role: 'textbox', options: { name: 'Other Street' } },
        'textarea[name="otherStreet"]'
      ],
      otherCity: [
        { role: 'textbox', options: { name: 'Other City' } },
        'input[name="otherCity"]'
      ],
      otherZip: [
        { role: 'textbox', options: { name: 'Other Zip/Postal Code' } },
        'input[name="otherPostalCode"]'
      ],
      otherState: [
        { role: 'textbox', options: { name: 'Other State/Province' } },
        'input[name="otherState"]'
      ],
      otherCountry: [
        { role: 'textbox', options: { name: 'Other Country' } },
        'input[name="otherCountry"]'
      ],
      languages: [
        { role: 'textbox', options: { name: 'Languages' } },
        'input[name="languages"]'
      ],
      description: [
        { role: 'textbox', options: { name: 'Description' } },
        'textarea[name="description"]'
      ]
    };
    
    this.leadSourceStrategies = [
      { role: 'combobox', options: { name: 'Lead Source' } },
      '[name="leadSource"]'
    ];
    
    this.levelStrategies = [
      { role: 'combobox', options: { name: 'Level' } },
      '[name="level"]'
    ];
    
    this.saveButtonStrategies = [
      { role: 'button', options: { name: 'Save', exact: true } },
      'button[name="SaveEdit"]',
      '.slds-button:has-text("Save")'
    ];
  }

  async createContact(contactData) {
    try {
      // Navigate to the contact creation page
      await this.clickElement(this.accountLinkStrategies, { waitAfter: 2000 });
      await this.clickElement(this.newContactButtonStrategies, { waitAfter: 2000 });

      // Fill contact details
      await this.clickElement(this.salutationStrategies, { waitAfter: 1000 });
      await this.clickElement(this.salutationOptionStrategies(contactData.salutation), { waitAfter: 1000 });
      
      await this.fillField(this.formFieldStrategies.firstName, contactData.firstName);
      await this.fillField(this.formFieldStrategies.lastName, contactData.lastName);
      await this.fillField(this.formFieldStrategies.phone, contactData.phone);
      await this.fillField(this.formFieldStrategies.homePhone, contactData.homePhone);
      await this.fillField(this.formFieldStrategies.mobile, contactData.mobile);
      await this.fillField(this.formFieldStrategies.title, contactData.title);
      await this.fillField(this.formFieldStrategies.otherPhone, contactData.otherPhone);
      await this.fillField(this.formFieldStrategies.department, contactData.department);
      await this.fillField(this.formFieldStrategies.fax, contactData.fax);
      
      // Fill email and other fields
      await this.fillField(this.formFieldStrategies.email, contactData.email);
      
      // Click lead source dropdown and select option
      await this.clickElement(this.leadSourceStrategies, { waitAfter: 1000 });
      await this.clickElement(this.salutationOptionStrategies(contactData.leadSource), { waitAfter: 1000 });
      
      // Fill address fields
      await this.fillField(this.formFieldStrategies.mailingStreet, contactData.mailingStreet);
      await this.fillField(this.formFieldStrategies.mailingCity, contactData.mailingCity);
      await this.fillField(this.formFieldStrategies.mailingZip, contactData.mailingZip);
      await this.fillField(this.formFieldStrategies.mailingState, contactData.mailingState);
      await this.fillField(this.formFieldStrategies.mailingCountry, contactData.mailingCountry);
      await this.fillField(this.formFieldStrategies.otherStreet, contactData.otherStreet);
      await this.fillField(this.formFieldStrategies.otherCity, contactData.otherCity);
      await this.fillField(this.formFieldStrategies.otherZip, contactData.otherZip);
      await this.fillField(this.formFieldStrategies.otherState, contactData.otherState);
      await this.fillField(this.formFieldStrategies.otherCountry, contactData.otherCountry);
      
      // Fill languages and description
      await this.fillField(this.formFieldStrategies.languages, contactData.languages);
      await this.fillField(this.formFieldStrategies.description, contactData.description);
      
      // Click level dropdown and select option
      await this.clickElement(this.levelStrategies, { waitAfter: 1000 });
      await this.clickElement(this.salutationOptionStrategies(contactData.level), { waitAfter: 1000 });
      
      // Save the contact
      await this.clickElement(this.saveButtonStrategies, { waitAfter: 2000 });
      await this.waitForNavigation();
    } catch (error) {
      console.error('Error creating contact:', error);
      await this.page.screenshot({ path: 'contact-creation-error.png' });
      throw error;
    }
  }
}

module.exports = ContactPage;