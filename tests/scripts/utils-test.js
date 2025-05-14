/**
 * Test file for scripts/utils functionality
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Import the xray-integration module
test('xray-integration module exists and can be imported', async () => {
  // Check if the file exists
  const xrayIntegrationPath = path.resolve(process.cwd(), 'scripts/utils/xray-integration.js');
  expect(fs.existsSync(xrayIntegrationPath)).toBeTruthy();
  
  // This is just a check for existence, not functionality since it's an ES module
  // and we're in a CommonJS context
});

// Test env-check.js
test('env-check.js exists and has proper path handling', async () => {
  const envCheckPath = path.resolve(process.cwd(), 'scripts/env-check.js');
  expect(fs.existsSync(envCheckPath)).toBeTruthy();
  
  // Read the file content
  const content = fs.readFileSync(envCheckPath, 'utf8');
  
  // Check for proper path resolution
  expect(content).toContain('path.resolve(process.cwd()');
  
  // Check for security improvements
  expect(content).toContain('safeEnvVars');
});

// Test framework-health-check.js
test('framework-health-check.js exists and has proper error handling', async () => {
  const healthCheckPath = path.resolve(process.cwd(), 'scripts/framework-health-check.js');
  expect(fs.existsSync(healthCheckPath)).toBeTruthy();
  
  // Read the file content
  const content = fs.readFileSync(healthCheckPath, 'utf8');
  
  // Check for logger fallback
  expect(content).toContain('try {');
  expect(content).toContain('logger = {');
  
  // Check for proper path resolution
  expect(content).toContain('path.resolve(process.cwd()');
});