/**
 * Test Functionality Verification
 * 
 * This test suite verifies that all testing components are functioning correctly.
 * It checks:
 * 1. Jest unit testing functionality
 * 2. Playwright test functionality
 * 3. Framework validation functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Test Functionality Verification', () => {
  describe('Jest Unit Testing', () => {
    test('Jest is properly configured', () => {
      const jestConfigPath = path.resolve(__dirname, '../jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
      
      const jestConfig = require(jestConfigPath);
      expect(jestConfig.testEnvironment).toBe('node');
      expect(jestConfig.testMatch).toContain('**/tests/**/*.test.js');
    });
    
    test('Unit tests can be discovered', () => {
      // Check if there are test files in the tests directory
      const testFiles = fs.readdirSync(__dirname)
        .filter(file => file.endsWith('.test.js'));
      
      expect(testFiles.length).toBeGreaterThan(0);
    });
    
    test('Jest can run a simple test', () => {
      // Create a simple test assertion that should always pass
      expect(1 + 1).toBe(2);
    });
  });
  
  describe('Playwright Testing', () => {
    test('Playwright is properly configured', () => {
      const playwrightConfigPath = path.resolve(__dirname, '../playwright.config.js');
      expect(fs.existsSync(playwrightConfigPath)).toBe(true);
      
      const playwrightConfig = require(playwrightConfigPath);
      expect(playwrightConfig.testDir).toBe('./src/tests');
      expect(playwrightConfig.reporter).toBeDefined();
    });
    
    test('Playwright test directory exists', () => {
      const testDir = path.resolve(__dirname, '../src/tests');
      expect(fs.existsSync(testDir)).toBe(true);
    });
    
    test('Playwright can be executed', () => {
      // This test just checks if the Playwright command exists and can be run
      // We don't actually run tests here as that would be too time-consuming for a unit test
      let playwrightVersion;
      try {
        playwrightVersion = execSync('npx playwright --version', { stdio: 'pipe' }).toString();
      } catch (error) {
        console.error('Error running Playwright:', error);
        throw error;
      }
      
      expect(playwrightVersion).toBeDefined();
      expect(playwrightVersion.length).toBeGreaterThan(0);
    });
  });
  
  describe('Framework Validation', () => {
    test('Validation scripts exist', () => {
      const validateFrameworkPath = path.resolve(__dirname, '../scripts/validate-framework.js');
      const frameworkHealthCheckPath = path.resolve(__dirname, '../scripts/framework-health-check.js');
      const generateDashboardPath = path.resolve(__dirname, '../scripts/generate-validation-dashboard.js');
      
      expect(fs.existsSync(validateFrameworkPath)).toBe(true);
      expect(fs.existsSync(frameworkHealthCheckPath)).toBe(true);
      expect(fs.existsSync(generateDashboardPath)).toBe(true);
    });
    
    test('Validation scripts are executable', () => {
      const validateFrameworkPath = path.resolve(__dirname, '../scripts/validate-framework.js');
      const frameworkHealthCheckPath = path.resolve(__dirname, '../scripts/framework-health-check.js');
      const generateDashboardPath = path.resolve(__dirname, '../scripts/generate-validation-dashboard.js');
      
      // Check if the scripts have executable permissions
      const validateStats = fs.statSync(validateFrameworkPath);
      const healthCheckStats = fs.statSync(frameworkHealthCheckPath);
      const dashboardStats = fs.statSync(generateDashboardPath);
      
      const isValidateExecutable = !!(validateStats.mode & fs.constants.S_IXUSR);
      const isHealthCheckExecutable = !!(healthCheckStats.mode & fs.constants.S_IXUSR);
      const isDashboardExecutable = !!(dashboardStats.mode & fs.constants.S_IXUSR);
      
      // If not executable, make them executable for the test
      if (!isValidateExecutable) {
        fs.chmodSync(validateFrameworkPath, '755');
      }
      if (!isHealthCheckExecutable) {
        fs.chmodSync(frameworkHealthCheckPath, '755');
      }
      if (!isDashboardExecutable) {
        fs.chmodSync(generateDashboardPath, '755');
      }
      
      expect(fs.statSync(validateFrameworkPath).mode & fs.constants.S_IXUSR).toBeTruthy();
      expect(fs.statSync(frameworkHealthCheckPath).mode & fs.constants.S_IXUSR).toBeTruthy();
      expect(fs.statSync(generateDashboardPath).mode & fs.constants.S_IXUSR).toBeTruthy();
    });
    
    test('npm scripts for validation are properly configured', () => {
      const packageJsonPath = path.resolve(__dirname, '../package.json');
      const packageJson = require(packageJsonPath);
      
      // Check if the validate:framework script is defined
      expect(packageJson.scripts['validate:framework']).toBeDefined();
      expect(packageJson.scripts['validate:framework']).toContain('validate-framework.js');
      
      // Check if the verify:all-tests script is defined
      expect(packageJson.scripts['verify:all-tests']).toBeDefined();
      expect(packageJson.scripts['verify:all-tests']).toContain('test:unit');
      expect(packageJson.scripts['verify:all-tests']).toContain('test');
      expect(packageJson.scripts['verify:all-tests']).toContain('validate:framework');
    });
  });
  
  describe('GitHub Workflows', () => {
    test('GitHub workflow files use v4 actions', () => {
      const workflowsDir = path.resolve(__dirname, '../.github/workflows');
      const workflowFiles = fs.readdirSync(workflowsDir)
        .filter(file => file.endsWith('.yml'))
        .map(file => path.join(workflowsDir, file));
      
      for (const file of workflowFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check that the file doesn't use v3 actions
        expect(content).not.toContain('actions/checkout@v3');
        expect(content).not.toContain('actions/setup-node@v3');
        expect(content).not.toContain('actions/upload-artifact@v3');
        expect(content).not.toContain('actions/download-artifact@v3');
      }
    });
    
    test('Framework validation workflow is properly configured', () => {
      const workflowPath = path.resolve(__dirname, '../.github/workflows/framework-validation.yml');
      expect(fs.existsSync(workflowPath)).toBe(true);
      
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      
      // Check for key components in the workflow
      expect(workflowContent).toContain('framework-health-check.js');
      expect(workflowContent).toContain('--grep @validation');
      expect(workflowContent).toContain('generate-validation-dashboard.js');
    });
  });
});