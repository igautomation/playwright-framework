/**
 * Test Verification Unit Tests
 * 
 * This test suite verifies that the test verification functionality works correctly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Test Verification', () => {
  describe('CLI Commands', () => {
    test('verify-tests command is properly configured', () => {
      const cliIndexPath = path.resolve(__dirname, '../src/cli/index.js');
      expect(fs.existsSync(cliIndexPath)).toBe(true);
      
      const cliIndexContent = fs.readFileSync(cliIndexPath, 'utf8');
      
      // Check if the verify-tests command is defined with the right options
      expect(cliIndexContent).toContain('verify-tests');
      expect(cliIndexContent).toContain('--dir <directory>');
      expect(cliIndexContent).toContain('--pattern <pattern>');
      expect(cliIndexContent).toContain('--ignore-errors');
      expect(cliIndexContent).toContain('--generate-report');
      expect(cliIndexContent).toContain('--verbose');
    });
    
    test('verify-all-tests command is properly configured', () => {
      const cliIndexPath = path.resolve(__dirname, '../src/cli/index.js');
      expect(fs.existsSync(cliIndexPath)).toBe(true);
      
      const cliIndexContent = fs.readFileSync(cliIndexPath, 'utf8');
      
      // Check if the verify-all-tests command is defined with the right options
      expect(cliIndexContent).toContain('verify-all-tests');
      expect(cliIndexContent).toContain('--verbose');
      expect(cliIndexContent).toContain('--generate-report');
      expect(cliIndexContent).toContain('--ignore-errors');
    });
  });
  
  describe('Verify Tests Implementation', () => {
    test('verify-tests.js exists and has required functions', () => {
      const verifyTestsPath = path.resolve(__dirname, '../src/cli/commands/verify-tests.js');
      expect(fs.existsSync(verifyTestsPath)).toBe(true);
      
      const verifyTestsContent = fs.readFileSync(verifyTestsPath, 'utf8');
      
      // Check for key functions
      expect(verifyTestsContent).toContain('function verifyTestFile');
      expect(verifyTestsContent).toContain('function performBasicChecks');
      expect(verifyTestsContent).toContain('function performAdvancedChecks');
      expect(verifyTestsContent).toContain('function getLineNumber');
      expect(verifyTestsContent).toContain('function printVerificationSummary');
      expect(verifyTestsContent).toContain('function generateHtmlReport');
    });
    
    test('verify-all-tests.js exists and has required functions', () => {
      const verifyAllTestsPath = path.resolve(__dirname, '../src/cli/commands/verify-all-tests.js');
      expect(fs.existsSync(verifyAllTestsPath)).toBe(true);
      
      const verifyAllTestsContent = fs.readFileSync(verifyAllTestsPath, 'utf8');
      
      // Check for key functions
      expect(verifyAllTestsContent).toContain('function generateSummaryReport');
      expect(verifyAllTestsContent).toContain('function generateHtmlReport');
      
      // Check for key components
      expect(verifyAllTestsContent).toContain('testVerification');
      expect(verifyAllTestsContent).toContain('unitTests');
      expect(verifyAllTestsContent).toContain('playwrightTests');
      expect(verifyAllTestsContent).toContain('frameworkValidation');
    });
  });
  
  describe('GitHub Workflows', () => {
    test('verify-all-tests.yml is properly configured', () => {
      const workflowPath = path.resolve(__dirname, '../.github/workflows/verify-all-tests.yml');
      expect(fs.existsSync(workflowPath)).toBe(true);
      
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      
      // Check for key components
      expect(workflowContent).toContain('npm run test:verify');
      expect(workflowContent).toContain('--generate-report');
      expect(workflowContent).toContain('upload-artifact');
      expect(workflowContent).toContain('reports/');
    });
  });
  
  describe('npm Scripts', () => {
    test('npm scripts for test verification are properly configured', () => {
      const packageJsonPath = path.resolve(__dirname, '../package.json');
      const packageJson = require(packageJsonPath);
      
      // Check if the test:verify script is defined
      expect(packageJson.scripts['test:verify']).toBeDefined();
      expect(packageJson.scripts['test:verify']).toContain('verify-all-tests');
      
      // Check if the verify script is defined
      expect(packageJson.scripts['verify']).toBeDefined();
      expect(packageJson.scripts['verify']).toContain('verify-tests');
    });
  });
});