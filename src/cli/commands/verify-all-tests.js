/**
 * Verify-all-tests command for the CLI
 *
 * This command runs a comprehensive verification of all tests in the project:
 * 1. Runs Jest unit tests
 * 2. Runs Playwright tests
 * 3. Runs framework validation
 * 4. Runs test file verification
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/common/logger');
const verifyTests = require('./verify-tests');

/**
 * Verify all tests in the project
 * @param {Object} options - Command options
 */
module.exports = (options = {}) => {
  try {
    logger.info('🔍 Starting comprehensive test verification...');
    
    // Results tracking
    const results = {
      unitTests: { status: 'pending', passed: 0, failed: 0 },
      playwrightTests: { status: 'pending', passed: 0, failed: 0 },
      frameworkValidation: { status: 'pending', passed: 0, failed: 0, warnings: 0 },
      testVerification: { status: 'pending', passed: 0, failed: 0, warnings: 0, totalTests: 0 }
    };
    
    // Step 1: Run Jest unit tests
    logger.info('\n📋 Running Jest unit tests...');
    try {
      const unitTestOutput = execSync('npm run test:unit', { 
        stdio: options.verbose ? 'inherit' : 'pipe' 
      }).toString();
      
      results.unitTests.status = 'passed';
      
      // Try to parse test results
      const passedMatch = unitTestOutput.match(/(\d+) passing/i);
      const failedMatch = unitTestOutput.match(/(\d+) failing/i);
      
      results.unitTests.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      results.unitTests.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      logger.info(`✅ Unit tests completed successfully: ${results.unitTests.passed} passed, ${results.unitTests.failed} failed`);
    } catch (error) {
      results.unitTests.status = 'failed';
      logger.error(`❌ Unit tests failed: ${error.message}`);
      
      // Try to extract test results from error output
      if (error.stdout) {
        const passedMatch = error.stdout.toString().match(/(\d+) passing/i);
        const failedMatch = error.stdout.toString().match(/(\d+) failing/i);
        
        results.unitTests.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        results.unitTests.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      }
    }
    
    // Step 2: Run Playwright tests
    logger.info('\n📋 Running Playwright tests...');
    try {
      const playwrightTestOutput = execSync('npm test -- --reporter=list', { 
        stdio: options.verbose ? 'inherit' : 'pipe' 
      }).toString();
      
      results.playwrightTests.status = 'passed';
      
      // Try to parse test results
      const passedMatch = playwrightTestOutput.match(/(\d+) passed/i);
      const failedMatch = playwrightTestOutput.match(/(\d+) failed/i);
      
      results.playwrightTests.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      results.playwrightTests.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      logger.info(`✅ Playwright tests completed successfully: ${results.playwrightTests.passed} passed, ${results.playwrightTests.failed} failed`);
    } catch (error) {
      results.playwrightTests.status = 'failed';
      logger.error(`❌ Playwright tests failed: ${error.message}`);
      
      // Try to extract test results from error output
      if (error.stdout) {
        const passedMatch = error.stdout.toString().match(/(\d+) passed/i);
        const failedMatch = error.stdout.toString().match(/(\d+) failed/i);
        
        results.playwrightTests.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        results.playwrightTests.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      }
    }
    
    // Step 3: Run framework validation
    logger.info('\n📋 Running framework validation...');
    try {
      const validationOutput = execSync('npm run validate:framework', { 
        stdio: options.verbose ? 'inherit' : 'pipe' 
      }).toString();
      
      results.frameworkValidation.status = 'passed';
      
      // Try to parse validation results
      const passedMatch = validationOutput.match(/Passed: (\d+)/);
      const warningsMatch = validationOutput.match(/Warnings: (\d+)/);
      const failedMatch = validationOutput.match(/Failed: (\d+)/);
      
      results.frameworkValidation.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      results.frameworkValidation.warnings = warningsMatch ? parseInt(warningsMatch[1]) : 0;
      results.frameworkValidation.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      logger.info(`✅ Framework validation completed successfully: ${results.frameworkValidation.passed} passed, ${results.frameworkValidation.warnings} warnings, ${results.frameworkValidation.failed} failed`);
    } catch (error) {
      results.frameworkValidation.status = 'failed';
      logger.error(`❌ Framework validation failed: ${error.message}`);
      
      // Try to extract validation results from error output
      if (error.stdout) {
        const passedMatch = error.stdout.toString().match(/Passed: (\d+)/);
        const warningsMatch = error.stdout.toString().match(/Warnings: (\d+)/);
        const failedMatch = error.stdout.toString().match(/Failed: (\d+)/);
        
        results.frameworkValidation.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        results.frameworkValidation.warnings = warningsMatch ? parseInt(warningsMatch[1]) : 0;
        results.frameworkValidation.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      }
    }
    
    // Step 4: Run test file verification
    logger.info('\n📋 Running test file verification...');
    try {
      // Run verify-tests directly
      const verifyOptions = {
        dir: path.join(process.cwd(), 'src/tests'),
        pattern: '**/*.spec.js',
        ignoreErrors: true,
        verbose: options.verbose
      };
      
      const verificationResults = verifyTests(verifyOptions);
      
      if (verificationResults) {
        results.testVerification.status = verificationResults.failedChecks > 0 ? 'failed' : 'passed';
        results.testVerification.passed = verificationResults.passedChecks;
        results.testVerification.failed = verificationResults.failedChecks;
        results.testVerification.warnings = verificationResults.warnings;
        results.testVerification.totalTests = verificationResults.totalTests;
        
        logger.info(`✅ Test verification completed: ${verificationResults.passedChecks} passed, ${verificationResults.failedChecks} failed, ${verificationResults.warnings} warnings`);
      } else {
        results.testVerification.status = 'failed';
        logger.error('❌ Test verification failed to return results');
      }
    } catch (error) {
      results.testVerification.status = 'failed';
      logger.error(`❌ Test verification failed: ${error.message}`);
    }
    
    // Generate summary report
    generateSummaryReport(results, options);
    
    // Exit with appropriate code
    const hasFailures = 
      results.unitTests.status === 'failed' || 
      results.playwrightTests.status === 'failed' || 
      results.frameworkValidation.status === 'failed' ||
      results.testVerification.status === 'failed';
    
    if (hasFailures && !options.ignoreErrors) {
      logger.error('\n❌ Test verification failed!');
      process.exit(1);
    } else if (hasFailures) {
      logger.warn('\n⚠️ Test verification failed but errors are being ignored.');
    } else {
      logger.info('\n✅ All test verifications passed successfully!');
    }
    
    return results;
  } catch (error) {
    logger.error('Error during test verification:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
  }
};

/**
 * Generate a summary report of the verification results
 * @param {Object} results - Verification results
 * @param {Object} options - Command options
 */
function generateSummaryReport(results, options = {}) {
  logger.info('\n📊 Test Verification Summary');
  logger.info('==============================');
  
  logger.info('\nUnit Tests:');
  logger.info(`  Status: ${results.unitTests.status.toUpperCase()}`);
  logger.info(`  Passed: ${results.unitTests.passed}`);
  logger.info(`  Failed: ${results.unitTests.failed}`);
  
  logger.info('\nPlaywright Tests:');
  logger.info(`  Status: ${results.playwrightTests.status.toUpperCase()}`);
  logger.info(`  Passed: ${results.playwrightTests.passed}`);
  logger.info(`  Failed: ${results.playwrightTests.failed}`);
  
  logger.info('\nFramework Validation:');
  logger.info(`  Status: ${results.frameworkValidation.status.toUpperCase()}`);
  logger.info(`  Passed: ${results.frameworkValidation.passed}`);
  logger.info(`  Warnings: ${results.frameworkValidation.warnings}`);
  logger.info(`  Failed: ${results.frameworkValidation.failed}`);
  
  logger.info('\nTest File Verification:');
  logger.info(`  Status: ${results.testVerification.status.toUpperCase()}`);
  logger.info(`  Tests Found: ${results.testVerification.totalTests}`);
  logger.info(`  Passed Checks: ${results.testVerification.passed}`);
  logger.info(`  Failed Checks: ${results.testVerification.failed}`);
  logger.info(`  Warnings: ${results.testVerification.warnings}`);
  
  // Generate HTML report if requested
  if (options.generateReport) {
    const reportsDir = path.resolve(process.cwd(), 'reports/verification');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'verification-report.html');
    const html = generateHtmlReport(results);
    fs.writeFileSync(reportPath, html);
    
    logger.info(`\n📄 HTML report generated: ${reportPath}`);
  }
}

/**
 * Generate an HTML report of the verification results
 * @param {Object} results - Verification results
 * @returns {string} HTML report
 */
function generateHtmlReport(results) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Verification Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1, h2 {
          color: #333;
        }
        .dashboard {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          flex: 1;
          min-width: 250px;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .card h3 {
          margin-top: 0;
        }
        .passed { background-color: #d4edda; color: #155724; }
        .warning { background-color: #fff3cd; color: #856404; }
        .failed { background-color: #f8d7da; color: #721c24; }
        .metric {
          font-size: 36px;
          font-weight: bold;
          margin: 10px 0;
        }
        .timestamp {
          color: #6c757d;
          font-size: 14px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Comprehensive Test Verification Report</h1>
        <p>This report shows the results of the comprehensive test verification.</p>
        
        <h2>Unit Tests</h2>
        <div class="dashboard">
          <div class="card ${results.unitTests.status === 'passed' ? 'passed' : 'failed'}">
            <h3>Status</h3>
            <div class="metric">${results.unitTests.status.toUpperCase()}</div>
          </div>
          <div class="card passed">
            <h3>Passed Tests</h3>
            <div class="metric">${results.unitTests.passed}</div>
          </div>
          <div class="card ${results.unitTests.failed > 0 ? 'failed' : 'passed'}">
            <h3>Failed Tests</h3>
            <div class="metric">${results.unitTests.failed}</div>
          </div>
        </div>
        
        <h2>Playwright Tests</h2>
        <div class="dashboard">
          <div class="card ${results.playwrightTests.status === 'passed' ? 'passed' : 'failed'}">
            <h3>Status</h3>
            <div class="metric">${results.playwrightTests.status.toUpperCase()}</div>
          </div>
          <div class="card passed">
            <h3>Passed Tests</h3>
            <div class="metric">${results.playwrightTests.passed}</div>
          </div>
          <div class="card ${results.playwrightTests.failed > 0 ? 'failed' : 'passed'}">
            <h3>Failed Tests</h3>
            <div class="metric">${results.playwrightTests.failed}</div>
          </div>
        </div>
        
        <h2>Framework Validation</h2>
        <div class="dashboard">
          <div class="card ${results.frameworkValidation.status === 'passed' ? 'passed' : 'failed'}">
            <h3>Status</h3>
            <div class="metric">${results.frameworkValidation.status.toUpperCase()}</div>
          </div>
          <div class="card passed">
            <h3>Passed Checks</h3>
            <div class="metric">${results.frameworkValidation.passed}</div>
          </div>
          <div class="card warning">
            <h3>Warnings</h3>
            <div class="metric">${results.frameworkValidation.warnings}</div>
          </div>
          <div class="card ${results.frameworkValidation.failed > 0 ? 'failed' : 'passed'}">
            <h3>Failed Checks</h3>
            <div class="metric">${results.frameworkValidation.failed}</div>
          </div>
        </div>
        
        <h2>Test File Verification</h2>
        <div class="dashboard">
          <div class="card ${results.testVerification.status === 'passed' ? 'passed' : 'failed'}">
            <h3>Status</h3>
            <div class="metric">${results.testVerification.status.toUpperCase()}</div>
          </div>
          <div class="card passed">
            <h3>Tests Found</h3>
            <div class="metric">${results.testVerification.totalTests}</div>
          </div>
          <div class="card passed">
            <h3>Passed Checks</h3>
            <div class="metric">${results.testVerification.passed}</div>
          </div>
          <div class="card warning">
            <h3>Warnings</h3>
            <div class="metric">${results.testVerification.warnings}</div>
          </div>
          <div class="card ${results.testVerification.failed > 0 ? 'failed' : 'passed'}">
            <h3>Failed Checks</h3>
            <div class="metric">${results.testVerification.failed}</div>
          </div>
        </div>
        
        <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}