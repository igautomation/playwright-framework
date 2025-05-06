const logger = require('../common/logger');
const fs = require('fs');
const path = require('path');

/**
 * Accessibility Utilities class for accessibility testing
 * Note: This is a simplified version that doesn't require axe-playwright
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

      // Simplified implementation that checks for common accessibility issues
      const results = await this.page.evaluate(() => {
        const violations = [];

        // Check for images without alt text
        const imagesWithoutAlt = Array.from(
          document.querySelectorAll('img:not([alt])')
        );
        if (imagesWithoutAlt.length > 0) {
          violations.push({
            id: 'image-alt',
            impact: 'critical',
            description: 'Images must have alternate text',
            nodes: imagesWithoutAlt.map((img) => ({
              html: img.outerHTML,
              target: img.id
                ? `#${img.id}`
                : img.className
                  ? `.${img.className.split(' ')[0]}`
                  : 'img',
            })),
          });
        }

        // Check for form elements without labels
        const formElementsWithoutLabels = Array.from(
          document.querySelectorAll(
            'input:not([type="hidden"]):not([aria-label]):not([aria-labelledby]), select:not([aria-label]):not([aria-labelledby]), textarea:not([aria-label]):not([aria-labelledby])'
          )
        ).filter((el) => {
          // Check if element has an associated label
          if (el.id) {
            return !document.querySelector(`label[for="${el.id}"]`);
          }
          return true;
        });

        if (formElementsWithoutLabels.length > 0) {
          violations.push({
            id: 'label',
            impact: 'critical',
            description: 'Form elements must have labels',
            nodes: formElementsWithoutLabels.map((el) => ({
              html: el.outerHTML,
              target: el.id
                ? `#${el.id}`
                : el.name
                  ? `[name="${el.name}"]`
                  : el.tagName.toLowerCase(),
            })),
          });
        }

        // Check for empty buttons
        const emptyButtons = Array.from(
          document.querySelectorAll('button')
        ).filter(
          (button) =>
            !button.textContent.trim() &&
            !button.getAttribute('aria-label') &&
            !button.querySelector('img')
        );

        if (emptyButtons.length > 0) {
          violations.push({
            id: 'button-name',
            impact: 'critical',
            description: 'Buttons must have discernible text',
            nodes: emptyButtons.map((button) => ({
              html: button.outerHTML,
              target: button.id
                ? `#${button.id}`
                : button.className
                  ? `.${button.className.split(' ')[0]}`
                  : 'button',
            })),
          });
        }

        return {
          violations,
          passes: [],
          url: window.location.href,
          timestamp: new Date().toISOString(),
        };
      });

      logger.info(
        `Accessibility scan completed with ${results.violations.length} violations`
      );

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
      const reportPath = path.join(
        reportDir,
        `accessibility-report-${timestamp}.json`
      );

      // Write report to file
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

      logger.info(`Accessibility report generated at ${reportPath}`);

      return reportPath;
    } catch (error) {
      logger.error('Failed to generate accessibility report', error);
      throw error;
    }
  }
}

module.exports = AccessibilityUtils;
