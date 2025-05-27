#!/usr/bin/env node

/**
 * Credential Setup Script
 * 
 * This script helps users set up secure credentials for tests
 */
const { setupCredentials } = require('./src/utils/security/setupCredentials');

// Run the setup
setupCredentials();