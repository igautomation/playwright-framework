// env-check.js

// Import dotenv-safe to load environment variables
const { config: loadEnv } = require('dotenv-safe');
const path = require('path');

// Load environment variables
// - Uses `NODE_ENV` to determine which environment file to load
// - Maps 'development' to 'dev.env' to match the file naming convention
// - Falls back to `.env.example` for validation of required variables
const env = process.env.NODE_ENV || 'development';
const envFileName = env === 'development' ? 'dev' : env;

try {
  // Load environment variables from the corresponding env file
  loadEnv({
    allowEmptyValues: true,
    example: '.env.example',
    path: path.resolve(process.cwd(), `src/config/env/${envFileName}.env`)
  });

  // Fallback load to revalidate against .env.example even if other file loads
  loadEnv({
    allowEmptyValues: true,
    example: '.env.example'
  });
  
  console.log(`Environment variables loaded from ${envFileName}.env`);
} catch (error) {
  // Exit script if validation fails
  console.error(`Failed to load environment variables: ${error.message}`);
  process.exit(1);
}

// Log environment variables for debugging (excluding sensitive ones)
const safeEnvVars = { ...process.env };
// Remove sensitive variables from log
['PASSWORD', 'SECRET', 'TOKEN', 'KEY', 'AUTH'].forEach(pattern => {
  Object.keys(safeEnvVars).forEach(key => {
    if (key.toUpperCase().includes(pattern)) {
      safeEnvVars[key] = '******';
    }
  });
});

console.log('Environment Variables loaded successfully');
