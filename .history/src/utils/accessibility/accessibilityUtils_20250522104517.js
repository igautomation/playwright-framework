/**
 * Accessibility testing utilities
 */
import fs from 'fs';
import path from 'path';
import config from '../../config';

// Default axe-core URL from config or environment or CDN
const AXE_CORE_URL = process.env.AXE_CORE_CDN || 
  (config.externalResources?.cdn?.axeCore) || 
  'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js';

/**
 * Extend Window interface for axe
 */
declare global {
  interface Window {
    axe: any;
  }
}

/**
 * Get accessibility violations using axe-core
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Options for axe-core
 * @param {Object} options.axeOptions - Options to pass to axe.run()
 * @param {string} options.axeCoreUrl - Custom URL for axe-core library
 * @returns {Promise<Array>} Array of accessibility violations
 */
type AxeOptions = {
  axeOptions?: any;
  axeCoreUrl?: string;
};

async function getViolations(
  page: import('@playwright/test').Page,
  options: AxeOptions = {}
): Promise<any[]> {
  const axeCoreUrl = options.axeCoreUrl || AXE_CORE_URL;

  // Inject axe-core library if not already present
  await page.evaluate(async (axeCoreUrl: string) => {
    if (!(window as any).axe) {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = axeCoreUrl;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load axe-core from ${axeCoreUrl}`));
/**
 * Check if a page meets accessibility standards
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Options for accessibility check
 * @param {string[]} options.includedImpacts - Impacts to include (critical, serious, moderate, minor)
 * @param {Object} options.axeOptions - Options to pass to axe.run()
 * @param {string} options.axeCoreUrl - Custom URL for axe-core library
 * @returns {Promise<{passes: boolean, violations: Array, url: string}>} Result of accessibility check
 */
type CheckAccessibilityOptions = AxeOptions & {
  includedImpacts?: string[];
};

async function checkAccessibility(
  page: import('@playwright/test').Page,
  options: CheckAccessibilityOptions = {}
): Promise<{ passes: boolean; violations: any[]; url: string }> {
  const { includedImpacts = ['critical', 'serious'] } = options;

  const violations = await getViolations(page, options);

  // Filter violations by impact
  const filteredViolations = violations.filter((v: any) => includedImpacts.includes(v.impact));

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
type GenerateAccessibilityReportOptions = AxeOptions & {
  html?: boolean;
};

async function generateAccessibilityReport(
  page: import('@playwright/test').Page,
  reportPath: string,
  options: GenerateAccessibilityReportOptions = {}
): Promise<string> {
  const violations = await getViolations(page, options);

  const report = {
    url: page.url(),
    timestamp: new Date().toISOString(),
    violations: violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n: any) => ({
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
function generateHtmlReport(report: {
  url: string;
  timestamp: string;
  violations: Array<{
    id: string;
    impact: string;
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
      html: string;
      target: string[];
      failureSummary: string;
    }>;
  }>;
}): string {
  const violationsHtml = report.violations.map((violation) => {
    const nodesHtml = violation.nodes.map((node) => `
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
function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
  return `
/**
 * Run accessibility audit with specific rules
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string[]} rules - Array of rule IDs to run
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Audit results
 */
async function auditRules(
  page: import('@playwright/test').Page,
  rules: string[] = [],
  options: AxeOptions = {}
): Promise<any> {
  const axeOptions = {
    runOnly: {
      type: 'rule',
      values: rules
    },
    ...options.axeOptions
  };
export {
  getViolations,
  checkAccessibility,
  generateAccessibilityReport,
  auditRules
};  <body>
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