/**
 * Report utilities for test reporting
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

class ReportUtils {
  /**
   * Generate Allure report
   * @param {Object} options - Report options
   * @returns {string} Report path
   */
  static generateAllureReport(options = {}) {
    const resultsDir = options.resultsDir || path.join(process.cwd(), 'allure-results');
    const reportDir = options.reportDir || path.join(process.cwd(), 'allure-report');
    
    logger.info(`Generating Allure report from ${resultsDir} to ${reportDir}`);
    
    try {
      // Clean report directory
      if (fs.existsSync(reportDir)) {
        fs.rmSync(reportDir, { recursive: true });
      }
      
      // Generate report
      execSync(`npx allure generate ${resultsDir} --clean -o ${reportDir}`);
      
      return reportDir;
    } catch (error) {
      logger.error('Failed to generate Allure report:', error);
      throw error;
    }
  }

  /**
   * Open Allure report
   * @param {string} reportDir - Report directory
   */
  static openAllureReport(reportDir = 'allure-report') {
    logger.info(`Opening Allure report from ${reportDir}`);
    
    try {
      execSync(`npx allure open ${reportDir}`);
    } catch (error) {
      logger.error('Failed to open Allure report:', error);
      throw error;
    }
  }

  /**
   * Generate HTML report
   * @param {Object} options - Report options
   * @returns {string} Report path
   */
  static generateHtmlReport(options = {}) {
    const resultsDir = options.resultsDir || path.join(process.cwd(), 'test-results');
    const reportDir = options.reportDir || path.join(process.cwd(), 'html-report');
    
    logger.info(`Generating HTML report from ${resultsDir} to ${reportDir}`);
    
    try {
      // Clean report directory
      if (fs.existsSync(reportDir)) {
        fs.rmSync(reportDir, { recursive: true });
      }
      
      // Create report directory
      fs.mkdirSync(reportDir, { recursive: true });
      
      // Generate report
      const reportPath = path.join(reportDir, 'index.html');
      
      // Create simple HTML report
      const html = this._generateHtml(resultsDir, options);
      
      fs.writeFileSync(reportPath, html);
      
      return reportPath;
    } catch (error) {
      logger.error('Failed to generate HTML report:', error);
      throw error;
    }
  }

  /**
   * Generate HTML content
   * @param {string} resultsDir - Results directory
   * @param {Object} options - Report options
   * @returns {string} HTML content
   * @private
   */
  static _generateHtml(resultsDir, options = {}) {
    // Get test results
    const results = this._getTestResults(resultsDir);
    
    // Calculate statistics
    const stats = {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      duration: results.reduce((sum, r) => sum + r.duration, 0)
    };
    
    // Format duration
    const formatDuration = (ms) => {
      if (ms < 1000) return `${ms}ms`;
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    };
    
    // Generate HTML
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Report</title>
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
          .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
          }
          .stat {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            flex: 1;
            min-width: 150px;
            text-align: center;
          }
          .stat h3 {
            margin-top: 0;
            margin-bottom: 5px;
          }
          .stat .value {
            font-size: 24px;
            font-weight: bold;
          }
          .stat.passed .value { color: #27ae60; }
          .stat.failed .value { color: #e74c3c; }
          .stat.skipped .value { color: #f39c12; }
          .stat.duration .value { color: #3498db; }
          
          .test {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 10px;
          }
          .test.passed {
            border-left: 5px solid #27ae60;
          }
          .test.failed {
            border-left: 5px solid #e74c3c;
          }
          .test.skipped {
            border-left: 5px solid #f39c12;
          }
          .test h3 {
            margin-top: 0;
            margin-bottom: 10px;
          }
          .test .duration {
            color: #7f8c8d;
            font-size: 0.9em;
          }
          .error {
            background-color: #fadbd8;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            font-family: monospace;
            white-space: pre-wrap;
          }
          .media {
            margin-top: 15px;
          }
          .media h4 {
            margin-bottom: 5px;
          }
          .media img {
            max-width: 100%;
            border: 1px solid #ddd;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Test Report</h1>
        
        <div class="summary">
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          
          <div class="stats">
            <div class="stat passed">
              <h3>Passed</h3>
              <div class="value">${stats.passed}</div>
            </div>
            <div class="stat failed">
              <h3>Failed</h3>
              <div class="value">${stats.failed}</div>
            </div>
            <div class="stat skipped">
              <h3>Skipped</h3>
              <div class="value">${stats.skipped}</div>
            </div>
            <div class="stat duration">
              <h3>Duration</h3>
              <div class="value">${formatDuration(stats.duration)}</div>
            </div>
          </div>
        </div>
        
        <h2>Test Results</h2>
        
        ${results.map(test => `
          <div class="test ${test.status}">
            <h3>${test.name}</h3>
            <div class="duration">Duration: ${formatDuration(test.duration)}</div>
            
            ${test.status === 'failed' && test.error ? `
              <div class="error">
                <strong>Error:</strong> ${test.error.message}
                ${test.error.stack ? `\n\n${test.error.stack}` : ''}
              </div>
            ` : ''}
            
            ${test.screenshots && test.screenshots.length > 0 ? `
              <div class="media">
                <h4>Screenshots:</h4>
                ${test.screenshots.map(screenshot => `
                  <img src="file://${screenshot}" alt="Screenshot">
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;
  }

  /**
   * Get test results
   * @param {string} resultsDir - Results directory
   * @returns {Array} Test results
   * @private
   */
  static _getTestResults(resultsDir) {
    // This is a simplified implementation
    // In a real implementation, you would parse the test results files
    
    // Check if results directory exists
    if (!fs.existsSync(resultsDir)) {
      return [];
    }
    
    // Get all JSON files in the results directory
    const files = fs.readdirSync(resultsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(resultsDir, file));
    
    // Parse each file
    const results = [];
    
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        // Extract test results
        if (data.suites) {
          for (const suite of data.suites) {
            for (const spec of suite.specs) {
              for (const test of spec.tests) {
                results.push({
                  name: `${suite.title} - ${spec.title} - ${test.title}`,
                  status: test.status,
                  duration: test.duration,
                  error: test.error,
                  screenshots: test.attachments
                    .filter(a => a.contentType.startsWith('image/'))
                    .map(a => a.path)
                });
              }
            }
          }
        }
      } catch (error) {
        logger.error(`Failed to parse test results file ${file}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Merge multiple reports
   * @param {Array<string>} reportPaths - Report paths
   * @param {string} outputPath - Output path
   * @returns {string} Merged report path
   */
  static mergeReports(reportPaths, outputPath) {
    logger.info(`Merging reports: ${reportPaths.join(', ')}`);
    
    try {
      // For Allure reports, use allure-merge
      if (reportPaths.every(p => p.includes('allure'))) {
        const outputDir = path.dirname(outputPath);
        
        // Create output directory
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Merge reports
        execSync(`npx allure-merge ${reportPaths.join(' ')} -o ${outputPath}`);
        
        return outputPath;
      }
      
      // For other reports, implement custom merging logic
      // ...
      
      return outputPath;
    } catch (error) {
      logger.error('Failed to merge reports:', error);
      throw error;
    }
  }
}

module.exports = ReportUtils;