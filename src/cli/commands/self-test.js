/**
 * Self-test command for the CLI
 *
 * This command runs a self-test to verify the framework is working correctly
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../../utils/common/logger');

/**
 * Run a self-test to verify the framework is working correctly
 */
module.exports = () => {
  try {
    logger.info('Running framework self-test...');

    // Create a temporary test file
    const testDir = path.join(process.cwd(), 'src/tests/temp');
    const testFile = path.join(testDir, 'self-test.spec.js');
    
    // Ensure the directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Create a simple test file
    const testContent = `
      const { test, expect } = require('@playwright/test');
      
      test('Framework self-test', async ({ page }) => {
        // Simple test to validate framework
        await page.goto('about:blank');
        expect(true).toBeTruthy();
      });
    `;
    
    fs.writeFileSync(testFile, testContent);
    
    // Run the test
    logger.info('Running self-test...');
    execSync('npx playwright test src/tests/temp/self-test.spec.js --reporter=list', { 
      stdio: 'inherit' 
    });
    
    // Clean up
    fs.unlinkSync(testFile);
    
    logger.info('Self-test completed successfully');
  } catch (error) {
    logger.error('Self-test failed:', error.message || error);
    process.exit(1);
  }
};