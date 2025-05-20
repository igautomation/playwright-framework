/**
 * Accessibility testing utilities
 */
const externalResources = require('../../config/external-resources');

/**
 * Get accessibility violations using axe-core
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Array>} Array of accessibility violations
 */
async function getViolations(page) {
  // Inject axe-core library if not already present
  await page.evaluate(async (axeCoreUrl) => {
    if (!window.axe) {
      const script = document.createElement('script');
      script.src = axeCoreUrl;
      script.onload = () => {
        console.log('axe-core loaded');
      };
      document.head.appendChild(script);
      
      // Wait for script to load
      await new Promise(resolve => {
        const checkAxe = setInterval(() => {
          if (window.axe) {
            clearInterval(checkAxe);
            resolve();
          }
        }, 100);
      });
    }
  }, externalResources.cdn.axeCore);
  
  // Run axe analysis
  const violations = await page.evaluate(async () => {
    const results = await window.axe.run();
    return results.violations;
  });
  
  return violations;
}

/**
 * Check if a page meets accessibility standards
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Options for accessibility check
 * @param {string[]} options.includedImpacts - Impacts to include (critical, serious, moderate, minor)
 * @returns {Promise<{passes: boolean, violations: Array}>} Result of accessibility check
 */
async function checkAccessibility(page, options = {}) {
  const { includedImpacts = ['critical', 'serious'] } = options;
  
  const violations = await getViolations(page);
  
  // Filter violations by impact
  const filteredViolations = violations.filter(v => includedImpacts.includes(v.impact));
  
  return {
    passes: filteredViolations.length === 0,
    violations: filteredViolations
  };
}

/**
 * Generate accessibility report
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} reportPath - Path to save report
 * @returns {Promise<void>}
 */
async function generateAccessibilityReport(page, reportPath) {
  const violations = await getViolations(page);
  
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
  const dir = require('path').dirname(reportPath);
  if (!require('fs').existsSync(dir)) {
    require('fs').mkdirSync(dir, { recursive: true });
  }
  
  // Write report to file
  require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

module.exports = {
  getViolations,
  checkAccessibility,
  generateAccessibilityReport
};