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

/**
 * SAMPLE TEST APPLICATIONS:
 * - Web UI: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 * - API: https://reqres.in/
 */
module.exports = {
  baseUrl: getEnv('BASE_URL', 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login'),
  apiUrl: getEnv('API_URL', 'https://reqres.in/api'),
  username: getEnv('USERNAME', 'Admin'),
  password: getEnv('PASSWORD', 'admin123'),
  isCI: getEnv('CI', 'false') === 'true',
  environment: getEnv('NODE_ENV', 'development'),
  getEnv
};