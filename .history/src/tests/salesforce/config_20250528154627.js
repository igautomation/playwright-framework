/**
 * Configuration for Salesforce tests
 */
require('dotenv').config();

module.exports = {
  // Credentials
  username: process.env.SF_USERNAME || process.env.SALESFORCE_USERNAME,
  password: process.env.SF_PASSWORD || process.env.SALESFORCE_PASSWORD,
  url: process.env.SF_URL || process.env.SALESFORCE_URL,
  
  // Test data paths
  testDataPaths: {
    account: 'src/data/json/salesforce-account-data.json',
    contact: 'src/data/json/salesforce-contact-data.json'
  },
  
  // Timeouts
  timeouts: {
    login: 30000,
    navigation: 15000,
    form: 10000
  }
};