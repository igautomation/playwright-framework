// src/config/globalTeardown.js
async function globalTeardown(config) {
  console.log('Global teardown: Cleaning up...');
  // Perform cleanup (e.g., delete test data, close connections)
  // Example: Delete authentication token
  delete process.env.AUTH_TOKEN;
}

module.exports = globalTeardown;