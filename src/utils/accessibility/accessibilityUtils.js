/**
 * Accessibility testing utilities for Playwright
 */
const fs = require('fs');
const path = require('path');

class AccessibilityUtils {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   * @param {Object} options - Configuration options
   */
  constructor(page, options = {}) {
    this.page = page;
    this.outputDir = options.outputDir || './reports/accessibility';
    
    // Create output directory if it doesn't exist
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
    } catch (error) {
      console.log(`Error creating output directory: ${error.message}`);
      // Use a fallback directory if there's an issue
      this.outputDir = './';
    }
  }
  
  /**
   * Run accessibility audit on current page
   * @param {Object} options - Audit options
   * @returns {Promise<Object>} Audit results
   */
  async audit(options = {}) {
    try {
      // Perform real accessibility checks
      const issues = await this.page.evaluate(() => {
        const violations = [];
        
        try {
          // Check for images without alt text
          document.querySelectorAll('img').forEach(img => {
            if (!img.alt && !img.getAttribute('aria-hidden') === 'true') {
              violations.push({
                type: 'image-alt',
                message: 'Image is missing alt text',
                severity: 'critical',
                element: img.outerHTML
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
                element: input.outerHTML
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
                element: button.outerHTML
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
                element: link.outerHTML
              });
            }
          });
          
          // Check for missing document language
          if (!document.documentElement.lang) {
            violations.push({
              type: 'html-lang',
              message: 'Document language not specified',
              severity: 'serious'
            });
          }
        } catch (innerError) {
          console.log('Error during accessibility evaluation:', innerError);
        }
        
        return violations;
      });
      
      // Group issues by type
      const issuesByType = {};
      issues.forEach(issue => {
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = [];
        }
        issuesByType[issue.type].push(issue);
      });
      
      // Calculate severity counts
      const severityCounts = {
        critical: issues.filter(i => i.severity === 'critical').length,
        serious: issues.filter(i => i.severity === 'serious').length,
        moderate: issues.filter(i => i.severity === 'moderate').length,
        minor: issues.filter(i => i.severity === 'minor').length
      };
      
      // Take screenshot if enabled
      if (options.screenshot) {
        try {
          const screenshotPath = path.join(this.outputDir, `screenshot-${Date.now()}.png`);
          await this.page.screenshot({ path: screenshotPath, fullPage: true });
        } catch (screenshotError) {
          console.log(`Error taking screenshot: ${screenshotError.message}`);
        }
      }
      
      return { issues, issuesByType, severityCounts };
    } catch (error) {
      console.log(`Error in accessibility audit: ${error.message}`);
      return { 
        issues: [], 
        issuesByType: {}, 
        severityCounts: { critical: 0, serious: 0, moderate: 0, minor: 0 } 
      };
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
      // Wait for element to be visible with increased timeout
      try {
        await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
      } catch (error) {
        console.warn(`Element with selector "${selector}" not found or not visible: ${error.message}`);
        return { issues: [], issuesByType: {}, severityCounts: { critical: 0, serious: 0, moderate: 0, minor: 0 } };
      }
      
      // Perform real accessibility checks on the element
      const issues = await this.page.evaluate(selector => {
        const violations = [];
        
        try {
          const element = document.querySelector(selector);
          
          if (!element) return violations;
          
          // Check for images without alt text
          element.querySelectorAll('img').forEach(img => {
            if (!img.alt && !img.getAttribute('aria-hidden') === 'true') {
              violations.push({
                type: 'image-alt',
                message: 'Image is missing alt text',
                severity: 'critical',
                element: img.outerHTML
              });
            }
          });
          
          // Check for form inputs without labels
          element.querySelectorAll('input, select, textarea').forEach(input => {
            const id = input.id;
            if (id && !document.querySelector(`label[for="${id}"]`) && 
                !input.getAttribute('aria-label') && 
                !input.getAttribute('aria-labelledby')) {
              violations.push({
                type: 'input-label',
                message: 'Form control missing associated label',
                severity: 'critical',
                element: input.outerHTML
              });
            }
          });
          
          // Check for buttons without accessible names
          element.querySelectorAll('button, [role="button"]').forEach(button => {
            if (!button.textContent.trim() && 
                !button.getAttribute('aria-label') && 
                !button.getAttribute('aria-labelledby') &&
                !button.title) {
              violations.push({
                type: 'button-name',
                message: 'Button has no accessible name',
                severity: 'critical',
                element: button.outerHTML
              });
            }
          });
          
          // Check for links without accessible names
          element.querySelectorAll('a').forEach(link => {
            if (!link.textContent.trim() && 
                !link.getAttribute('aria-label') && 
                !link.getAttribute('aria-labelledby') &&
                !link.title) {
              violations.push({
                type: 'link-name',
                message: 'Link has no accessible name',
                severity: 'critical',
                element: link.outerHTML
              });
            }
          });
        } catch (innerError) {
          console.log('Error during element accessibility check:', innerError);
        }
        
        return violations;
      }, selector);
      
      // Group issues by type
      const issuesByType = {};
      issues.forEach(issue => {
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = [];
        }
        issuesByType[issue.type].push(issue);
      });
      
      // Calculate severity counts
      const severityCounts = {
        critical: issues.filter(i => i.severity === 'critical').length,
        serious: issues.filter(i => i.severity === 'serious').length,
        moderate: issues.filter(i => i.severity === 'moderate').length,
        minor: issues.filter(i => i.severity === 'minor').length
      };
      
      // Take screenshot if enabled
      if (options.screenshot) {
        try {
          const screenshotPath = path.join(this.outputDir, `element-${Date.now()}.png`);
          const element = await this.page.$(selector);
          if (element) {
            await element.screenshot({ path: screenshotPath });
          }
        } catch (screenshotError) {
          console.log(`Error taking element screenshot: ${screenshotError.message}`);
        }
      }
      
      return { issues, issuesByType, severityCounts };
    } catch (error) {
      console.log(`Error in checkElement: ${error.message}`);
      return { 
        issues: [], 
        issuesByType: {}, 
        severityCounts: { critical: 0, serious: 0, moderate: 0, minor: 0 } 
      };
    }
  }
}

module.exports = AccessibilityUtils;