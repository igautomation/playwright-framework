/**
 * Report generation utility for Playwright tests
 * @deprecated Use reportingUtils.js instead
 */
const reportingUtils = require('./reportingUtils');

// Re-export functions from reportingUtils for backward compatibility
module.exports = {
  generateReport: reportingUtils.generateHtmlReport,
  processPlaywrightResults: reportingUtils.processPlaywrightResults,
  generateAllureReport: reportingUtils.generateAllureReport,
  createAllureResult: async function(test, options = {}) {
    console.warn('createAllureResult is deprecated. Use reportingUtils directly.');
    // This function is kept for backward compatibility
    try {
      const { v4: uuidv4 } = require('uuid');
      const fs = require('fs');
      const path = require('path');
      
      // Set default options
      const resultOptions = {
        resultsDir: options.resultsDir || path.join(process.cwd(), 'reports', 'allure-results'),
        ...options
      };
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(resultOptions.resultsDir)) {
        fs.mkdirSync(resultOptions.resultsDir, { recursive: true });
      }
      
      // Create result object
      const result = {
        uuid: test.uuid || uuidv4(),
        name: test.name,
        status: test.status,
        stage: 'finished',
        start: test.start || Date.now(),
        stop: test.stop || Date.now(),
        labels: [
          { name: 'suite', value: test.suite || 'Default Suite' },
          { name: 'feature', value: test.feature || test.suite || 'Default Feature' },
          ...(test.labels || [])
        ],
        steps: test.steps || [],
        attachments: []
      };
      
      // Add failure details if test failed
      if (test.status === 'failed' && test.error) {
        result.statusDetails = {
          message: test.error.message,
          trace: test.error.stack
        };
      }
      
      // Add attachments
      if (test.screenshots && test.screenshots.length > 0) {
        for (const screenshot of test.screenshots) {
          const name = screenshot.name || `Screenshot-${Date.now()}`;
          const source = `${uuidv4()}-${path.basename(screenshot.path)}`;
          
          // Copy screenshot to allure results directory
          fs.copyFileSync(screenshot.path, path.join(resultOptions.resultsDir, source));
          
          result.attachments.push({
            name,
            source,
            type: 'image/png'
          });
        }
      }
      
      // Write result to file
      const resultPath = path.join(resultOptions.resultsDir, `${result.uuid}-result.json`);
      fs.writeFileSync(resultPath, JSON.stringify(result));
      
      return resultPath;
    } catch (error) {
      console.error('Failed to create Allure result:', error);
      throw error;
    }
  }
};