/**
 * Development environment configuration
 * 
 * SAMPLE TEST APPLICATIONS:
 * - Web UI: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 * - API: https://reqres.in/
 */
module.exports = {
  baseUrl: 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
  apiUrl: 'https://reqres.in/api',
  
  // Authentication
  username: 'Admin',
  password: 'admin123',
  
  // Timeouts
  defaultTimeout: 30000,
  shortTimeout: 10000,
  longTimeout: 60000,
  
  // Visual testing
  visualThreshold: 0.2, // More permissive threshold for development
  
  // Browser configuration
  headless: false, // Show browser in development
  slowMo: 50, // Slow down operations for better visibility during development
};