/**
 * Accessibility testing utilities for Playwright
 */
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');
const PlaywrightErrorHandler = require('../common/errorHandler');

/**
 * Utilities for accessibility testing
 */
class AccessibilityUtils {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
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
      // Get accessibility snapshot
      const snapshot = await this.page.accessibility.snapshot({
        interestingOnly: options.interestingOnly !== false,
        root: options.root ? await this.page.$(options.root) : undefined
      });
      
      // Run client-side accessibility checks
      const violations = await this._runClientSideChecks(options);
      
      // Analyze snapshot for additional issues
      const snapshotIssues = this._analyzeSnapshot(snapshot);
      
      // Combine all issues
      const allIssues = [...violations, ...snapshotIssues];
      
      // Group issues by type
      const issuesByType = this._groupIssuesByType(allIssues);
      
      // Calculate severity levels
      const severityCounts = this._calculateSeverityCounts(allIssues);
      
      const result = {
        url: this.page.url(),
        timestamp: new Date().toISOString(),
        snapshot,
        issues: allIssues,
        issuesByType,
        severityCounts,
        passed: allIssues.length === 0
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
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'running accessibility audit',
        options
      });
    }
  }
  
  /**
   * Run client-side accessibility checks
   * @param {Object} options - Check options
   * @returns {Promise<Array>} Accessibility violations
   * @private
   */
  async _runClientSideChecks(options = {}) {
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
      
      // Check for proper heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let previousLevel = 0;
      
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1), 10);
        
        // Check for skipped heading levels
        if (previousLevel > 0 && level > previousLevel + 1) {
          violations.push({
            type: 'heading-order',
            message: `Heading level skipped from h${previousLevel} to h${level}`,
            severity: 'moderate',
            element: {
              tagName: heading.tagName,
              selector: getSelector(heading),
              text: heading.textContent.trim()
            }
          });
        }
        
        previousLevel = level;
      });
      
      // Helper function to get a simple CSS selector for an element
      function getSelector(element) {
        let selector = element.tagName.toLowerCase();
        
        if (element.id) {
          selector += `#${element.id}`;
        } else if (element.className && typeof element.className === 'string') {
          selector += `.${element.className.trim().replace(/\s+/g, '.')}`;
        }
        
        return selector;
      }
      
      return violations;
    });
  }
  
  /**
   * Analyze accessibility snapshot for issues
   * @param {Object} snapshot - Accessibility snapshot
   * @returns {Array} Accessibility issues
   * @private
   */
  _analyzeSnapshot(snapshot) {
    const issues = [];
    
    // Helper function to recursively check nodes
    const checkNode = (node) => {
      // Check for missing roles on interactive elements
      if (node.name && !node.role && (node.name.includes('button') || node.name.includes('link'))) {
        issues.push({
          type: 'missing-role',
          message: `Element with name "${node.name}" has no ARIA role`,
          severity: 'moderate',
          node
        });
      }
      
      // Check for inappropriate roles
      if (node.role === 'button' && node.name && node.name.includes('link')) {
        issues.push({
          type: 'inappropriate-role',
          message: `Button has name "${node.name}" suggesting it should be a link`,
          severity: 'moderate',
          node
        });
      }
      
      // Check children recursively
      if (node.children) {
        node.children.forEach(child => checkNode(child));
      }
    };
    
    // Start checking from root node
    if (snapshot) {
      checkNode(snapshot);
    }
    
    return issues;
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
      const html = `
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
            .severity-counts {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              margin-top: 15px;
            }
            .severity-count {
              padding: 10px 15px;
              border-radius: 5px;
              font-weight: bold;
            }
            .severity-critical {
              background-color: #fadbd8;
              color: #c0392b;
            }
            .severity-serious {
              background-color: #f9e79f;
              color: #d35400;
            }
            .severity-moderate {
              background-color: #d6eaf8;
              color: #2980b9;
            }
            .severity-minor {
              background-color: #d5f5e3;
              color: #27ae60;
            }
            .issue-type {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .issue-type h3 {
              margin-top: 0;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .issue {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 10px;
            }
            .issue-critical {
              border-left: 5px solid #c0392b;
            }
            .issue-serious {
              border-left: 5px solid #d35400;
            }
            .issue-moderate {
              border-left: 5px solid #2980b9;
            }
            .issue-minor {
              border-left: 5px solid #27ae60;
            }
            .element-info {
              font-family: monospace;
              background-color: #f1f1f1;
              padding: 10px;
              border-radius: 3px;
              margin-top: 10px;
            }
            .screenshot {
              max-width: 100%;
              border: 1px solid #ddd;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Accessibility Audit Report</h1>
          <div class="summary">
            <p><strong>URL:</strong> ${result.url}</p>
            <p><strong>Generated:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
            <p>
              <strong>Status:</strong> 
              <span class="${result.passed ? 'passed' : 'failed'}">
                ${result.passed ? 'PASSED' : 'FAILED'}
              </span>
            </p>
            <p><strong>Total Issues:</strong> ${result.issues.length}</p>
            
            <div class="severity-counts">
              <div class="severity-count severity-critical">
                Critical: ${result.severityCounts.critical}
              </div>
              <div class="severity-count severity-serious">
                Serious: ${result.severityCounts.serious}
              </div>
              <div class="severity-count severity-moderate">
                Moderate: ${result.severityCounts.moderate}
              </div>
              <div class="severity-count severity-minor">
                Minor: ${result.severityCounts.minor || 0}
              </div>
            </div>
          </div>
          
          ${result.screenshotPath ? `
            <h2>Page Screenshot</h2>
            <img src="file://${result.screenshotPath}" alt="Page Screenshot" class="screenshot">
          ` : ''}
          
          <h2>Issues by Type</h2>
          ${Object.entries(result.issuesByType).length > 0 ? 
            Object.entries(result.issuesByType).map(([type, issues]) => `
              <div class="issue-type">
                <h3>${type} (${issues.length})</h3>
                ${issues.map(issue => `
                  <div class="issue issue-${issue.severity}">
                    <p><strong>${issue.message}</strong></p>
                    <p><strong>Severity:</strong> ${issue.severity}</p>
                    ${issue.element ? `
                      <div class="element-info">
                        <p><strong>Element:</strong> ${issue.element.tagName}</p>
                        ${issue.element.selector ? `<p><strong>Selector:</strong> ${issue.element.selector}</p>` : ''}
                        ${issue.element.id ? `<p><strong>ID:</strong> ${issue.element.id}</p>` : ''}
                        ${issue.element.text ? `<p><strong>Text:</strong> ${issue.element.text}</p>` : ''}
                        ${issue.element.src ? `<p><strong>Source:</strong> ${issue.element.src}</p>` : ''}
                        ${issue.element.href ? `<p><strong>Link:</strong> ${issue.element.href}</p>` : ''}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            `).join('') : 
            '<p>No accessibility issues found. Great job!</p>'
          }
        </body>
        </html>
      `;
      
      // Write report to file
      fs.writeFileSync(reportPath, html);
      
      return reportPath;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'generating accessibility report',
        result,
        outputPath
      });
    }
  }
  
  /**
   * Check specific element for accessibility issues
   * @param {string} selector - Element selector
   * @param {Object} options - Audit options
   * @returns {Promise<Object>} Audit results
   */
  async checkElement(selector, options = {}) {
    try {
      // Wait for element to be visible
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: options.timeout || 10000
      });
      
      // Get element
      const element = await this.page.$(selector);
      
      // Get accessibility snapshot for the element
      const snapshot = await this.page.accessibility.snapshot({
        root: element,
        interestingOnly: options.interestingOnly !== false
      });
      
      // Run client-side checks for this element
      const violations = await this.page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) return [];
        
        const violations = [];
        
        // Check for images without alt text
        if (element.tagName === 'IMG' && !element.alt && !element.getAttribute('role') && !element.getAttribute('aria-hidden')) {
          violations.push({
            type: 'image-alt',
            message: 'Image is missing alt text',
            severity: 'critical',
            element: {
              tagName: 'img',
              src: element.src
            }
          });
        }
        
        // Check for form inputs without labels
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
          const id = element.id;
          if (id && !document.querySelector(`label[for="${id}"]`) && 
              !element.getAttribute('aria-label') && 
              !element.getAttribute('aria-labelledby')) {
            violations.push({
              type: 'input-label',
              message: 'Form control missing associated label',
              severity: 'critical',
              element: {
                tagName: element.tagName,
                type: element.type,
                id: element.id
              }
            });
          }
        }
        
        // Check for buttons without accessible names
        if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
          if (!element.textContent.trim() && 
              !element.getAttribute('aria-label') && 
              !element.getAttribute('aria-labelledby') &&
              !element.title) {
            violations.push({
              type: 'button-name',
              message: 'Button has no accessible name',
              severity: 'critical',
              element: {
                tagName: element.tagName
              }
            });
          }
        }
        
        // Check for links without accessible names
        if (element.tagName === 'A') {
          if (!element.textContent.trim() && 
              !element.getAttribute('aria-label') && 
              !element.getAttribute('aria-labelledby') &&
              !element.title) {
            violations.push({
              type: 'link-name',
              message: 'Link has no accessible name',
              severity: 'critical',
              element: {
                tagName: 'a',
                href: element.href
              }
            });
          }
        }
        
        return violations;
      }, selector);
      
      // Analyze snapshot for additional issues
      const snapshotIssues = this._analyzeSnapshot(snapshot);
      
      // Combine all issues
      const allIssues = [...violations, ...snapshotIssues];
      
      // Group issues by type
      const issuesByType = this._groupIssuesByType(allIssues);
      
      // Calculate severity levels
      const severityCounts = this._calculateSeverityCounts(allIssues);
      
      const result = {
        selector,
        element: {
          tagName: await this.page.evaluate(selector => document.querySelector(selector).tagName, selector),
          text: await this.page.evaluate(selector => document.querySelector(selector).textContent.trim(), selector)
        },
        snapshot,
        issues: allIssues,
        issuesByType,
        severityCounts,
        passed: allIssues.length === 0
      };
      
      // Take screenshot if enabled
      if (options.screenshot) {
        const screenshotPath = options.screenshotPath || path.join(
          this.outputDir,
          'screenshots',
          `element-${Date.now()}.png`
        );
        
        // Ensure directory exists
        const screenshotDir = path.dirname(screenshotPath);
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        await element.screenshot({ path: screenshotPath });
        result.screenshotPath = screenshotPath;
      }
      
      return result;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'checking element accessibility',
        selector,
        options
      });
    }
  }
}

module.exports = AccessibilityUtils;