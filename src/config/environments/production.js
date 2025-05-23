/**
 * Production environment configuration
 * 
 * SAMPLE TEST APPLICATIONS:
 * - Web UI: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 * - API: https://reqres.in/
 */
module.exports = {
  baseUrl: 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
  apiUrl: 'https://reqres.in/api',
  
  // Authentication
  username: process.env.PROD_USERNAME || 'Admin',
  password: process.env.PROD_PASSWORD || 'admin123',
  
  // Timeouts
  defaultTimeout: 45000, // Longer timeouts for production
  shortTimeout: 15000,
  longTimeout: 90000,
  
  // Visual testing
  visualThreshold: 0.05, // Stricter threshold for production
  
  // Browser configuration
  headless: true, // Always run headless in production
  slowMo: 0, // No slowdown in production
};