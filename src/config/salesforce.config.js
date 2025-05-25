/**
 * Salesforce Configuration
 * 
 * This file contains configuration for Salesforce tests.
 * For security, sensitive values should be stored in environment variables.
 */

module.exports = {
  // Salesforce credentials - prefer environment variables
  username: process.env.SALESFORCE_USERNAME || '',
  password: process.env.SALESFORCE_PASSWORD || '',
  securityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
  
  // OAuth settings
  clientId: process.env.SALESFORCE_CLIENT_ID || '',
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
  
  // API settings
  apiVersion: process.env.SALESFORCE_API_VERSION || '56.0',
  loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com',
  
  // Test data
  testData: {
    accountName: 'Test Account',
    contactFirstName: 'Test',
    contactLastName: 'Contact',
    opportunityName: 'Test Opportunity',
    leadFirstName: 'Test',
    leadLastName: 'Lead',
    leadCompany: 'Test Company'
  },
  
  // Selectors for UI tests
  selectors: {
    login: {
      usernameInput: '#username',
      passwordInput: '#password',
      loginButton: '#Login'
    },
    navigation: {
      appLauncher: '.slds-icon-waffle',
      accountsTab: 'a[title="Accounts"]',
      contactsTab: 'a[title="Contacts"]',
      leadsTab: 'a[title="Leads"]',
      opportunitiesTab: 'a[title="Opportunities"]'
    },
    actions: {
      newButton: 'div[title="New"], button[title="New"]',
      saveButton: 'button[name="SaveEdit"], button.slds-button_brand[title="Save"]',
      editButton: 'button[name="Edit"], button[title="Edit"]',
      deleteButton: 'button[name="Delete"], button[title="Delete"]'
    },
    forms: {
      accountName: 'input[name="Name"], .accountName input',
      contactFirstName: 'input[name="firstName"], .firstName input',
      contactLastName: 'input[name="lastName"], .lastName input',
      opportunityName: 'input[name="Name"], .opportunityName input',
      opportunityStage: 'input[name="StageName"], .stageName input',
      opportunityCloseDate: 'input[name="CloseDate"], .closeDate input'
    }
  }
};