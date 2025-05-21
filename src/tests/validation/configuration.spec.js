// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Configuration', () => {
const fs = require('fs');
const path = require('path');

/**
 * Validation Test: Configuration
 * Validates that the framework configuration is correct
 */

// Test that playwright.config.js is valid
test('playwright.config.js is valid', async () => {
  const configPath = path.resolve(process.cwd(), 'playwright.config.js');
});

  // Check that the config file exists
  expect(fs.existsSync(configPath)).toBeTruthy();
  
  // Import the config
  const config = require(configPath);
  
  // Validate essential config properties
  expect(config).toHaveProperty('testDir');
  expect(config).toHaveProperty('timeout');
  expect(config).toHaveProperty('use');
  expect(config).toHaveProperty('projects');
  
  // Validate projects configuration
  expect(Array.isArray(config.projects)).toBeTruthy();
  expect(config.projects.length).toBeGreaterThan(0);
  
  // Check that at least one browser is configured
  const browsers = config.projects.map(project => project.use?.browserName).filter(Boolean);
  expect(browsers.length).toBeGreaterThan(0);
});

// Test that package.json has required dependencies
test('package.json has required dependencies', async () => {
  const packagePath = path.resolve(process.cwd(), 'package.json');
  
  // Check that the package.json file exists
  expect(fs.existsSync(packagePath)).toBeTruthy();
  
  // Read and parse package.json
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Check required dependencies
  const requiredDeps = ['@playwright/test'];
  for (const dep of requiredDeps) {
    expect(packageJson.dependencies[dep] || packageJson.devDependencies[dep]).toBeDefined();
  }
  
  // Check that scripts are defined
  expect(packageJson).toHaveProperty('scripts');
  expect(Object.keys(packageJson.scripts).length).toBeGreaterThan(0);
});

// Test that environment variables are properly loaded
test('environment variables are properly loaded', async () => {
  // Check if .env or .env.example exists
  const envPath = path.resolve(process.cwd(), '.env');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  
  const envExists = fs.existsSync(envPath);
  const envExampleExists = fs.existsSync(envExamplePath);
  
  expect(envExists || envExampleExists).toBeTruthy();
  
  // If .env exists, check that it can be loaded
  if (envExists) {
    try {
      require('dotenv').config();
      // If BASE_URL is defined, check that it's a string
      if (process.env.BASE_URL) {
        expect(typeof process.env.BASE_URL).toBe('string');
      }
    } catch (error) {
      // If dotenv is not installed, this is not a failure
      console.log('dotenv not installed, skipping .env loading check');
    }
  }
});
});
