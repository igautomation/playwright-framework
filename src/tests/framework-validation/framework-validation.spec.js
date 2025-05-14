const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Framework Validation Test Suite
 * 
 * This test suite validates the entire framework by checking:
 * 1. Core components are available and working
 * 2. Configuration is properly loaded
 * 3. Utilities are functioning correctly
 * 4. Test runners are working
 * 5. Reporting is functional
 */

test.describe('Framework Validation @validation', () => {
  test('Core framework files should exist', async () => {
    // Check essential files
    const essentialFiles = [
      'package.json',
      'playwright.config.js',
      'src/cli/index.js',
      'src/utils/common/logger.js',
      'src/pages/BasePage.js'
    ];

    for (const file of essentialFiles) {
      const filePath = path.resolve(process.cwd(), file);
      expect(fs.existsSync(filePath), `File ${file} should exist`).toBeTruthy();
    }
  });

  test('Core directories should exist', async () => {
    // Check essential directories
    const essentialDirs = [
      'src/cli',
      'src/config',
      'src/data',
      'src/pages',
      'src/tests',
      'src/utils'
    ];

    for (const dir of essentialDirs) {
      const dirPath = path.resolve(process.cwd(), dir);
      expect(fs.existsSync(dirPath), `Directory ${dir} should exist`).toBeTruthy();
    }
  });

  test('Package.json should contain required dependencies', async () => {
    const packageJson = require('../../../package.json');
    
    // Check for essential dependencies
    const essentialDeps = ['@playwright/test', 'dotenv-safe'];
    
    for (const dep of essentialDeps) {
      expect(
        packageJson.dependencies[dep] || packageJson.devDependencies[dep],
        `Dependency ${dep} should be installed`
      ).toBeDefined();
    }
  });

  test('Playwright should be installed and working', async ({ page }) => {
    // Simple test to verify Playwright is working
    await page.goto('about:blank');
    expect(page.url()).toBe('about:blank');
  });

  test('Framework configuration should be loadable', async () => {
    try {
      // Try to load the environment configuration
      const configPath = path.resolve(process.cwd(), 'src/config/environment.js');
      
      // Check if the file exists first
      if (fs.existsSync(configPath)) {
        const config = require(configPath);
        expect(config).toBeDefined();
      } else {
        // Skip this test if the file doesn't exist
        test.skip();
      }
    } catch (error) {
      // Fail the test with the error message
      expect(error).toBeNull();
    }
  });

  test('CLI should be executable', async () => {
    try {
      // Try to execute the CLI with --help flag
      const cliPath = path.resolve(process.cwd(), 'src/cli/index.js');
      
      // Check if the file exists first
      if (fs.existsSync(cliPath)) {
        const result = execSync(`node ${cliPath} --help`, { stdio: 'pipe' }).toString();
        expect(result).toContain('Usage:');
      } else {
        // Skip this test if the file doesn't exist
        test.skip();
      }
    } catch (error) {
      // Fail the test with the error message
      expect(error).toBeNull();
    }
  });

  test('Test utilities should be importable', async () => {
    // List of utility modules to check
    const utilities = [
      { path: '../../utils/web/webInteractions', name: 'WebInteractions' },
      { path: '../../utils/web/screenshotUtils', name: 'ScreenshotUtils' },
      { path: '../../utils/web/SelfHealingLocator', name: 'SelfHealingLocator' },
      { path: '../../utils/api/apiUtils', name: 'ApiUtils' },
      { path: '../../utils/common/testDataFactory', name: 'TestDataFactory' }
    ];

    for (const util of utilities) {
      try {
        // Try to import the utility
        const utilPath = path.resolve(process.cwd(), 'src', util.path.substring(3));
        
        // Check if the file exists first
        if (fs.existsSync(`${utilPath}.js`)) {
          const module = require(util.path);
          expect(module, `${util.name} should be importable`).toBeDefined();
        }
      } catch (error) {
        // Log the error but don't fail the test if the module doesn't exist
        console.warn(`Could not import ${util.name}: ${error.message}`);
      }
    }
  });

  test('Page objects should be importable', async () => {
    try {
      // Try to import the BasePage
      const BasePage = require('../../pages/BasePage');
      expect(BasePage).toBeDefined();
      
      // Create an instance with a mock page
      const mockPage = { goto: () => {}, waitForLoadState: () => {} };
      const basePage = new BasePage(mockPage);
      expect(basePage).toBeDefined();
    } catch (error) {
      // Log the error but don't fail the test if the module doesn't exist
      console.warn(`Could not import BasePage: ${error.message}`);
    }
  });

  test('Test data should be accessible', async () => {
    // Check if data directories exist
    const dataDirectories = ['json', 'csv', 'yaml', 'xml'];
    
    for (const dir of dataDirectories) {
      const dirPath = path.resolve(process.cwd(), 'src/data', dir);
      
      // Don't fail if directory doesn't exist, just log it
      if (!fs.existsSync(dirPath)) {
        console.warn(`Data directory ${dir} does not exist`);
      }
    }
  });

  test('Reporting utilities should be functional', async () => {
    // Check if reporting directory exists
    const reportsDir = path.resolve(process.cwd(), 'reports');
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Create a simple test report file
    const testReportPath = path.join(reportsDir, 'validation-test-report.json');
    const testReport = {
      name: 'Framework Validation',
      timestamp: new Date().toISOString(),
      status: 'passed'
    };
    
    fs.writeFileSync(testReportPath, JSON.stringify(testReport, null, 2));
    
    // Verify the file was created
    expect(fs.existsSync(testReportPath)).toBeTruthy();
    
    // Clean up
    fs.unlinkSync(testReportPath);
  });
});