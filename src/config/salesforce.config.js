/**
 * Salesforce Configuration
 * 
 * This file contains configuration for Salesforce tests.
 * For security, sensitive values should be stored in environment variables.
 */

module.exports = {
  // Salesforce credentials - prefer environment variables
  username: process.env.SF_USERNAME || '',
  password: process.env.SF_PASSWORD || '',
  securityToken: process.env.SF_SECURITY_TOKEN || '',
  
  // OAuth settings
  clientId: process.env.SF_CLIENT_ID || '',
  clientSecret: process.env.SF_CLIENT_SECRET || '',
  
  // API settings
  apiVersion: process.env.SF_API_VERSION || '57.0',
  loginUrl: process.env.SF_URL || 'https://login.salesforce.com',
  instanceUrl: process.env.SF_INSTANCE_URL || '',
  
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