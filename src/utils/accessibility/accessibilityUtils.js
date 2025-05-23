/**
 * Accessibility testing utilities
 */
const fs = require('fs');
const path = require('path');
const config = require('../../config');

// Default axe-core URL from config or environment or CDN
const AXE_CORE_URL = process.env.AXE_CORE_CDN || 
  (config.externalResources?.cdn?.axeCore) || 
  'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js';

/**
 * Get accessibility violations using axe-core
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Options for axe-core
 * @param {Object} options.axeOptions - Options to pass to axe.run()
 * @param {string} options.axeCoreUrl - Custom URL for axe-core library
 * @returns {Promise<Array>} Array of accessibility violations
 */
async function getViolations(page, options = {}) {
  const axeCoreUrl = options.axeCoreUrl || AXE_CORE_URL;
  
  // Inject axe-core library if not already present
  await page.evaluate(async (axeCoreUrl) => {
    if (!window.axe) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = axeCoreUrl;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load axe-core from ${axeCoreUrl}`));
        document.head.appendChild(script);
      });
    }
  }, axeCoreUrl);
  
  // Wait for axe to be available
  await page.waitForFunction(() => window.axe, { timeout: 10000 });
  
  // Run axe analysis with options
  const violations = await page.evaluate(async (runOptions) => {
    const results = await window.axe.run(document, runOptions || {});
    return results.violations;
  }, options.axeOptions);
  
  return violations;
}

/**
 * Check if a page meets accessibility standards
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Options for accessibility check
 * @param {string[]} options.includedImpacts - Impacts to include (critical, serious, moderate, minor)
 * @param {Object} options.axeOptions - Options to pass to axe.run()
 * @param {string} options.axeCoreUrl - Custom URL for axe-core library
 * @returns {Promise<{passes: boolean, violations: Array}>} Result of accessibility check
 */
async function checkAccessibility(page, options = {}) {
  const { includedImpacts = ['critical', 'serious'] } = options;
  
  const violations = await getViolations(page, options);
  
  // Filter violations by impact
  const filteredViolations = violations.filter(v => includedImpacts.includes(v.impact));
  
  return {
    passes: filteredViolations.length === 0,
    violations: filteredViolations,
    url: page.url()
  };
}

/**
 * Generate accessibility report
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} reportPath - Path to save report
 * @param {Object} options - Report options
 * @param {boolean} options.html - Generate HTML report
 * @param {Object} options.axeOptions - Options to pass to axe.run()
 * @param {string} options.axeCoreUrl - Custom URL for axe-core library
 * @returns {Promise<string>} Path to the generated report
 */
async function generateAccessibilityReport(page, reportPath, options = {}) {
  const violations = await getViolations(page, options);
  
  const report = {
    url: page.url(),
    timestamp: new Date().toISOString(),
    violations: violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map(n => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary
      }))
    }))
  };
  
  // Create directory if it doesn't exist
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write JSON report
  const jsonReportPath = reportPath.endsWith('.json') ? reportPath : `${reportPath}.json`;
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  
  // Generate HTML report if requested
  if (options.html) {
    const htmlReportPath = reportPath.replace(/\.json$/, '') + '.html';
    const htmlReport = generateHtmlReport(report);
    fs.writeFileSync(htmlReportPath, htmlReport);
    return htmlReportPath;
  }
  
  return jsonReportPath;
}

/**
 * Generate HTML report from accessibility data
 * @param {Object} report - Accessibility report data
 * @returns {string} HTML report content
 * @private
 */
function generateHtmlReport(report) {
  const violationsHtml = report.violations.map(violation => {
    const nodesHtml = violation.nodes.map(node => `
      <div class="node">
        <h4>Element:</h4>
        <pre>${escapeHtml(node.html)}</pre>
        <h4>Selector:</h4>
        <pre>${node.target.join(', ')}</pre>
        <h4>Failure Summary:</h4>
        <p>${node.failureSummary}</p>
      </div>
    `).join('');
    
    return `
      <div class="violation ${violation.impact}">
        <h3>${violation.id}: ${violation.description}</h3>
        <p><strong>Impact:</strong> ${violation.impact}</p>
        <p>${violation.help} <a href="${violation.helpUrl}" target="_blank">Learn more</a></p>
        <h4>Affected Elements (${violation.nodes.length}):</h4>
        ${nodesHtml}
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Accessibility Report - ${report.url}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        h1, h2, h3, h4 { margin-top: 0; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .violation { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .critical { border-left: 5px solid #d9534f; }
        .serious { border-left: 5px solid #f0ad4e; }
        .moderate { border-left: 5px solid #5bc0de; }
        .minor { border-left: 5px solid #5cb85c; }
        .node { background: #f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 3px; }
        pre { white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
        a { color: #337ab7; }
      </style>
    </head>
    <body>
      <h1>Accessibility Report</h1>
      <div class="summary">
        <p><strong>URL:</strong> ${report.url}</p>
        <p><strong>Date:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
        <p><strong>Total Violations:</strong> ${report.violations.length}</p>
      </div>
      
      <h2>Violations</h2>
      ${report.violations.length ? violationsHtml : '<p>No violations found. Great job!</p>'}
    </body>
    </html>
  `;
}

/**
 * Escape HTML special characters
 * @param {string} html - HTML string to escape
 * @returns {string} Escaped HTML
 * @private
 */
function escapeHtml(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Run accessibility audit with specific rules
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string[]} rules - Array of rule IDs to run
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Audit results
 */
async function auditRules(page, rules = [], options = {}) {
  const axeOptions = {
    runOnly: {
      type: 'rule',
      values: rules
    },
    ...options.axeOptions
  };
  
  return await getViolations(page, { ...options, axeOptions });
}

module.exports = {
  getViolations,
  checkAccessibility,
  generateAccessibilityReport,
  auditRules
};