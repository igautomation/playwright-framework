/**
 * Salesforce Configuration
 * 
 * This file contains configuration for Salesforce tests.
 * For security, sensitive values should be stored in environment variables.
 */
require('dotenv').config();

module.exports = {
  // Salesforce credentials - prefer environment variables
  username: process.env.SALESFORCE_USERNAME || process.env.SF_USERNAME || '',
  password: process.env.SALESFORCE_PASSWORD || process.env.SF_PASSWORD || '',
  securityToken: process.env.SALESFORCE_SECURITY_TOKEN || process.env.SF_SECURITY_TOKEN || '',
  
  // OAuth settings
  clientId: process.env.SALESFORCE_CLIENT_ID || process.env.SF_CLIENT_ID || '',
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET || process.env.SF_CLIENT_SECRET || '',
  
  // API settings
  apiVersion: process.env.SALESFORCE_API_VERSION || process.env.SF_API_VERSION || '57.0',
  loginUrl: process.env.SALESFORCE_LOGIN_URL || process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
  instanceUrl: process.env.SALESFORCE_INSTANCE_URL || process.env.SF_INSTANCE_URL || process.env.SF_URL || '',
  
  // Test data paths
  testDataPaths: {
    account: 'data/salesforce-account-data.json',
    contact: 'src/data/json/salesforce-contact-data.json',
    opportunity: 'data/salesforce-opportunity-data.json',
    lead: 'data/salesforce-lead-data.json'
  },
  
  // Selectors for UI tests
  selectors: {
    login: {
      usernameInput: '#username',
      passwordInput: '#password',
      loginButton: '#Login'
    },
    navigation: {
      appLauncher: '.slds-icon-waffle, button[aria-label*="App Launcher"]',
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
  },
  
  // Timeouts
  timeouts: {
    login: 60000,
    navigation: 30000,
    spinner: 30000,
    form: 10000
  }
};