/**
 * Example local configuration file
 * Copy this file to local.js and modify as needed
 */
module.exports = {
  // Local development settings
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3001/api',
  
  // Test settings
  headless: false,
  slowMo: 50,
  
  // Browser settings
  defaultBrowser: 'chromium',
  
  // Screenshot settings
  screenshotOnFailure: true,
  screenshotPath: './screenshots'
};
