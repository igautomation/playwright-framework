/**
 * Environment Configuration
 * 
 * Loads environment variables from .env file
 */
require('dotenv').config();

/**
 * Get environment variable
 * @param {string} name - Environment variable name
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Environment variable value
 */
function getEnv(name, defaultValue = '') {
  return process.env[name] || defaultValue;
}

module.exports = {
  baseUrl: getEnv('BASE_URL', 'https://demo.playwright.dev'),
  apiUrl: getEnv('API_URL', 'https://reqres.in/api'),
  username: getEnv('USERNAME', 'test_user'),
  password: getEnv('PASSWORD', 'test_password'),
  isCI: getEnv('CI', 'false') === 'true',
  environment: getEnv('NODE_ENV', 'development'),
  getEnv
};