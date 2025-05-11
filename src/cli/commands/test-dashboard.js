/**
 * Test-dashboard command for the CLI
 *
 * This command generates a test quality dashboard
 */
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/common/logger');
const TestQualityDashboard = require('../../utils/ci/testQualityDashboard');

/**
 * Generate test quality dashboard
 * @param {Object} options - Command options
 */
module.exports = async (options = {}) => {
  try {
    logger.info('Generating test quality dashboard...');
    
    const dataDir = options.dataDir || path.join(process.cwd(), 'reports/dashboard');
    const outputPath = options.output || path.join(process.cwd(), 'reports/dashboard/index.html');
    
    // Create dashboard instance
    const dashboard = new TestQualityDashboard({
      dataDir,
      historySize: options.historySize ? parseInt(options.historySize, 10) : 10
    });
    
    // Check if we need to add a new test run
    if (options.addRun) {
      const resultsDir = options.resultsDir || path.join(process.cwd(), 'test-results');
      const runData = await collectTestRunData(resultsDir, options);
      
      if (runData) {
        await dashboard.addTestRun(runData);
        logger.info('Added new test run data to dashboard');
      }
    }
    
    // Generate dashboard
    const dashboardPath = await dashboard.generateDashboard(outputPath);
    
    logger.info(`Dashboard generated at: ${dashboardPath}`);
    
    // Open dashboard if requested
    if (options.open) {
      try {
        const platform = process.platform;
        
        if (platform === 'win32') {
          require('child_process').execSync(`start "" "${dashboardPath}"`);
        } else if (platform === 'darwin') {
          require('child_process').execSync(`open "${dashboardPath}"`);
        } else {
          require('child_process').execSync(`xdg-open "${dashboardPath}"`);
        }
      } catch (error) {
        logger.warn('Failed to open dashboard:', error.message);
      }
    }
    
    return { path: dashboardPath };
  } catch (error) {
    logger.error('Error generating test dashboard:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
  }
};

/**
 * Collect test run data from results directory
 * @param {string} resultsDir - Results directory
 * @param {Object} options - Command options
 * @returns {Promise<Object>} Test run data
 */
async function collectTestRunData(resultsDir, options = {}) {
  try {
    // Check if results directory exists
    if (!fs.existsSync(resultsDir)) {
      logger.warn(`Results directory not found: ${resultsDir}`);
      return null;
    }
    
    // Find JSON result files
    const jsonFiles = findFiles(resultsDir, '.json');
    
    if (jsonFiles.length === 0) {
      logger.warn('No JSON result files found');
      return null;
    }
    
    // Process result files
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };
    
    const testResults = [];
    
    for (const file of jsonFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        
        // Extract test results
        if (data.suites) {
          for (const suite of data.suites) {
            if (Array.isArray(suite.specs)) {
              for (const spec of suite.specs) {
                summary.total++;
                
                if (spec.status === 'passed') {
                  summary.passed++;
                } else if (spec.status === 'failed') {
                  summary.failed++;
                } else {
                  summary.skipped++;
                }
                
                summary.duration += spec.duration || 0;
                
                testResults.push({
                  title: spec.title,
                  status: spec.status,
                  duration: spec.duration,
                  error: spec.error
                });
              }
            }
          }
        }
      } catch (error) {
        logger.warn(`Error processing result file ${file}:`, error.message);
      }
    }
    
    // Calculate pass rate
    summary.passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
    
    // Create run data
    return {
      runId: options.runId || `run-${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary,
      testResults
    };
  } catch (error) {
    logger.error('Error collecting test run data:', error);
    return null;
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