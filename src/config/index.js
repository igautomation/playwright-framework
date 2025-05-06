/**
 * Configuration loader
 *
 * Loads the appropriate configuration based on the environment
 */
const path = require('path');

// Get environment from NODE_ENV or default to 'dev'
const env = process.env.NODE_ENV || 'dev';

// Load environment-specific configuration
let config;
try {
  config = require(path.join(__dirname, 'env', env));
  console.log(`Loaded configuration for environment: ${env}`);
} catch (error) {
  console.error(`Failed to load configuration for environment: ${env}`);
  console.error('Falling back to dev environment');
  config = require(path.join(__dirname, 'env', 'dev'));
}

module.exports = config;
