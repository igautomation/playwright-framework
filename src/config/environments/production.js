/**
 * Production environment configuration
 */
module.exports = {
  baseUrl: 'https://example.com',
  apiUrl: 'https://api.example.com',
  
  // Authentication
  // Credentials should be provided via environment variables in production
  
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