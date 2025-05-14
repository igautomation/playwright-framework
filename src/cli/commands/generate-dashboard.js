/**
 * Generate-dashboard command for the CLI
 *
 * This command generates a dashboard from test data
 */
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/common/logger');
const { startServer } = require('../../dashboard/server');

/**
 * Generate dashboard from test data
 * @param {Object} options - Command options
 */
module.exports = async (options = {}) => {
  try {
    logger.info('Generating dashboard from test data...');
    
    const dataDir = options.dataDir || path.join(process.cwd(), 'data');
    const port = options.port || process.env.PORT || 3000;
    
    // Set port in environment variable
    process.env.PORT = port;
    
    // Configure email for scheduled reports if provided
    if (options.email) {
      try {
        const emailConfig = JSON.parse(options.email);
        const { ReportScheduler } = require('../../utils/scheduler');
        const scheduler = new ReportScheduler();
        scheduler.setEmailConfig(emailConfig);
        logger.info('Email configuration set for scheduled reports');
      } catch (error) {
        logger.error('Invalid email configuration', error);
      }
    }
    
    // Ensure data directories exist
    const dataDirs = [
      path.join(dataDir, 'extracted'),
      path.join(dataDir, 'extracted/json'),
      path.join(dataDir, 'extracted/csv'),
      path.join(dataDir, 'extracted/uploads'),
      path.join(dataDir, 'schedules'),
      path.join(dataDir, 'templates'),
      path.join(dataDir, 'history')
    ];
    
    dataDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Ensure reports directories exist
    const reportsDirs = [
      path.join(process.cwd(), 'reports/charts/dashboard'),
      path.join(process.cwd(), 'reports/charts/scheduled')
    ];
    
    reportsDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Copy test data to dashboard data directory if specified
    if (options.testResults) {
      const testResultsDir = path.resolve(process.cwd(), options.testResults);
      const dashboardDataDir = path.join(dataDir, 'extracted/json');
      
      if (fs.existsSync(testResultsDir)) {
        logger.info(`Copying test results from ${testResultsDir} to ${dashboardDataDir}`);
        
        // Find JSON files in test results directory
        const jsonFiles = findFiles(testResultsDir, '.json');
        
        // Copy each file
        jsonFiles.forEach(file => {
          const destFile = path.join(dashboardDataDir, path.basename(file));
          fs.copyFileSync(file, destFile);
        });
        
        logger.info(`Copied ${jsonFiles.length} test result files`);
      } else {
        logger.warn(`Test results directory not found: ${testResultsDir}`);
      }
    }
    
    // Start dashboard server
    logger.info(`Starting dashboard server on port ${port}...`);
    startServer();
    
    // Open browser if requested
    if (options.open) {
      try {
        const open = require('open');
        open(`http://localhost:${port}`);
      } catch (error) {
        logger.warn('Failed to open browser:', error.message);
      }
    }
    
    logger.info(`Dashboard server running at http://localhost:${port}`);
    
    return {
      port,
      url: `http://localhost:${port}`
    };
  } catch (error) {
    logger.error('Error generating dashboard:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
  }
};

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