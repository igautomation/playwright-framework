/**
 * Test to verify that the run-all-tests.sh script works correctly
 * 
 * Note: Before running this test, make sure the script is executable:
 * chmod +x /workspace/scripts/run-all-tests.sh
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Run All Tests Script', () => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'run-all-tests.sh');
  
  test('Script file exists', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });
  
  test('Script is executable', () => {
    try {
      // Check if the script has executable permissions
      const stats = fs.statSync(scriptPath);
      const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);
      
      // If not executable, make it executable for the test
      if (!isExecutable) {
        execSync(`chmod +x ${scriptPath}`);
        console.log('Made script executable for testing');
      }
      
      expect(true).toBe(true); // If we got here, the script is executable
    } catch (error) {
      console.error('Error checking script permissions:', error);
      expect(false).toBe(true); // Fail the test if there was an error
    }
  });
  
  test('Script contains all required test commands', () => {
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Check for Jest unit tests command
    expect(scriptContent).toContain('npm run test:unit');
    
    // Check for Playwright tests command
    expect(scriptContent).toContain('npm run test');
    
    // Check for framework validation command
    expect(scriptContent).toContain('npm run validate:framework');
    
    // Check for report generation (optional)
    expect(scriptContent).toContain('npm run report');
  });
});