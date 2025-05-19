#!/usr/bin/env node

/**
 * Script to set up accessibility testing in the framework
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up accessibility testing...');

// Install required dependencies
console.log('Installing dependencies...');
execSync('npm install --save-dev axe-playwright', { stdio: 'inherit' });

// Create accessibility utility file
const accessibilityUtilPath = path.resolve(
  __dirname,
  '../src/utils/web/accessibilityUtils.js'
);

const accessibilityUtilContent = `const { AxeBuilder } = require('axe-playwright');
const logger = require('../common/logger');

/**
 * Accessibility Utilities class for accessibility testing
 */
class AccessibilityUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Run accessibility scan on the current page
   * @param {Object} options - Scan options
   * @returns {Promise<Object>} Accessibility scan results
   */
  async scan(options = {}) {
    try {
      logger.info('Running accessibility scan');
      
      // Create AxeBuilder instance
      const axeBuilder = new AxeBuilder({ page: this.page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(['color-contrast']); // Disable color contrast rule by default
      
      // Apply options
      if (options.includedRules) {
        axeBuilder.withRules(options.includedRules);
      }
      
      if (options.excludedRules) {
        axeBuilder.disableRules(options.excludedRules);
      }
      
      if (options.selector) {
        axeBuilder.include(options.selector);
      }
      
      // Run the scan
      const results = await axeBuilder.analyze();
      
      logger.info(\`Accessibility scan completed with \${results.violations.length} violations\`);
      
      return results;
    } catch (error) {
      logger.error('Failed to run accessibility scan', error);
      throw error;
    }
  }

  /**
   * Check if the page has accessibility violations
   * @param {Object} options - Scan options
   * @returns {Promise<boolean>} Whether the page has violations
   */
  async hasViolations(options = {}) {
    const results = await this.scan(options);
    return results.violations.length > 0;
  }

  /**
   * Get accessibility violations
   * @param {Object} options - Scan options
   * @returns {Promise<Array>} Accessibility violations
   */
  async getViolations(options = {}) {
    const results = await this.scan(options);
    return results.violations;
  }

  /**
   * Generate accessibility report
   * @param {Object} options - Scan options
   * @returns {Promise<string>} Path to the report
   */
  async generateReport(options = {}) {
    try {
      const results = await this.scan(options);
      
      // Create report directory if it doesn't exist
      const reportDir = path.resolve(process.cwd(), 'reports/accessibility');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Generate report filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reportDir, \`accessibility-report-\${timestamp}.json\`);
      
      // Write report to file
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      
      logger.info(\`Accessibility report generated at \${reportPath}\`);
      
      return reportPath;
    } catch (error) {
      logger.error('Failed to generate accessibility report', error);
      throw error;
    }
  }
}

module.exports = AccessibilityUtils;`;

// Write the file
fs.writeFileSync(accessibilityUtilPath, accessibilityUtilContent);
console.log(`Created accessibility utility at: ${accessibilityUtilPath}`);

// Create example accessibility test
const accessibilityTestPath = path.resolve(
  __dirname,
  '../src/tests/ui/accessibility/basic.spec.js'
);

// Create directory if it doesn't exist
const accessibilityTestDir = path.dirname(accessibilityTestPath);
if (!fs.existsSync(accessibilityTestDir)) {
  fs.mkdirSync(accessibilityTestDir, { recursive: true });
}

const accessibilityTestContent = `const { test, expect } = require('@playwright/test');
const AccessibilityUtils = require('../../../utils/web/accessibilityUtils');

test.describe('Accessibility Testing @accessibility', () => {
  test('Homepage should not have accessibility violations @p1', async ({ page }) => {
    // Navigate to the homepage
    await page.goto(process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    
    // Create accessibility utils instance
    const accessibilityUtils = new AccessibilityUtils(page);
    
    // Run accessibility scan
    const violations = await accessibilityUtils.getViolations();
    
    // Log violations for debugging
    if (violations.length > 0) {
      console.log('Accessibility violations:', violations);
    }
    
    // Assert no violations
    expect(violations.length).toBe(0);
  });
  
  test('Login page should be accessible @p1', async ({ page }) => {
    // Navigate to the login page
    await page.goto(process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    
    // Create accessibility utils instance
    const accessibilityUtils = new AccessibilityUtils(page);
    
    // Generate accessibility report
    await accessibilityUtils.generateReport();
    
    // Check for critical violations only
    const criticalViolations = await accessibilityUtils.getViolations({
      includedRules: ['critical']
    });
    
    // Assert no critical violations
    expect(criticalViolations.length).toBe(0);
  });
});`;

// Write the file
fs.writeFileSync(accessibilityTestPath, accessibilityTestContent);
console.log(`Created example accessibility test at: ${accessibilityTestPath}`);

// Update package.json to add accessibility test script
try {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = require(packageJsonPath);

  if (!packageJson.scripts['test:accessibility']) {
    packageJson.scripts['test:accessibility'] =
      'node src/cli/index.js test --tags @accessibility';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Added accessibility test script to package.json');
  }
} catch (error) {
  console.error('Failed to update package.json:', error);
}

console.log('Accessibility testing setup complete!');
console.log('Run accessibility tests with: npm run test:accessibility');
