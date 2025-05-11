/**
 * Test-report command for the CLI
 *
 * This command generates comprehensive test reports
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../../utils/common/logger');

/**
 * Generate test reports
 * @param {Object} options - Command options
 */
module.exports = async (options = {}) => {
  try {
    logger.info('Generating test reports...');
    
    const reportDir = options.outputDir || path.join(process.cwd(), 'reports');
    const reportTypes = options.types || ['html'];
    const testResults = options.resultsDir || path.join(process.cwd(), 'test-results');
    
    // Ensure report directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Generate reports based on types
    for (const type of reportTypes) {
      try {
        switch (type.toLowerCase()) {
          case 'html':
            await generateHtmlReport(testResults, reportDir, options);
            break;
          case 'markdown':
            await generateMarkdownReport(testResults, reportDir, options);
            break;
          case 'json':
            await generateJsonReport(testResults, reportDir, options);
            break;
          default:
            logger.warn(`Unknown report type: ${type}`);
        }
      } catch (error) {
        logger.error(`Error generating ${type} report:`, error.message);
      }
    }
    
    // Generate summary report
    await generateSummaryReport(testResults, reportDir, options);
    
    logger.info('Test reports generated successfully');
    
    // Open reports if requested
    if (options.open) {
      try {
        const platform = process.platform;
        const htmlReportPath = path.join(reportDir, 'html', 'index.html');
        
        if (fs.existsSync(htmlReportPath)) {
          logger.info('Opening HTML report...');
          
          if (platform === 'win32') {
            execSync(`start "" "${htmlReportPath}"`);
          } else if (platform === 'darwin') {
            execSync(`open "${htmlReportPath}"`);
          } else {
            execSync(`xdg-open "${htmlReportPath}"`);
          }
        }
      } catch (error) {
        logger.warn('Failed to open report:', error.message);
      }
    }
    
    return {
      reportDir,
      reportTypes,
      success: true
    };
  } catch (error) {
    logger.error('Error generating test reports:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate HTML report
 * @param {string} testResults - Test results directory
 * @param {string} reportDir - Report output directory
 * @param {Object} options - Report options
 */
async function generateHtmlReport(testResults, reportDir, options = {}) {
  logger.info('Generating HTML report...');
  
  const htmlReportDir = path.join(reportDir, 'html');
  
  // Ensure directory exists
  if (!fs.existsSync(htmlReportDir)) {
    fs.mkdirSync(htmlReportDir, { recursive: true });
  }
  
  try {
    execSync(`npx playwright show-report "${testResults}" --output "${htmlReportDir}"`, {
      stdio: options.verbose ? 'inherit' : 'pipe'
    });
    
    logger.info(`HTML report generated at: ${htmlReportDir}`);
  } catch (error) {
    // If show-report fails, try to copy the report directly
    try {
      if (fs.existsSync(path.join(testResults, 'index.html'))) {
        execSync(`cp -r "${testResults}"/* "${htmlReportDir}/"`, {
          stdio: options.verbose ? 'inherit' : 'pipe'
        });
        logger.info(`HTML report copied to: ${htmlReportDir}`);
      } else {
        throw new Error('No HTML report found in test results');
      }
    } catch (copyError) {
      throw new Error(`Failed to generate HTML report: ${copyError.message}`);
    }
  }
}

/**
 * Generate JSON report
 * @param {string} testResults - Test results directory
 * @param {string} reportDir - Report output directory
 * @param {Object} options - Report options
 */
async function generateJsonReport(testResults, reportDir, options = {}) {
  logger.info('Generating JSON report...');
  
  const jsonReportDir = path.join(reportDir, 'json');
  
  // Ensure directory exists
  if (!fs.existsSync(jsonReportDir)) {
    fs.mkdirSync(jsonReportDir, { recursive: true });
  }
  
  try {
    // Look for JSON result files
    const jsonFiles = findFiles(testResults, '.json');
    
    if (jsonFiles.length === 0) {
      logger.warn('No JSON result files found in test results');
      return;
    }
    
    // Copy JSON files to report directory
    jsonFiles.forEach(file => {
      const destFile = path.join(jsonReportDir, path.basename(file));
      fs.copyFileSync(file, destFile);
    });
    
    // Generate combined JSON report
    const combinedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      results: []
    };
    
    // Process each JSON file
    jsonFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const data = JSON.parse(content);
        
        // Extract test results and update summary
        if (Array.isArray(data.suites)) {
          data.suites.forEach(suite => {
            if (Array.isArray(suite.specs)) {
              suite.specs.forEach(spec => {
                combinedReport.summary.total++;
                
                if (spec.status === 'passed') {
                  combinedReport.summary.passed++;
                } else if (spec.status === 'failed') {
                  combinedReport.summary.failed++;
                } else {
                  combinedReport.summary.skipped++;
                }
                
                combinedReport.summary.duration += spec.duration || 0;
                
                combinedReport.results.push({
                  title: spec.title,
                  fullTitle: `${suite.title} ${spec.title}`,
                  file: suite.file,
                  status: spec.status,
                  duration: spec.duration,
                  error: spec.error
                });
              });
            }
          });
        }
      } catch (parseError) {
        logger.debug(`Failed to parse JSON file ${file}: ${parseError.message}`);
      }
    });
    
    // Write combined report
    const combinedReportPath = path.join(jsonReportDir, 'combined-report.json');
    fs.writeFileSync(combinedReportPath, JSON.stringify(combinedReport, null, 2));
    
    logger.info(`JSON reports copied to: ${jsonReportDir}`);
    logger.info(`Combined JSON report generated at: ${combinedReportPath}`);
  } catch (error) {
    throw new Error(`Failed to generate JSON report: ${error.message}`);
  }
}

/**
 * Generate Markdown report
 * @param {string} testResults - Test results directory
 * @param {string} reportDir - Report output directory
 * @param {Object} options - Report options
 */
async function generateMarkdownReport(testResults, reportDir, options = {}) {
  logger.info('Generating Markdown report...');
  
  const mdReportDir = path.join(reportDir, 'markdown');
  
  // Ensure directory exists
  if (!fs.existsSync(mdReportDir)) {
    fs.mkdirSync(mdReportDir, { recursive: true });
  }
  
  try {
    // Look for JSON result files to convert to Markdown
    const jsonFiles = findFiles(testResults, '.json');
    
    if (jsonFiles.length === 0) {
      logger.warn('No JSON result files found for Markdown conversion');
      return;
    }
    
    // Generate Markdown report
    const reportPath = path.join(mdReportDir, 'test-report.md');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    let mdContent = `# Test Execution Report\n\n`;
    mdContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    
    // Process each JSON file
    jsonFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const data = JSON.parse(content);
        
        if (Array.isArray(data.suites)) {
          data.suites.forEach(suite => {
            mdContent += `## ${suite.title || 'Unnamed Suite'}\n\n`;
            
            if (Array.isArray(suite.specs)) {
              mdContent += `| Test | Status | Duration |\n`;
              mdContent += `| ---- | ------ | -------- |\n`;
              
              suite.specs.forEach(spec => {
                totalTests++;
                
                let statusEmoji = '⏺️';
                if (spec.status === 'passed') {
                  statusEmoji = '✅';
                  passedTests++;
                } else if (spec.status === 'failed') {
                  statusEmoji = '❌';
                  failedTests++;
                } else {
                  statusEmoji = '⏭️';
                  skippedTests++;
                }
                
                const duration = spec.duration ? `${(spec.duration / 1000).toFixed(2)}s` : 'N/A';
                
                mdContent += `| ${spec.title} | ${statusEmoji} ${spec.status} | ${duration} |\n`;
                
                // Add error details for failed tests
                if (spec.status === 'failed' && spec.error) {
                  mdContent += `\n<details>\n<summary>Error Details</summary>\n\n\`\`\`\n${spec.error.message || 'Unknown error'}\n\`\`\`\n</details>\n\n`;
                }
              });
              
              mdContent += `\n`;
            }
          });
        }
      } catch (parseError) {
        logger.debug(`Failed to parse JSON file ${file}: ${parseError.message}`);
      }
    });
    
    // Add summary
    mdContent = `# Test Execution Report\n\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `## Summary\n\n` +
      `- Total Tests: ${totalTests}\n` +
      `- Passed: ${passedTests} (${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%)\n` +
      `- Failed: ${failedTests} (${totalTests > 0 ? Math.round((failedTests / totalTests) * 100) : 0}%)\n` +
      `- Skipped: ${skippedTests} (${totalTests > 0 ? Math.round((skippedTests / totalTests) * 100) : 0}%)\n\n` +
      mdContent;
    
    // Write Markdown report
    fs.writeFileSync(reportPath, mdContent);
    
    logger.info(`Markdown report generated at: ${reportPath}`);
  } catch (error) {
    throw new Error(`Failed to generate Markdown report: ${error.message}`);
  }
}

/**
 * Generate summary report
 * @param {string} testResults - Test results directory
 * @param {string} reportDir - Report output directory
 * @param {Object} options - Report options
 */
async function generateSummaryReport(testResults, reportDir, options = {}) {
  logger.info('Generating summary report...');
  
  const summaryPath = path.join(reportDir, 'summary.json');
  
  try {
    // Look for JSON result files
    const jsonFiles = findFiles(testResults, '.json');
    
    if (jsonFiles.length === 0) {
      logger.warn('No JSON result files found for summary');
      return;
    }
    
    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      duration: 0,
      passRate: 0,
      browsers: {},
      slowestTests: [],
      failedTests: []
    };
    
    // Process each JSON file
    jsonFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const data = JSON.parse(content);
        
        if (Array.isArray(data.suites)) {
          data.suites.forEach(suite => {
            if (Array.isArray(suite.specs)) {
              suite.specs.forEach(spec => {
                summary.total++;
                
                // Track browser stats
                const browser = spec.browser || 'unknown';
                if (!summary.browsers[browser]) {
                  summary.browsers[browser] = { total: 0, passed: 0, failed: 0 };
                }
                summary.browsers[browser].total++;
                
                if (spec.status === 'passed') {
                  summary.passed++;
                  summary.browsers[browser].passed++;
                } else if (spec.status === 'failed') {
                  summary.failed++;
                  summary.browsers[browser].failed++;
                  
                  // Track failed tests
                  summary.failedTests.push({
                    title: spec.title,
                    fullTitle: `${suite.title} ${spec.title}`,
                    file: suite.file,
                    duration: spec.duration,
                    error: spec.error ? spec.error.message : 'Unknown error'
                  });
                } else {
                  summary.skipped++;
                }
                
                // Track flaky tests
                if (spec.flaky) {
                  summary.flaky++;
                }
                
                // Track duration
                if (spec.duration) {
                  summary.duration += spec.duration;
                  
                  // Track slow tests
                  summary.slowestTests.push({
                    title: spec.title,
                    fullTitle: `${suite.title} ${spec.title}`,
                    file: suite.file,
                    duration: spec.duration
                  });
                }
              });
            }
          });
        }
      } catch (parseError) {
        logger.debug(`Failed to parse JSON file ${file}: ${parseError.message}`);
      }
    });
    
    // Calculate pass rate
    summary.passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
    
    // Sort and limit slowest tests
    summary.slowestTests.sort((a, b) => b.duration - a.duration);
    summary.slowestTests = summary.slowestTests.slice(0, 10);
    
    // Write summary report
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Print summary
    logger.info('\n📊 Test Execution Summary');
    logger.info(`Total Tests: ${summary.total}`);
    logger.info(`Passed: ${summary.passed} (${summary.passRate.toFixed(2)}%)`);
    logger.info(`Failed: ${summary.failed}`);
    logger.info(`Skipped: ${summary.skipped}`);
    logger.info(`Flaky: ${summary.flaky}`);
    logger.info(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    
    logger.info(`Summary report generated at: ${summaryPath}`);
  } catch (error) {
    throw new Error(`Failed to generate summary report: ${error.message}`);
  }
}

/**
 * Find files with specific extension in directory
 * @param {string} dir - Directory to search
 * @param {string} ext - File extension to find
 * @returns {Array<string>} Array of file paths
 */
function findFiles(dir, ext) {
  const results = [];
  
  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverse(filePath);
      } else if (path.extname(file) === ext) {
        results.push(filePath);
      }
    }
  }
  
  traverse(dir);
  return results;
}