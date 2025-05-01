// env-check.js

// Import dotenv-safe to load environment variables
const { config: loadEnv } = require('dotenv-safe');

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
    path: `src/config/env/${envFileName}.env`
  });

  // Fallback load to revalidate against .env.example even if other file loads
  loadEnv({
    allowEmptyValues: true,
    example: '.env.example'
  });
} catch (error) {
  // Exit script if validation fails
  console.error(`Failed to load environment variables: ${error.message}`);
  process.exit(1);
}

// Log all environment variables to verify they are loaded correctly
console.log('Environment Variables:', process.env);
