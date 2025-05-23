/**
 * Report utilities for test reporting
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../../config');

/**
 * Report utilities for test reporting
 */
class ReportUtils {
  /**
   * Generate Allure report
   * @param {Object} options - Report options
   * @returns {string} Report path
   */
  static generateAllureReport(options = {}) {
    const resultsDir = options.resultsDir || config.reporting?.allure?.resultsDir || 'allure-results';
    const reportDir = options.reportDir || config.reporting?.allure?.reportDir || 'reports/allure';
    
    console.log(`Generating Allure report from ${resultsDir} to ${reportDir}`);
    
    try {
      // Clean report directory
      if (fs.existsSync(reportDir)) {
        fs.rmSync(reportDir, { recursive: true });
      }
      
      // Generate report
      execSync(`npx allure generate ${resultsDir} --clean -o ${reportDir}`);
      
      return reportDir;
    } catch (error) {
      console.error('Failed to generate Allure report:', error);
      throw error;
    }
  }

  /**
   * Open Allure report
   * @param {string} reportDir - Report directory
   */
  static openAllureReport(reportDir) {
    const allureReportDir = reportDir || config.reporting?.allure?.reportDir || 'reports/allure';
    console.log(`Opening Allure report from ${allureReportDir}`);
    
    try {
      execSync(`npx allure open ${allureReportDir}`);
    } catch (error) {
      console.error('Failed to open Allure report:', error);
      throw error;
    }
  }

  /**
   * Generate HTML report
   * @param {Object} options - Report options
   * @returns {string} Report path
   */
  static generateHtmlReport(options = {}) {
    const resultsDir = options.resultsDir || config.reporting?.html?.resultsDir || 'test-results';
    const reportDir = options.reportDir || config.reporting?.html?.reportDir || 'reports/html';
    
    console.log(`Generating HTML report from ${resultsDir} to ${reportDir}`);
    
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
      console.error('Failed to generate HTML report:', error);
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
                    ?.filter(a => a.contentType?.startsWith('image/'))
                    ?.map(a => a.path) || []
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to parse test results file ${file}:`, error);
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
    console.log(`Merging reports: ${reportPaths.join(', ')}`);
    
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
      console.error('Failed to merge reports:', error);
      throw error;
    }
  }
  
  /**
   * Generate JUnit XML report
   * @param {Object} options - Report options
   * @returns {string} Report path
   */
  static generateJUnitReport(options = {}) {
    const resultsDir = options.resultsDir || config.reporting?.junit?.resultsDir || 'test-results';
    const reportPath = options.reportPath || config.reporting?.junit?.reportPath || 'reports/junit/junit.xml';
    
    console.log(`Generating JUnit report from ${resultsDir} to ${reportPath}`);
    
    try {
      // Create directory if it doesn't exist
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Get test results
      const results = this._getTestResults(resultsDir);
      
      // Generate JUnit XML
      const xml = this._generateJUnitXml(results);
      
      // Write to file
      fs.writeFileSync(reportPath, xml);
      
      return reportPath;
    } catch (error) {
      console.error('Failed to generate JUnit report:', error);
      throw error;
    }
  }
  
  /**
   * Generate JUnit XML
   * @param {Array} results - Test results
   * @returns {string} JUnit XML
   * @private
   */
  static _generateJUnitXml(results) {
    // Group results by suite
    const suites = {};
    
    for (const result of results) {
      const parts = result.name.split(' - ');
      const suiteName = parts[0];
      const testName = parts.slice(1).join(' - ');
      
      if (!suites[suiteName]) {
        suites[suiteName] = [];
      }
      
      suites[suiteName].push({
        ...result,
        name: testName
      });
    }
    
    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<testsuites>\n';
    
    for (const [suiteName, tests] of Object.entries(suites)) {
      const failures = tests.filter(t => t.status === 'failed').length;
      const skipped = tests.filter(t => t.status === 'skipped').length;
      const duration = tests.reduce((sum, t) => sum + t.duration, 0) / 1000; // Convert to seconds
      
      xml += `  <testsuite name="${escapeXml(suiteName)}" tests="${tests.length}" failures="${failures}" skipped="${skipped}" time="${duration.toFixed(3)}">\n`;
      
      for (const test of tests) {
        const testDuration = test.duration / 1000; // Convert to seconds
        
        xml += `    <testcase name="${escapeXml(test.name)}" classname="${escapeXml(suiteName)}" time="${testDuration.toFixed(3)}"`;
        
        if (test.status === 'skipped') {
          xml += '>\n';
          xml += '      <skipped />\n';
          xml += '    </testcase>\n';
        } else if (test.status === 'failed') {
          xml += '>\n';
          xml += `      <failure message="${escapeXml(test.error?.message || 'Test failed')}">${escapeXml(test.error?.stack || '')}</failure>\n`;
          xml += '    </testcase>\n';
        } else {
          xml += ' />\n';
        }
      }
      
      xml += '  </testsuite>\n';
    }
    
    xml += '</testsuites>';
    
    return xml;
  }
  
  /**
   * Send report notification
   * @param {Object} options - Notification options
   * @returns {Promise<void>}
   */
  static async sendReportNotification(options = {}) {
    const { type, reportUrl, stats, recipients } = options;
    
    if (!type || !reportUrl) {
      throw new Error('Notification type and report URL are required');
    }
    
    console.log(`Sending ${type} notification for report: ${reportUrl}`);
    
    try {
      switch (type.toLowerCase()) {
        case 'slack':
          await this._sendSlackNotification(reportUrl, stats, options);
          break;
          
        case 'teams':
          await this._sendTeamsNotification(reportUrl, stats, options);
          break;
          
        case 'email':
          await this._sendEmailNotification(reportUrl, stats, recipients, options);
          break;
          
        default:
          throw new Error(`Unsupported notification type: ${type}`);
      }
      
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }
  
  /**
   * Send Slack notification
   * @param {string} reportUrl - Report URL
   * @param {Object} stats - Test statistics
   * @param {Object} options - Notification options
   * @returns {Promise<void>}
   * @private
   */
  static async _sendSlackNotification(reportUrl, stats, options) {
    // Implementation would use Slack API
    console.log('Slack notification not implemented');
  }
  
  /**
   * Send Teams notification
   * @param {string} reportUrl - Report URL
   * @param {Object} stats - Test statistics
   * @param {Object} options - Notification options
   * @returns {Promise<void>}
   * @private
   */
  static async _sendTeamsNotification(reportUrl, stats, options) {
    // Implementation would use Teams API
    console.log('Teams notification not implemented');
  }
  
  /**
   * Send email notification
   * @param {string} reportUrl - Report URL
   * @param {Object} stats - Test statistics
   * @param {Array<string>} recipients - Email recipients
   * @param {Object} options - Notification options
   * @returns {Promise<void>}
   * @private
   */
  static async _sendEmailNotification(reportUrl, stats, recipients, options) {
    // Implementation would use email service
    console.log('Email notification not implemented');
  }
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 * @private
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = ReportUtils;