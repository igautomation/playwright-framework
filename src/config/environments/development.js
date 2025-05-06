/**
 * Development environment configuration
 */
module.exports = {
  baseUrl: 'https://dev.example.com',
  apiUrl: 'https://dev-api.example.com',
  
  // Authentication
  username: 'devuser',
  password: 'devpassword',
  
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