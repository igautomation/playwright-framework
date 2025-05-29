/**
 * Configuration for Salesforce tests
 */
require('dotenv').config();

module.exports = {
  // Credentials
  username: process.env.SF_USERNAME || process.env.SF_USERNAME,
  password: process.env.SF_PASSWORD || process.env.SF_PASSWORD,
  url: process.env.SF_URL || process.env.SF,
  
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