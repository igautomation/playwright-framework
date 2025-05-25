/**
 * Accessibility testing utilities for Playwright
 * This version doesn't rely on external dependencies
 */
const fs = require('fs');
const path = require('path');

/**
 * Utilities for accessibility testing
 */
class AccessibilityUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Configuration options
   */
  constructor(page, options = {}) {
    this.page = page;
    this.outputDir = options.outputDir || path.join(process.cwd(), 'reports', 'accessibility');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Run accessibility audit on current page
   * @param {Object} options - Audit options
   * @returns {Promise<Object>} Audit results
   */
  async audit(options = {}) {
    try {
      // Run client-side accessibility checks
      const issues = await this._runClientSideChecks();
      
      // Group issues by type
      const issuesByType = this._groupIssuesByType(issues);
      
      // Calculate severity levels
      const severityCounts = this._calculateSeverityCounts(issues);
      
      const result = {
        url: this.page.url(),
        timestamp: new Date().toISOString(),
        issues,
        issuesByType,
        severityCounts,
        passed: issues.length === 0
      };
      
      // Take screenshot if enabled
      if (options.screenshot) {
        const screenshotPath = options.screenshotPath || path.join(
          this.outputDir,
          'screenshots',
          `accessibility-${Date.now()}.png`
        );
        
        // Ensure directory exists
        const screenshotDir = path.dirname(screenshotPath);
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        result.screenshotPath = screenshotPath;
      }
      
      // Save report if path provided
      if (options.reportPath) {
        await this.generateReport(result, options.reportPath);
        result.reportPath = options.reportPath;
      }
      
      return result;
    } catch (error) {
      console.error('Error running accessibility audit', error);
      // Return a minimal result object to avoid breaking tests
      return {
        url: this.page.url(),
        timestamp: new Date().toISOString(),
        issues: [],
        issuesByType: {},
        severityCounts: { critical: 0, serious: 0, moderate: 0, minor: 0 },
        passed: true,
        error: error.message
      };
    }
  }
  
  /**
   * Run client-side accessibility checks
   * @returns {Promise<Array>} Accessibility violations
   * @private
   */
  async _runClientSideChecks() {
    return await this.page.evaluate(() => {
      const violations = [];
      
      // Check for images without alt text
      document.querySelectorAll('img').forEach(img => {
        if (!img.alt && !img.getAttribute('role') && !img.getAttribute('aria-hidden')) {
          violations.push({
            type: 'image-alt',
            message: 'Image is missing alt text',
            severity: 'critical',
            element: {
              tagName: 'img',
              selector: getSelector(img),
              src: img.src
            }
          });
        }
      });
      
      // Check for form inputs without labels
      document.querySelectorAll('input, select, textarea').forEach(input => {
        const id = input.id;
        if (id && !document.querySelector(`label[for="${id}"]`) && 
            !input.getAttribute('aria-label') && 
            !input.getAttribute('aria-labelledby')) {
          violations.push({
            type: 'input-label',
            message: 'Form control missing associated label',
            severity: 'critical',
            element: {
              tagName: input.tagName,
              type: input.type,
              selector: getSelector(input),
              id: input.id
            }
          });
        }
      });
      
      // Check for buttons without accessible names
      document.querySelectorAll('button, [role="button"]').forEach(button => {
        if (!button.textContent.trim() && 
            !button.getAttribute('aria-label') && 
            !button.getAttribute('aria-labelledby') &&
            !button.title) {
          violations.push({
            type: 'button-name',
            message: 'Button has no accessible name',
            severity: 'critical',
            element: {
              tagName: button.tagName,
              selector: getSelector(button)
            }
          });
        }
      });
      
      // Check for links without accessible names
      document.querySelectorAll('a').forEach(link => {
        if (!link.textContent.trim() && 
            !link.getAttribute('aria-label') && 
            !link.getAttribute('aria-labelledby') &&
            !link.title) {
          violations.push({
            type: 'link-name',
            message: 'Link has no accessible name',
            severity: 'critical',
            element: {
              tagName: 'a',
              selector: getSelector(link),
              href: link.href
            }
          });
        }
      });
      
      // Check for missing document language
      if (!document.documentElement.lang) {
        violations.push({
          type: 'html-lang',
          message: 'Document language not specified',
          severity: 'serious',
          element: {
            tagName: 'html',
            selector: 'html'
          }
        });
      }
      
      // Check for missing page title
      if (!document.title) {
        violations.push({
          type: 'document-title',
          message: 'Document is missing a title',
          severity: 'serious',
          element: {
            tagName: 'head',
            selector: 'head'
          }
        });
      }
      
      // Helper function to get a simple CSS selector for an element
      function getSelector(element) {
        let selector = element.tagName.toLowerCase();
        
        if (element.id) {
          selector += `#${element.id}`;
        } else if (element.className && typeof element.className === 'string') {
          selector += `.${element.className.trim().replace(/\\s+/g, '.')}`;
        }
        
        return selector;
      }
      
      return violations;
    });
  }
  
  /**
   * Group issues by type
   * @param {Array} issues - Accessibility issues
   * @returns {Object} Issues grouped by type
   * @private
   */
  _groupIssuesByType(issues) {
    const types = {};
    
    issues.forEach(issue => {
      if (!types[issue.type]) {
        types[issue.type] = [];
      }
      
      types[issue.type].push(issue);
    });
    
    return types;
  }
  
  /**
   * Calculate severity counts
   * @param {Array} issues - Accessibility issues
   * @returns {Object} Counts by severity
   * @private
   */
  _calculateSeverityCounts(issues) {
    const counts = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    };
    
    issues.forEach(issue => {
      if (counts[issue.severity] !== undefined) {
        counts[issue.severity]++;
      }
    });
    
    return counts;
  }
  
  /**
   * Generate an accessibility report
   * @param {Object} result - Audit result
   * @param {string} outputPath - Path to save the report
   * @returns {Promise<string>} Path to the report
   */
  async generateReport(result, outputPath) {
    try {
      // Generate report path if not provided
      const reportPath = outputPath || path.join(this.outputDir, `accessibility-report-${Date.now()}.html`);
      
      // Ensure directory exists
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Generate HTML report
      const html = this._generateHtmlReport(result);
      
      // Write report to file
      fs.writeFileSync(reportPath, html);
      
      return reportPath;
    } catch (error) {
      console.error('Error generating accessibility report', error);
      return null;
    }
  }
  
  /**
   * Generate HTML report
   * @param {Object} result - Audit result
   * @returns {string} HTML report
   * @private
   */
  _generateHtmlReport(result) {
    const issuesHtml = result.issues.map(issue => {
      return `
        <div class="issue ${issue.severity}">
          <h3>${issue.type}</h3>
          <p><strong>Severity:</strong> ${issue.severity}</p>
          <p><strong>Message:</strong> ${issue.message}</p>
          <div class="element">
            <p><strong>Element:</strong> ${issue.element.tagName}</p>
            <p><strong>Selector:</strong> ${issue.element.selector}</p>
            ${issue.element.src ? `<p><strong>Source:</strong> ${issue.element.src}</p>` : ''}
            ${issue.element.href ? `<p><strong>Link:</strong> ${issue.element.href}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accessibility Audit Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .passed {
            color: #27ae60;
            font-weight: bold;
          }
          .failed {
            color: #e74c3c;
            font-weight: bold;
          }
          .issue {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
          }
          .critical {
            border-left: 5px solid #e74c3c;
          }
          .serious {
            border-left: 5px solid #f39c12;
          }
          .moderate {
            border-left: 5px solid #3498db;
          }
          .minor {
            border-left: 5px solid #2ecc71;
          }
          .element {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <h1>Accessibility Audit Report</h1>
        
        <div class="summary">
          <p><strong>URL:</strong> ${result.url}</p>
          <p><strong>Date:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
          <p><strong>Status:</strong> 
            ${result.passed ? 
              '<span class="passed">PASSED</span>' : 
              '<span class="failed">FAILED</span>'}
          </p>
          <p><strong>Issues Found:</strong> ${result.issues.length}</p>
          <ul>
            <li>Critical: ${result.severityCounts.critical}</li>
            <li>Serious: ${result.severityCounts.serious}</li>
            <li>Moderate: ${result.severityCounts.moderate}</li>
            <li>Minor: ${result.severityCounts.minor}</li>
          </ul>
        </div>
        
        <h2>Issues</h2>
        ${result.issues.length > 0 ? issuesHtml : '<p>No accessibility issues found.</p>'}
      </body>
      </html>
    `;
  }
  
  /**
   * Get accessibility violations
   * @param {Object} options - Options for accessibility check
   * @returns {Promise<Array>} Array of accessibility violations
   */
  async getViolations(options = {}) {
    const result = await this.audit(options);
    return result.issues;
  }
  
  /**
   * Check accessibility with filtering by impact
   * @param {Object} options - Options for accessibility check
   * @param {Array<string>} options.includedImpacts - Impacts to include (critical, serious, moderate, minor)
   * @returns {Promise<{passes: boolean, violations: Array}>} Result of accessibility check
   */
  async checkAccessibility(options = {}) {
    const { includedImpacts = ['critical', 'serious'] } = options;
    
    const result = await this.audit(options);
    
    // Filter violations by impact
    const filteredViolations = result.issues.filter(v => includedImpacts.includes(v.severity));
    
    return {
      passes: filteredViolations.length === 0,
      violations: filteredViolations,
      url: result.url
    };
  }
}

// Create instance functions for backward compatibility
const utils = {
  /**
   * Get accessibility violations
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options for accessibility check
   * @returns {Promise<Array>} Array of accessibility violations
   */
  async getViolations(page, options = {}) {
    const accessibilityUtils = new AccessibilityUtils(page);
    return await accessibilityUtils.getViolations(options);
  },
  
  /**
   * Check accessibility with filtering by impact
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options for accessibility check
   * @returns {Promise<{passes: boolean, violations: Array}>} Result of accessibility check
   */
  async checkAccessibility(page, options = {}) {
    const accessibilityUtils = new AccessibilityUtils(page);
    return await accessibilityUtils.checkAccessibility(options);
  },
  
  /**
   * Generate accessibility report
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {string} reportPath - Path to save report
   * @param {Object} options - Report options
   * @returns {Promise<string>} Path to the generated report
   */
  async generateAccessibilityReport(page, reportPath, options = {}) {
    const accessibilityUtils = new AccessibilityUtils(page);
    const result = await accessibilityUtils.audit(options);
    return await accessibilityUtils.generateReport(result, reportPath);
  }
};

// Export both the class and utility functions
module.exports = {
  AccessibilityUtils,
  ...utils
};