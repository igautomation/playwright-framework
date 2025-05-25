/**
 * Unified Reporting Utilities
 * 
 * Provides comprehensive utilities for test reporting
 */
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const logger = require('../common/logger');

/**
 * Generate HTML report from test results
 * @param {Object} options - Report options
 * @returns {Promise<string>} Path to the generated report
 */
async function generateHtmlReport(options = {}) {
  try {
    // Set default options
    const reportOptions = {
      title: options.title || 'Test Report',
      outputDir: options.outputDir || path.join(process.cwd(), 'reports', 'html'),
      outputFile: options.outputFile || `report-${new Date().toISOString().replace(/[:.]/g, '-')}.html`,
      results: options.results || [],
      templatePath: options.templatePath || path.join(__dirname, 'templates', 'report.ejs'),
      includeScreenshots: options.includeScreenshots !== false,
      includeVideos: options.includeVideos !== false,
      includeTraces: options.includeTraces !== false,
      includeLogs: options.includeLogs !== false,
      customData: options.customData || {}
    };
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(reportOptions.outputDir)) {
      fs.mkdirSync(reportOptions.outputDir, { recursive: true });
    }
    
    // Create templates directory if it doesn't exist
    const templatesDir = path.dirname(reportOptions.templatePath);
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    
    // Create default template if it doesn't exist
    if (!fs.existsSync(reportOptions.templatePath)) {
      const defaultTemplate = getDefaultTemplate();
      fs.writeFileSync(reportOptions.templatePath, defaultTemplate);
    }
    
    // Calculate statistics
    const stats = calculateStats(reportOptions.results);
    
    // Helper function to format duration
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
    
    // Render template
    const html = await ejs.renderFile(reportOptions.templatePath, {
      title: reportOptions.title,
      results: reportOptions.results,
      stats,
      includeScreenshots: reportOptions.includeScreenshots,
      includeVideos: reportOptions.includeVideos,
      includeTraces: reportOptions.includeTraces,
      includeLogs: reportOptions.includeLogs,
      customData: reportOptions.customData,
      formatDuration
    });
    
    // Write report to file
    const reportPath = path.join(reportOptions.outputDir, reportOptions.outputFile);
    fs.writeFileSync(reportPath, html);
    
    logger.info(`Report generated: ${reportPath}`);
    return reportPath;
  } catch (error) {
    logger.error('Failed to generate HTML report:', error);
    throw error;
  }
}

/**
 * Process test results from Playwright test runner
 * @param {Object} results - Playwright test results
 * @returns {Array} Processed results
 */
function processPlaywrightResults(results) {
  const processedResults = [];
  
  for (const suite of results.suites) {
    const processedSuite = {
      name: suite.title,
      tests: []
    };
    
    for (const spec of suite.specs) {
      for (const test of spec.tests) {
        const processedTest = {
          name: test.title,
          status: test.status,
          duration: test.duration,
          error: test.error,
          screenshots: test.attachments
            .filter(a => a.contentType.startsWith('image/'))
            .map(a => ({ path: a.path, name: a.name })),
          videos: test.attachments
            .filter(a => a.contentType.startsWith('video/'))
            .map(a => ({ path: a.path, name: a.name })),
          traces: test.attachments
            .filter(a => a.contentType === 'application/zip')
            .map(a => ({ path: a.path, name: a.name })),
          logs: test.attachments
            .filter(a => a.contentType === 'text/plain')
            .map(a => {
              try {
                return JSON.parse(fs.readFileSync(a.path, 'utf8'));
              } catch (e) {
                return { timestamp: new Date().toISOString(), level: 'INFO', message: fs.readFileSync(a.path, 'utf8') };
              }
            })
        };
        
        processedSuite.tests.push(processedTest);
      }
    }
    
    processedResults.push(processedSuite);
  }
  
  return processedResults;
}

/**
 * Generate Allure report from test results
 * @param {Object} options - Report options
 * @returns {Promise<string>} Path to the generated report
 */
async function generateAllureReport(options = {}) {
  try {
    // Set default options
    const reportOptions = {
      resultsDir: options.resultsDir || path.join(process.cwd(), 'reports', 'allure-results'),
      outputDir: options.outputDir || path.join(process.cwd(), 'reports', 'allure'),
      ...options
    };
    
    // Create directories if they don't exist
    if (!fs.existsSync(reportOptions.resultsDir)) {
      fs.mkdirSync(reportOptions.resultsDir, { recursive: true });
    }
    
    if (!fs.existsSync(reportOptions.outputDir)) {
      fs.mkdirSync(reportOptions.outputDir, { recursive: true });
    }
    
    // Generate Allure report
    execSync(`npx allure generate ${reportOptions.resultsDir} --clean -o ${reportOptions.outputDir}`);
    
    logger.info(`Allure report generated: ${reportOptions.outputDir}`);
    return reportOptions.outputDir;
  } catch (error) {
    logger.error('Failed to generate Allure report:', error);
    throw error;
  }
}

/**
 * Open Allure report
 * @param {string} reportDir - Report directory
 */
function openAllureReport(reportDir) {
  try {
    const allureReportDir = reportDir || path.join(process.cwd(), 'reports', 'allure');
    logger.info(`Opening Allure report from ${allureReportDir}`);
    
    execSync(`npx allure open ${allureReportDir}`);
  } catch (error) {
    logger.error('Failed to open Allure report:', error);
    throw error;
  }
}

/**
 * Generate JUnit XML report
 * @param {Object} options - Report options
 * @returns {string} Report path
 */
function generateJUnitReport(options = {}) {
  try {
    const resultsDir = options.resultsDir || path.join(process.cwd(), 'test-results');
    const reportPath = options.reportPath || path.join(process.cwd(), 'reports', 'junit', 'junit.xml');
    
    logger.info(`Generating JUnit report from ${resultsDir} to ${reportPath}`);
    
    // Create directory if it doesn't exist
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Get test results
    const results = getTestResults(resultsDir);
    
    // Generate JUnit XML
    const xml = generateJUnitXml(results);
    
    // Write to file
    fs.writeFileSync(reportPath, xml);
    
    return reportPath;
  } catch (error) {
    logger.error('Failed to generate JUnit report:', error);
    throw error;
  }
}

/**
 * Generate Markdown report
 * @param {Object} options - Report options
 * @returns {string} Report path
 */
function generateMarkdownReport(options = {}) {
  try {
    const resultsDir = options.resultsDir || path.join(process.cwd(), 'test-results');
    const reportPath = options.reportPath || path.join(process.cwd(), 'reports', 'markdown', 'test-report.md');
    
    logger.info(`Generating Markdown report from ${resultsDir} to ${reportPath}`);
    
    // Create directory if it doesn't exist
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Get test results
    const results = getTestResults(resultsDir);
    
    // Generate Markdown
    let mdContent = `# Test Execution Report\n\n`;
    mdContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Calculate stats
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    
    results.forEach(result => {
      totalTests++;
      if (result.status === 'passed') passedTests++;
      else if (result.status === 'failed') failedTests++;
      else skippedTests++;
    });
    
    // Add summary
    mdContent += `## Summary\n\n`;
    mdContent += `- Total Tests: ${totalTests}\n`;
    mdContent += `- Passed: ${passedTests} (${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%)\n`;
    mdContent += `- Failed: ${failedTests} (${totalTests > 0 ? Math.round((failedTests / totalTests) * 100) : 0}%)\n`;
    mdContent += `- Skipped: ${skippedTests} (${totalTests > 0 ? Math.round((skippedTests / totalTests) * 100) : 0}%)\n\n`;
    
    // Group by suite
    const suites = {};
    results.forEach(result => {
      const suiteName = result.suite || 'Default Suite';
      if (!suites[suiteName]) {
        suites[suiteName] = [];
      }
      suites[suiteName].push(result);
    });
    
    // Add test details
    Object.entries(suites).forEach(([suiteName, tests]) => {
      mdContent += `## ${suiteName}\n\n`;
      mdContent += `| Test | Status | Duration |\n`;
      mdContent += `| ---- | ------ | -------- |\n`;
      
      tests.forEach(test => {
        let statusEmoji = '⏺️';
        if (test.status === 'passed') {
          statusEmoji = '✅';
        } else if (test.status === 'failed') {
          statusEmoji = '❌';
        } else {
          statusEmoji = '⏭️';
        }
        
        const duration = test.duration ? `${(test.duration / 1000).toFixed(2)}s` : 'N/A';
        
        mdContent += `| ${test.name} | ${statusEmoji} ${test.status} | ${duration} |\n`;
        
        // Add error details for failed tests
        if (test.status === 'failed' && test.error) {
          mdContent += `\n<details>\n<summary>Error Details</summary>\n\n\`\`\`\n${test.error.message || 'Unknown error'}\n\`\`\`\n</details>\n\n`;
        }
      });
      
      mdContent += `\n`;
    });
    
    // Write to file
    fs.writeFileSync(reportPath, mdContent);
    
    return reportPath;
  } catch (error) {
    logger.error('Failed to generate Markdown report:', error);
    throw error;
  }
}

/**
 * Send report notification
 * @param {Object} options - Notification options
 * @returns {Promise<void>}
 */
async function sendReportNotification(options = {}) {
  const { type, reportUrl, stats, recipients } = options;
  
  if (!type || !reportUrl) {
    throw new Error('Notification type and report URL are required');
  }
  
  logger.info(`Sending ${type} notification for report: ${reportUrl}`);
  
  try {
    switch (type.toLowerCase()) {
      case 'slack':
        await sendSlackNotification(reportUrl, stats, options);
        break;
        
      case 'teams':
        await sendTeamsNotification(reportUrl, stats, options);
        break;
        
      case 'email':
        await sendEmailNotification(reportUrl, stats, recipients, options);
        break;
        
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }
    
    logger.info('Notification sent successfully');
  } catch (error) {
    logger.error('Failed to send notification:', error);
    throw error;
  }
}

/**
 * Calculate statistics from test results
 * @param {Array} results - Test results
 * @returns {Object} Statistics
 * @private
 */
function calculateStats(results) {
  const stats = {
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  };
  
  for (const suite of results) {
    for (const test of suite.tests) {
      if (test.status === 'passed') stats.passed++;
      else if (test.status === 'failed') stats.failed++;
      else if (test.status === 'skipped') stats.skipped++;
      
      stats.duration += test.duration || 0;
    }
  }
  
  return stats;
}

/**
 * Get test results from directory
 * @param {string} resultsDir - Results directory
 * @returns {Array} Test results
 * @private
 */
function getTestResults(resultsDir) {
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
                suite: suite.title,
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
      logger.error(`Failed to parse test results file ${file}:`, error);
    }
  }
  
  return results;
}

/**
 * Generate JUnit XML
 * @param {Array} results - Test results
 * @returns {string} JUnit XML
 * @private
 */
function generateJUnitXml(results) {
  // Group results by suite
  const suites = {};
  
  for (const result of results) {
    const suiteName = result.suite || 'Default Suite';
    if (!suites[suiteName]) {
      suites[suiteName] = [];
    }
    
    suites[suiteName].push(result);
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
 * Get default HTML template
 * @returns {string} Default template
 * @private
 */
function getDefaultTemplate() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
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
    
    .test-suite {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .test-suite h3 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .test-case {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    .test-case.passed {
      border-left: 5px solid #27ae60;
    }
    .test-case.failed {
      border-left: 5px solid #e74c3c;
    }
    .test-case.skipped {
      border-left: 5px solid #f39c12;
    }
    .test-case h4 {
      margin-top: 0;
      margin-bottom: 10px;
    }
    .test-case .duration {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .error-details {
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
    .media h5 {
      margin-bottom: 5px;
    }
    .media img {
      max-width: 100%;
      border: 1px solid #ddd;
      margin-bottom: 10px;
    }
    .media video {
      max-width: 100%;
      border: 1px solid #ddd;
      margin-bottom: 10px;
    }
    .media a {
      display: inline-block;
      padding: 5px 10px;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 3px;
      margin-bottom: 10px;
    }
    .logs {
      background-color: #f1f1f1;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 10px;
    }
    .custom-data {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1><%= title %></h1>
  
  <div class="summary">
    <p><strong>Generated:</strong> <%= new Date().toLocaleString() %></p>
    <p><strong>Environment:</strong> <%= process.env.NODE_ENV || 'development' %></p>
    
    <div class="stats">
      <div class="stat passed">
        <h3>Passed</h3>
        <div class="value"><%= stats.passed %></div>
      </div>
      <div class="stat failed">
        <h3>Failed</h3>
        <div class="value"><%= stats.failed %></div>
      </div>
      <div class="stat skipped">
        <h3>Skipped</h3>
        <div class="value"><%= stats.skipped %></div>
      </div>
      <div class="stat duration">
        <h3>Duration</h3>
        <div class="value"><%= formatDuration(stats.duration) %></div>
      </div>
    </div>
  </div>
  
  <% if (Object.keys(customData).length > 0) { %>
    <h2>Custom Data</h2>
    <div class="custom-data">
      <% for (const [key, value] of Object.entries(customData)) { %>
        <p><strong><%= key %>:</strong> <%= typeof value === 'object' ? JSON.stringify(value) : value %></p>
      <% } %>
    </div>
  <% } %>
  
  <h2>Test Results</h2>
  
  <% for (const suite of results) { %>
    <div class="test-suite">
      <h3><%= suite.name %></h3>
      
      <% for (const test of suite.tests) { %>
        <div class="test-case <%= test.status %>">
          <h4><%= test.name %></h4>
          <div class="duration">Duration: <%= formatDuration(test.duration) %></div>
          
          <% if (test.status === 'failed' && test.error) { %>
            <div class="error-details">
              <strong>Error:</strong> <%= test.error.message %>
              <% if (test.error.stack) { %>
                <br><br><%= test.error.stack %>
              <% } %>
            </div>
          <% } %>
          
          <% if (includeScreenshots && test.screenshots && test.screenshots.length > 0) { %>
            <div class="media">
              <h5>Screenshots:</h5>
              <% for (const screenshot of test.screenshots) { %>
                <img src="<%= screenshot.path %>" alt="<%= screenshot.name || 'Screenshot' %>">
              <% } %>
            </div>
          <% } %>
          
          <% if (includeVideos && test.videos && test.videos.length > 0) { %>
            <div class="media">
              <h5>Videos:</h5>
              <% for (const video of test.videos) { %>
                <video controls>
                  <source src="<%= video.path %>" type="video/webm">
                  Your browser does not support the video tag.
                </video>
              <% } %>
            </div>
          <% } %>
          
          <% if (includeTraces && test.traces && test.traces.length > 0) { %>
            <div class="media">
              <h5>Traces:</h5>
              <% for (const trace of test.traces) { %>
                <a href="<%= trace.path %>" target="_blank">View Trace</a>
              <% } %>
            </div>
          <% } %>
          
          <% if (includeLogs && test.logs && test.logs.length > 0) { %>
            <div class="logs">
              <% for (const log of test.logs) { %>
                [<%= log.timestamp %>] [<%= log.level %>] <%= log.message %><br>
              <% } %>
            </div>
          <% } %>
        </div>
      <% } %>
    </div>
  <% } %>
  
  <script>
    // Add any client-side JavaScript here
  </script>
</body>
</html>
  `;
}

/**
 * Send Slack notification
 * @param {string} reportUrl - Report URL
 * @param {Object} stats - Test statistics
 * @param {Object} options - Notification options
 * @returns {Promise<void>}
 * @private
 */
async function sendSlackNotification(reportUrl, stats, options) {
  // Implementation would use Slack API
  logger.info('Slack notification not implemented');
}

/**
 * Send Teams notification
 * @param {string} reportUrl - Report URL
 * @param {Object} stats - Test statistics
 * @param {Object} options - Notification options
 * @returns {Promise<void>}
 * @private
 */
async function sendTeamsNotification(reportUrl, stats, options) {
  // Implementation would use Teams API
  logger.info('Teams notification not implemented');
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
async function sendEmailNotification(reportUrl, stats, recipients, options) {
  // Implementation would use email service
  logger.info('Email notification not implemented');
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 * @private
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Attach a screenshot to the test report
 * @param {string} screenshotPath - Path to the screenshot
 * @param {string} name - Name of the screenshot
 * @param {Object} testInfo - Test information object
 */
async function attachScreenshot(screenshotPath, name, testInfo) {
  try {
    if (!fs.existsSync(screenshotPath)) {
      logger.warn(`Screenshot not found: ${screenshotPath}`);
      return;
    }
    
    await testInfo.attach(name || 'Screenshot', {
      path: screenshotPath,
      contentType: 'image/png'
    });
    
    logger.info(`Screenshot attached: ${screenshotPath}`);
  } catch (error) {
    logger.error('Failed to attach screenshot:', error);
  }
}

/**
 * Attach a log message to the test report
 * @param {string} message - Log message
 * @param {string} name - Log name
 * @param {Object} testInfo - Test information object (optional)
 */
function attachLog(message, name = 'Log', testInfo = null) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: message
    };
    
    logger.info(`${name}: ${message}`);
    
    if (testInfo) {
      testInfo.attach(name, {
        body: JSON.stringify(logEntry),
        contentType: 'text/plain'
      });
    }
    
    return logEntry;
  } catch (error) {
    logger.error('Failed to attach log:', error);
    return null;
  }
}

module.exports = {
  // HTML report generation
  generateHtmlReport,
  processPlaywrightResults,
  
  // Allure report generation
  generateAllureReport,
  openAllureReport,
  
  // Other report formats
  generateJUnitReport,
  generateMarkdownReport,
  
  // Notifications
  sendReportNotification,
  
  // Attachment utilities
  attachScreenshot,
  attachLog
};