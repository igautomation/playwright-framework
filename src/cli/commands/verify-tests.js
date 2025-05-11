/**
 * Verify-tests command for the CLI
 *
 * This command analyzes test files to verify they follow best practices
 * and conform to the framework's standards
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob').glob;
const logger = require('../../utils/common/logger');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

/**
 * Verify tests in the project
 * @param {Object} options - Command options
 */
module.exports = (options = {}) => {
  try {
    logger.info('Starting test verification...');
    
    const testDir = options.dir || path.join(process.cwd(), 'src/tests');
    const pattern = options.pattern || '**/*.spec.js';
    const fullPattern = path.join(testDir, pattern);
    
    logger.info(`Scanning for test files: ${fullPattern}`);
    
    // Find all test files
    const testFiles = glob.sync(fullPattern);
    
    if (testFiles.length === 0) {
      logger.warn(`No test files found matching pattern: ${fullPattern}`);
      return;
    }
    
    logger.info(`Found ${testFiles.length} test files`);
    
    // Results tracking
    const results = {
      totalFiles: testFiles.length,
      totalTests: 0,
      passedChecks: 0,
      failedChecks: 0,
      warnings: 0,
      fileResults: []
    };
    
    // Process each test file
    testFiles.forEach(filePath => {
      const fileResult = verifyTestFile(filePath, options);
      results.totalTests += fileResult.testCount;
      results.passedChecks += fileResult.passedChecks;
      results.failedChecks += fileResult.failedChecks;
      results.warnings += fileResult.warnings;
      results.fileResults.push(fileResult);
    });
    
    // Print summary
    printVerificationSummary(results);
    
    // Generate HTML report if requested
    if (options.generateReport) {
      generateHtmlReport(results);
    }
    
    // Exit with appropriate code
    if (results.failedChecks > 0) {
      logger.error('Test verification failed with errors');
      if (!options.ignoreErrors) {
        process.exit(1);
      }
    } else if (results.warnings > 0) {
      logger.warn('Test verification passed with warnings');
    } else {
      logger.info('Test verification passed successfully');
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
 * Verify a single test file
 * @param {string} filePath - Path to test file
 * @param {Object} options - Verification options
 * @returns {Object} Verification results for the file
 */
function verifyTestFile(filePath, options = {}) {
  logger.debug(`Verifying test file: ${filePath}`);
  
  const result = {
    filePath,
    fileName: path.basename(filePath),
    testCount: 0,
    passedChecks: 0,
    failedChecks: 0,
    warnings: 0,
    issues: []
  };
  
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Basic checks
    performBasicChecks(content, result);
    
    // Advanced checks using AST parsing
    performAdvancedChecks(content, result);
    
    logger.debug(`File ${filePath} verification complete: ${result.testCount} tests, ${result.issues.length} issues`);
  } catch (error) {
    result.failedChecks++;
    result.issues.push({
      type: 'error',
      message: `Failed to analyze file: ${error.message}`,
      line: 0
    });
    logger.error(`Error analyzing ${filePath}:`, error.message);
  }
  
  return result;
}

/**
 * Perform basic checks on test file content
 * @param {string} content - File content
 * @param {Object} result - Result object to update
 */
function performBasicChecks(content, result) {
  // Check file size
  if (content.length > 100000) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: 'File is too large (>100KB). Consider splitting into multiple test files.',
      line: 0
    });
  }
  
  // Check for import of test framework
  if (!content.includes('@playwright/test')) {
    result.failedChecks++;
    result.issues.push({
      type: 'error',
      message: 'File does not import Playwright test framework',
      line: 0
    });
  }
  
  // Check for test declarations
  const testMatches = content.match(/test\s*\(/g) || [];
  const describeMatches = content.match(/describe\s*\(/g) || [];
  
  if (testMatches.length === 0 && describeMatches.length === 0) {
    result.failedChecks++;
    result.issues.push({
      type: 'error',
      message: 'No test or describe blocks found in file',
      line: 0
    });
  } else {
    result.testCount += testMatches.length;
  }
  
  // Check for commented out tests
  const commentedTestMatches = content.match(/\/\/\s*test\s*\(/g) || [];
  if (commentedTestMatches.length > 0) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: `Found ${commentedTestMatches.length} commented out test(s)`,
      line: 0
    });
  }
  
  // Check for skipped tests
  const skippedTestMatches = content.match(/test\.skip\s*\(/g) || [];
  if (skippedTestMatches.length > 0) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: `Found ${skippedTestMatches.length} skipped test(s)`,
      line: 0
    });
  }
  
  // Check for only tests
  const onlyTestMatches = content.match(/test\.only\s*\(/g) || [];
  if (onlyTestMatches.length > 0) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: `Found ${onlyTestMatches.length} test.only() which will prevent other tests from running`,
      line: 0
    });
  }
  
  // Check for assertions
  const expectMatches = content.match(/expect\s*\(/g) || [];
  if (expectMatches.length === 0) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: 'No assertions found in test file',
      line: 0
    });
  }
  
  // Check for proper test isolation
  const beforeEachMatches = content.match(/beforeEach\s*\(/g) || [];
  const afterEachMatches = content.match(/afterEach\s*\(/g) || [];
  
  if (testMatches.length > 1 && (beforeEachMatches.length === 0 || afterEachMatches.length === 0)) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: 'Multiple tests without proper beforeEach/afterEach hooks for isolation',
      line: 0
    });
  }
  
  // Check for hardcoded credentials
  const passwordRegex = /password\s*[:=]\s*['"](?!process|env|config|variable)[^'"]+['"]/gi;
  const passwordMatches = content.match(passwordRegex) || [];
  
  if (passwordMatches.length > 0) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: 'Possible hardcoded credentials found',
      line: 0
    });
  }
  
  // Check for magic numbers
  const magicNumberRegex = /\b(\d{3,})\b/g;
  let match;
  const magicNumbers = [];
  
  while ((match = magicNumberRegex.exec(content)) !== null) {
    const number = parseInt(match[1], 10);
    if (number > 10 && ![100, 200, 201, 204, 400, 401, 403, 404, 500].includes(number)) {
      const lineNumber = getLineNumber(content, match.index);
      magicNumbers.push({ number, lineNumber });
    }
  }
  
  if (magicNumbers.length > 0) {
    magicNumbers.forEach(({ number, lineNumber }) => {
      result.warnings++;
      result.issues.push({
        type: 'warning',
        message: `Magic number: ${number}`,
        line: lineNumber
      });
    });
  }
  
  // Check for test timeouts
  const timeoutMatches = content.match(/timeout\s*\(\s*\d+\s*\)/g) || [];
  if (timeoutMatches.length > 0) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: `Found ${timeoutMatches.length} explicit timeout(s). Consider using configuration instead.`,
      line: 0
    });
  }
  
  // Check for proper error handling
  const tryMatches = content.match(/try\s*{/g) || [];
  const catchMatches = content.match(/}\s*catch/g) || [];
  
  if (tryMatches.length !== catchMatches.length) {
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: 'Mismatched try/catch blocks',
      line: 0
    });
  }
  
  // Update passed checks
  result.passedChecks = result.testCount - result.failedChecks;
}

/**
 * Perform advanced checks on test file content using AST parsing
 * @param {string} content - File content
 * @param {Object} result - Result object to update
 */
function performAdvancedChecks(content, result) {
  try {
    // Parse the file into an AST
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    // Track test structure
    const testStructure = {
      testCount: 0,
      describeCount: 0,
      nestedTestCount: 0,
      testWithoutDescription: 0,
      testWithLongDescription: 0,
      testWithDuplicateDescription: [],
      testDescriptions: new Set()
    };
    
    // Visit the AST
    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        
        // Check for test calls
        if (callee.name === 'test' || 
            (callee.type === 'MemberExpression' && callee.object.name === 'test')) {
          testStructure.testCount++;
          
          // Check test description
          if (path.node.arguments.length > 0 && path.node.arguments[0].type === 'StringLiteral') {
            const description = path.node.arguments[0].value;
            
            // Check for empty or short descriptions
            if (!description || description.length < 5) {
              testStructure.testWithoutDescription++;
              result.warnings++;
              result.issues.push({
                type: 'warning',
                message: `Test has a very short description: "${description}"`,
                line: path.node.loc ? path.node.loc.start.line : 0
              });
            }
            
            // Check for overly long descriptions
            if (description.length > 100) {
              testStructure.testWithLongDescription++;
              result.warnings++;
              result.issues.push({
                type: 'warning',
                message: `Test has a very long description (${description.length} chars)`,
                line: path.node.loc ? path.node.loc.start.line : 0
              });
            }
            
            // Check for duplicate descriptions
            if (testStructure.testDescriptions.has(description)) {
              testStructure.testWithDuplicateDescription.push(description);
              result.warnings++;
              result.issues.push({
                type: 'warning',
                message: `Duplicate test description: "${description}"`,
                line: path.node.loc ? path.node.loc.start.line : 0
              });
            } else {
              testStructure.testDescriptions.add(description);
            }
          }
          
          // Check for nested tests (which Playwright doesn't support)
          const ancestors = path.getAncestry();
          for (const ancestor of ancestors) {
            if (ancestor.isCallExpression() && 
                ancestor.node.callee && 
                ancestor.node.callee.name === 'test') {
              testStructure.nestedTestCount++;
              result.failedChecks++;
              result.issues.push({
                type: 'error',
                message: 'Nested test detected. Playwright does not support nested tests.',
                line: path.node.loc ? path.node.loc.start.line : 0
              });
              break;
            }
          }
        }
        
        // Check for describe blocks
        if (callee.name === 'describe') {
          testStructure.describeCount++;
        }
      }
    });
    
    // Check for test organization issues
    if (testStructure.testCount > 5 && testStructure.describeCount === 0) {
      result.warnings++;
      result.issues.push({
        type: 'warning',
        message: `File has ${testStructure.testCount} tests but no describe blocks for organization`,
        line: 0
      });
    }
    
  } catch (error) {
    // AST parsing is optional, so just log a warning
    result.warnings++;
    result.issues.push({
      type: 'warning',
      message: `Could not perform advanced checks: ${error.message}`,
      line: 0
    });
    logger.debug(`AST parsing error: ${error.message}`);
  }
}

/**
 * Get line number for a position in text
 * @param {string} text - Text content
 * @param {number} position - Position in text
 * @returns {number} Line number
 */
function getLineNumber(text, position) {
  const textBeforePosition = text.substring(0, position);
  return (textBeforePosition.match(/\n/g) || []).length + 1;
}

/**
 * Print verification summary
 * @param {Object} results - Verification results
 */
function printVerificationSummary(results) {
  logger.info('\n📊 Test Verification Summary');
  logger.info(`Files analyzed: ${results.totalFiles}`);
  logger.info(`Tests found: ${results.totalTests}`);
  logger.info(`Passed checks: ${results.passedChecks}`);
  logger.info(`Failed checks: ${results.failedChecks}`);
  logger.info(`Warnings: ${results.warnings}`);
  
  // Print files with issues
  const filesWithIssues = results.fileResults.filter(file => 
    file.issues.length > 0
  );
  
  if (filesWithIssues.length > 0) {
    logger.info('\n📋 Files with issues:');
    
    filesWithIssues.forEach(file => {
      const errors = file.issues.filter(issue => issue.type === 'error').length;
      const warnings = file.issues.filter(issue => issue.type === 'warning').length;
      
      logger.info(`\n${file.fileName} (${errors} errors, ${warnings} warnings):`);
      
      file.issues.forEach(issue => {
        const prefix = issue.type === 'error' ? '❌' : '⚠️';
        const lineInfo = issue.line > 0 ? `line ${issue.line}` : '';
        logger.info(`  ${prefix} ${issue.message} ${lineInfo}`);
      });
    });
  }
}

/**
 * Generate HTML report for verification results
 * @param {Object} results - Verification results
 */
function generateHtmlReport(results) {
  const reportsDir = path.join(process.cwd(), 'reports', 'verification');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, 'test-verification-report.html');
  
  // Generate HTML content
  const html = `
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
        h1, h2, h3 {
          color: #333;
        }
        .summary {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          flex: 1;
          min-width: 200px;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          text-align: center;
        }
        .summary-card h3 {
          margin-top: 0;
        }
        .summary-card .value {
          font-size: 36px;
          font-weight: bold;
          margin: 10px 0;
        }
        .files {
          margin-top: 30px;
        }
        .file {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .file-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .file-name {
          font-weight: bold;
          font-size: 18px;
        }
        .file-stats {
          display: flex;
          gap: 15px;
        }
        .file-stat {
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 14px;
        }
        .issues {
          margin-top: 10px;
        }
        .issue {
          padding: 8px;
          margin-bottom: 5px;
          border-radius: 3px;
        }
        .error {
          background-color: #f8d7da;
          color: #721c24;
        }
        .warning {
          background-color: #fff3cd;
          color: #856404;
        }
        .passed {
          background-color: #d4edda;
          color: #155724;
        }
        .timestamp {
          color: #6c757d;
          font-size: 14px;
          margin-top: 20px;
        }
        .line-number {
          font-size: 12px;
          color: #6c757d;
          margin-left: 10px;
        }
        .collapsible {
          cursor: pointer;
        }
        .content {
          display: none;
          overflow: hidden;
        }
      </style>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const collapsibles = document.querySelectorAll('.collapsible');
          collapsibles.forEach(item => {
            item.addEventListener('click', function() {
              this.classList.toggle('active');
              const content = this.nextElementSibling;
              if (content.style.display === 'block') {
                content.style.display = 'none';
              } else {
                content.style.display = 'block';
              }
            });
          });
        });
      </script>
    </head>
    <body>
      <div class="container">
        <h1>Test Verification Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
          <div class="summary-card passed">
            <h3>Files Analyzed</h3>
            <div class="value">${results.totalFiles}</div>
          </div>
          <div class="summary-card passed">
            <h3>Tests Found</h3>
            <div class="value">${results.totalTests}</div>
          </div>
          <div class="summary-card passed">
            <h3>Passed Checks</h3>
            <div class="value">${results.passedChecks}</div>
          </div>
          <div class="summary-card ${results.failedChecks > 0 ? 'error' : 'passed'}">
            <h3>Failed Checks</h3>
            <div class="value">${results.failedChecks}</div>
          </div>
          <div class="summary-card ${results.warnings > 0 ? 'warning' : 'passed'}">
            <h3>Warnings</h3>
            <div class="value">${results.warnings}</div>
          </div>
        </div>
        
        <h2>Files with Issues</h2>
        <div class="files">
          ${results.fileResults
            .filter(file => file.issues.length > 0)
            .map(file => {
              const errors = file.issues.filter(issue => issue.type === 'error').length;
              const warnings = file.issues.filter(issue => issue.type === 'warning').length;
              
              return `
                <div class="file">
                  <div class="file-header collapsible">
                    <div class="file-name">${file.fileName}</div>
                    <div class="file-stats">
                      <span class="file-stat passed">${file.testCount} Tests</span>
                      ${errors > 0 ? `<span class="file-stat error">${errors} Errors</span>` : ''}
                      ${warnings > 0 ? `<span class="file-stat warning">${warnings} Warnings</span>` : ''}
                    </div>
                  </div>
                  <div class="content">
                    <div class="issues">
                      ${file.issues.map(issue => `
                        <div class="issue ${issue.type}">
                          ${issue.type === 'error' ? '❌' : '⚠️'} ${issue.message}
                          ${issue.line > 0 ? `<span class="line-number">Line: ${issue.line}</span>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
        </div>
        
        <h2>Files without Issues</h2>
        <div class="files">
          ${results.fileResults
            .filter(file => file.issues.length === 0)
            .map(file => `
              <div class="file">
                <div class="file-header">
                  <div class="file-name">${file.fileName}</div>
                  <div class="file-stats">
                    <span class="file-stat passed">${file.testCount} Tests</span>
                    <span class="file-stat passed">No Issues</span>
                  </div>
                </div>
              </div>
            `).join('')}
        </div>
        
        <p class="timestamp">Report generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
  
  // Write HTML to file
  fs.writeFileSync(reportPath, html);
  
  logger.info(`\n📊 HTML report generated: ${reportPath}`);
}