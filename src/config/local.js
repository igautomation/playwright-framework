/**
 * Local configuration file (should be ignored by git)
 */
module.exports = {
  // Local development settings
  baseUrl: 'http://localhost:8080',
  apiUrl: 'http://localhost:8081/api',
  
  // Test settings
  headless: false,
  slowMo: 100,
  
  // Browser settings
  defaultBrowser: 'firefox',
  
  // Screenshot settings
  screenshotOnFailure: true,
  screenshotPath: './my-screenshots'
};
