/**
 * Report generation utility for Playwright tests
 */
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../common/logger');

/**
 * Generate HTML report from test results
 * @param {Object} options - Report options
 * @returns {Promise<string>} Path to the generated report
 */
async function generateReport(options = {}) {
  try {
    // Set default options
    const reportOptions = {
      title: options.title || 'Playwright Test Report',
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
      const defaultTemplate = `
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
      
      fs.writeFileSync(reportOptions.templatePath, defaultTemplate);
    }
    
    // Calculate statistics
    const stats = {
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };
    
    for (const suite of reportOptions.results) {
      for (const test of suite.tests) {
        if (test.status === 'passed') stats.passed++;
        else if (test.status === 'failed') stats.failed++;
        else if (test.status === 'skipped') stats.skipped++;
        
        stats.duration += test.duration || 0;
      }
    }
    
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
    logger.error('Failed to generate report:', error);
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
    const { execSync } = require('child_process');
    
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
 * Create Allure test result
 * @param {Object} test - Test data
 * @param {Object} options - Options
 * @returns {string} Path to the result file
 */
function createAllureResult(test, options = {}) {
  try {
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
    
    if (test.videos && test.videos.length > 0) {
      for (const video of test.videos) {
        const name = video.name || `Video-${Date.now()}`;
        const source = `${uuidv4()}-${path.basename(video.path)}`;
        
        // Copy video to allure results directory
        fs.copyFileSync(video.path, path.join(resultOptions.resultsDir, source));
        
        result.attachments.push({
          name,
          source,
          type: 'video/webm'
        });
      }
    }
    
    if (test.traces && test.traces.length > 0) {
      for (const trace of test.traces) {
        const name = trace.name || `Trace-${Date.now()}`;
        const source = `${uuidv4()}-${path.basename(trace.path)}`;
        
        // Copy trace to allure results directory
        fs.copyFileSync(trace.path, path.join(resultOptions.resultsDir, source));
        
        result.attachments.push({
          name,
          source,
          type: 'application/zip'
        });
      }
    }
    
    // Write result to file
    const resultPath = path.join(resultOptions.resultsDir, `${result.uuid}-result.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result));
    
    return resultPath;
  } catch (error) {
    logger.error('Failed to create Allure result:', error);
    throw error;
  }
}

module.exports = {
  generateReport,
  processPlaywrightResults,
  generateAllureReport,
  createAllureResult
};