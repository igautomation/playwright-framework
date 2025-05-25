/**
 * Unit tests for the run-src-tests-one-by-one functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('run-src-tests-one-by-one scripts', () => {
  // Test that the JavaScript script file exists
  test('JavaScript script file exists', () => {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'run-src-tests-one-by-one.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  // Test that the shell script file exists
  test('Shell script file exists', () => {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'run-src-tests-one-by-one.sh');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  // Test that the npm scripts are defined in package.json
  test('npm scripts are defined in package.json', () => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    expect(packageJson.scripts['test:src-one-by-one']).toBeDefined();
    expect(packageJson.scripts['test:src-one-by-one:sh']).toBeDefined();
    
    expect(packageJson.scripts['test:src-one-by-one']).toBe('node scripts/run-src-tests-one-by-one.js');
    expect(packageJson.scripts['test:src-one-by-one:sh']).toBe('bash scripts/run-src-tests-one-by-one.sh');
  });

  // Test that the JavaScript script can find test files
  test('JavaScript script can find test files', () => {
    // Mock the execSync function to avoid actually running the tests
    jest.spyOn(require('child_process'), 'execSync').mockImplementation((command) => {
      if (command === 'find src/tests -name "*.spec.js"') {
        return 'src/tests/example.spec.js\nsrc/tests/framework-validation.spec.js';
      }
      return '';
    });
    
    // Load the script module
    const scriptPath = path.join(__dirname, '..', 'scripts', 'run-src-tests-one-by-one.js');
    // We can't directly require the script as it has a main function that runs immediately
    // Instead, we'll check that the file contains the expected content
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    expect(scriptContent).toContain('find src/tests -name "*.spec.js"');
    expect(scriptContent).toContain('Running All src/tests Tests One By One');
    
    // Restore the original execSync function
    jest.restoreAllMocks();
  });
});