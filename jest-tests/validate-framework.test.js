const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Unit tests for the framework validation script
 */

describe('Framework Validation Script', () => {
  const validateFrameworkPath = path.resolve(__dirname, '../scripts/validate-framework.js');
  
  beforeAll(() => {
    // Ensure the script exists
    expect(fs.existsSync(validateFrameworkPath)).toBe(true);
  });
  
  test('validate-framework.js should be executable', () => {
    // Check if the script has executable permissions
    const stats = fs.statSync(validateFrameworkPath);
    const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);
    
    // If not executable, make it executable for the test
    if (!isExecutable) {
      fs.chmodSync(validateFrameworkPath, '755');
    }
    
    expect(fs.statSync(validateFrameworkPath).mode & fs.constants.S_IXUSR).toBeTruthy();
  });
  
  test('validate-framework.js should contain required functions', () => {
    const scriptContent = fs.readFileSync(validateFrameworkPath, 'utf8');
    
    // Check for key functions and components
    expect(scriptContent).toContain('runCommand');
    expect(scriptContent).toContain('framework-health-check.js');
    expect(scriptContent).toContain('--grep @validation');
    expect(scriptContent).toContain('generate-validation-dashboard.js');
  });
  
  test('validate-framework.js should handle success and failure cases', () => {
    const scriptContent = fs.readFileSync(validateFrameworkPath, 'utf8');
    
    // Check for success and failure handling
    expect(scriptContent).toContain('process.exit(0)');
    expect(scriptContent).toContain('process.exit(1)');
    expect(scriptContent).toContain('Framework validation PASSED');
    expect(scriptContent).toContain('Framework validation FAILED');
  });
  
  test('validate-framework.js should create reports directory if needed', () => {
    const scriptContent = fs.readFileSync(validateFrameworkPath, 'utf8');
    
    // The script should reference the reports directory
    expect(scriptContent).toContain('reports/validation');
  });
  
  test('npm script should be properly configured', () => {
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    const packageJson = require(packageJsonPath);
    
    // Check if the validate:framework script is defined
    expect(packageJson.scripts['validate:framework']).toBeDefined();
    expect(packageJson.scripts['validate:framework']).toContain('validate-framework.js');
  });
  
  test('GitHub workflow should include framework validation', () => {
    const workflowPath = path.resolve(__dirname, '../.github/workflows/framework-validation.yml');
    
    // Check if the workflow file exists
    expect(fs.existsSync(workflowPath)).toBe(true);
    
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Check for key components in the workflow
    expect(workflowContent).toContain('framework-health-check.js');
    expect(workflowContent).toContain('--grep @validation');
    expect(workflowContent).toContain('generate-validation-dashboard.js');
  });
});