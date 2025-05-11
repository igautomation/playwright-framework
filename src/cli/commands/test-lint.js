/**
 * Test-lint command for the CLI
 *
 * This command lints test files for common issues and enforces best practices
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob').glob;
const logger = require('../../utils/common/logger');

/**
 * Lint test files
 * @param {Object} options - Command options
 */
module.exports = async (options = {}) => {
  try {
    logger.info('Starting test linting...');
    
    const testDir = options.dir || path.join(process.cwd(), 'src/tests');
    const pattern = options.pattern || '**/*.spec.js';
    const fullPattern = path.join(testDir, pattern);
    const fix = options.fix || false;
    
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
      fileCount: testFiles.length,
      errorCount: 0,
      warningCount: 0,
      fixableCount: 0,
      fileResults: []
    };
    
    // Process each test file
    testFiles.forEach(filePath => {
      const fileResult = lintTestFile(filePath, options);
      results.errorCount += fileResult.errorCount;
      results.warningCount += fileResult.warningCount;
      results.fixableCount += fileResult.fixableCount;
      
      if (fileResult.errorCount > 0 || fileResult.warningCount > 0) {
        results.fileResults.push(fileResult);
      }
      
      // Apply fixes if requested
      if (fix && fileResult.fixableCount > 0 && fileResult.fixedContent) {
        fs.writeFileSync(filePath, fileResult.fixedContent, 'utf-8');
        logger.info(`Applied fixes to ${path.basename(filePath)}`);
      }
    });
    
    // Print summary
    printLintSummary(results);
    
    // Exit with appropriate code
    if (results.errorCount > 0) {
      logger.error('Test linting failed with errors');
      if (!options.ignoreErrors) {
        process.exit(1);
      }
    } else if (results.warningCount > 0) {
      logger.warn('Test linting passed with warnings');
    } else {
      logger.info('Test linting passed successfully');
    }
    
    return results;
  } catch (error) {
    logger.error('Error during test linting:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
  }
};

/**
 * Lint a single test file
 * @param {string} filePath - Path to test file
 * @param {Object} options - Linting options
 * @returns {Object} Lint results for the file
 */
function lintTestFile(filePath, options = {}) {
  logger.debug(`Linting test file: ${filePath}`);
  
  const result = {
    filePath,
    fileName: path.basename(filePath),
    errorCount: 0,
    warningCount: 0,
    fixableCount: 0,
    messages: [],
    fixedContent: null
  };
  
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    let fixedContent = content;
    
    // Check for import of test framework
    if (!content.includes('@playwright/test')) {
      result.errorCount++;
      result.messages.push({
        severity: 'error',
        message: 'File does not import Playwright test framework',
        line: 1,
        column: 1,
        ruleId: 'playwright/import-playwright'
      });
      
      // Fix: Add import at the top of the file
      if (options.fix) {
        fixedContent = `const { test, expect } = require('@playwright/test');\n\n${fixedContent}`;
        result.fixableCount++;
      }
    }
    
    // Check for test.only
    const onlyMatches = content.match(/test\.only\s*\(/g) || [];
    if (onlyMatches.length > 0) {
      result.errorCount++;
      result.messages.push({
        severity: 'error',
        message: `Found ${onlyMatches.length} test.only() which will prevent other tests from running`,
        line: getLineNumber(content, content.indexOf('test.only')),
        column: 1,
        ruleId: 'playwright/no-focused-test'
      });
      
      // Fix: Replace test.only with test
      if (options.fix) {
        fixedContent = fixedContent.replace(/test\.only\s*\(/g, 'test(');
        result.fixableCount++;
      }
    }
    
    // Check for test.skip without explanation
    const skipMatches = content.match(/test\.skip\s*\(/g) || [];
    if (skipMatches.length > 0) {
      result.warningCount++;
      result.messages.push({
        severity: 'warning',
        message: `Found ${skipMatches.length} skipped test(s)`,
        line: getLineNumber(content, content.indexOf('test.skip')),
        column: 1,
        ruleId: 'playwright/no-skipped-test'
      });
    }
    
    // Check for console.log statements
    const consoleLogMatches = content.match(/console\.log\s*\(/g) || [];
    if (consoleLogMatches.length > 0) {
      result.warningCount++;
      result.messages.push({
        severity: 'warning',
        message: `Found ${consoleLogMatches.length} console.log statement(s)`,
        line: getLineNumber(content, content.indexOf('console.log')),
        column: 1,
        ruleId: 'no-console'
      });
      
      // Fix: Replace console.log with logger.debug
      if (options.fix) {
        // First check if logger is imported
        if (!content.includes('logger')) {
          fixedContent = `const logger = require('../../utils/common/logger');\n\n${fixedContent}`;
        }
        fixedContent = fixedContent.replace(/console\.log\s*\(/g, 'logger.debug(');
        result.fixableCount++;
      }
    }
    
    // Check for hardcoded credentials
    const passwordRegex = /password\s*[:=]\s*['"](?!process|env|config|variable)[^'"]+['"]/gi;
    const passwordMatches = content.match(passwordRegex) || [];
    if (passwordMatches.length > 0) {
      result.warningCount++;
      result.messages.push({
        severity: 'warning',
        message: 'Possible hardcoded credentials found',
        line: getLineNumber(content, content.indexOf(passwordMatches[0])),
        column: 1,
        ruleId: 'security/no-hardcoded-credentials'
      });
    }
    
    // Check for assertions
    const expectMatches = content.match(/expect\s*\(/g) || [];
    if (expectMatches.length === 0 && content.includes('test(')) {
      result.warningCount++;
      result.messages.push({
        severity: 'warning',
        message: 'No assertions found in test file',
        line: 1,
        column: 1,
        ruleId: 'playwright/expect-expect'
      });
    }
    
    // Check for proper test isolation
    const testMatches = content.match(/test\s*\(/g) || [];
    const beforeEachMatches = content.match(/beforeEach\s*\(/g) || [];
    const afterEachMatches = content.match(/afterEach\s*\(/g) || [];
    
    if (testMatches.length > 1 && (beforeEachMatches.length === 0 || afterEachMatches.length === 0)) {
      result.warningCount++;
      result.messages.push({
        severity: 'warning',
        message: 'Multiple tests without proper beforeEach/afterEach hooks for isolation',
        line: 1,
        column: 1,
        ruleId: 'playwright/test-isolation'
      });
      
      // Fix: Add empty beforeEach/afterEach hooks
      if (options.fix && content.includes('test.describe(')) {
        const describeMatch = content.match(/test\.describe\s*\([^{]*{/);
        if (describeMatch) {
          const insertPosition = content.indexOf(describeMatch[0]) + describeMatch[0].length;
          const hookTemplate = `\n  test.beforeEach(async ({ page }) => {\n    // Setup code\n  });\n\n  test.afterEach(async ({ page }) => {\n    // Teardown code\n  });\n`;
          
          fixedContent = fixedContent.slice(0, insertPosition) + hookTemplate + fixedContent.slice(insertPosition);
          result.fixableCount++;
        }
      }
    }
    
    // Check for magic numbers
    const magicNumberRegex = /\b(\d{3,})\b/g;
    let match;
    const magicNumbers = [];
    
    while ((match = magicNumberRegex.exec(content)) !== null) {
      const number = parseInt(match[1], 10);
      if (number > 10 && ![100, 200, 201, 204, 400, 401, 403, 404, 500].includes(number)) {
        const lineNumber = getLineNumber(content, match.index);
        magicNumbers.push({ number, lineNumber, index: match.index });
      }
    }
    
    if (magicNumbers.length > 0) {
      magicNumbers.forEach(({ number, lineNumber }) => {
        result.warningCount++;
        result.messages.push({
          severity: 'warning',
          message: `Magic number: ${number}`,
          line: lineNumber,
          column: 1,
          ruleId: 'no-magic-numbers'
        });
      });
      
      // Fix: Extract magic numbers to constants
      if (options.fix) {
        // Sort by index in descending order to avoid position shifts
        magicNumbers.sort((a, b) => b.index - a.index);
        
        // Find a good insertion point for constants (after imports, before tests)
        let insertPosition = 0;
        const importLines = content.split('\n').findIndex(line => !line.trim().startsWith('import') && !line.trim().startsWith('const') && !line.trim().startsWith('//'));
        if (importLines > 0) {
          insertPosition = content.split('\n').slice(0, importLines).join('\n').length + 1;
        }
        
        let constantsBlock = '\n// Constants\n';
        const processedNumbers = new Set();
        
        magicNumbers.forEach(({ number }) => {
          if (!processedNumbers.has(number)) {
            const constantName = getConstantNameForNumber(number);
            constantsBlock += `const ${constantName} = ${number};\n`;
            processedNumbers.add(number);
            
            // Replace all occurrences of this number
            const numberRegex = new RegExp(`\\b${number}\\b`, 'g');
            fixedContent = fixedContent.replace(numberRegex, constantName);
          }
        });
        
        fixedContent = fixedContent.slice(0, insertPosition) + constantsBlock + fixedContent.slice(insertPosition);
        result.fixableCount += processedNumbers.size;
      }
    }
    
    // Update fixed content if any fixes were applied
    if (result.fixableCount > 0) {
      result.fixedContent = fixedContent;
    }
    
    logger.debug(`Linting complete for ${filePath}: ${result.errorCount} errors, ${result.warningCount} warnings`);
    return result;
  } catch (error) {
    result.errorCount++;
    result.messages.push({
      severity: 'error',
      message: `Failed to lint file: ${error.message}`,
      line: 1,
      column: 1,
      ruleId: 'internal/parsing-error'
    });
    logger.error(`Error linting ${filePath}:`, error.message);
    return result;
  }
}

/**
 * Get line number for a position in text
 * @param {string} text - Text content
 * @param {number} position - Position in text
 * @returns {number} Line number
 */
function getLineNumber(text, position) {
  if (position < 0) return 1;
  const textBeforePosition = text.substring(0, position);
  return (textBeforePosition.match(/\n/g) || []).length + 1;
}

/**
 * Generate a constant name for a number
 * @param {number} number - Number to name
 * @returns {string} Constant name
 */
function getConstantNameForNumber(number) {
  // Common numbers with specific meanings
  const specialNumbers = {
    1000: 'ONE_SECOND_MS',
    2000: 'TWO_SECONDS_MS',
    3000: 'THREE_SECONDS_MS',
    5000: 'FIVE_SECONDS_MS',
    10000: 'TEN_SECONDS_MS',
    30000: 'THIRTY_SECONDS_MS',
    60000: 'ONE_MINUTE_MS',
    3600000: 'ONE_HOUR_MS',
    86400000: 'ONE_DAY_MS',
    1024: 'ONE_KB',
    1048576: 'ONE_MB',
    1073741824: 'ONE_GB'
  };
  
  if (specialNumbers[number]) {
    return specialNumbers[number];
  }
  
  // For viewport dimensions
  if ([375, 768, 1024, 1280, 1366, 1440, 1920].includes(number)) {
    return `WIDTH_${number}`;
  }
  
  if ([667, 800, 900, 1080].includes(number)) {
    return `HEIGHT_${number}`;
  }
  
  // Default naming
  return `CONSTANT_${number}`;
}

/**
 * Print lint summary
 * @param {Object} results - Lint results
 */
function printLintSummary(results) {
  logger.info('\n📊 Test Lint Summary');
  logger.info(`Files analyzed: ${results.fileCount}`);
  logger.info(`Errors: ${results.errorCount}`);
  logger.info(`Warnings: ${results.warningCount}`);
  logger.info(`Fixable issues: ${results.fixableCount}`);
  
  // Print files with issues
  if (results.fileResults.length > 0) {
    logger.info('\n📋 Files with issues:');
    
    results.fileResults.forEach(file => {
      const errors = file.messages.filter(msg => msg.severity === 'error').length;
      const warnings = file.messages.filter(msg => msg.severity === 'warning').length;
      
      logger.info(`\n${file.fileName} (${errors} errors, ${warnings} warnings):`);
      
      file.messages.forEach(message => {
        const prefix = message.severity === 'error' ? '❌' : '⚠️';
        logger.info(`  ${prefix} ${message.message} (${message.ruleId}) at line ${message.line}`);
      });
    });
  }
  
  // Print most common issues
  if (results.fileResults.length > 0) {
    const allMessages = results.fileResults.flatMap(file => file.messages);
    const issuesByRule = {};
    
    allMessages.forEach(message => {
      const rule = message.ruleId || 'unknown';
      if (!issuesByRule[rule]) {
        issuesByRule[rule] = 0;
      }
      issuesByRule[rule]++;
    });
    
    const sortedIssues = Object.entries(issuesByRule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (sortedIssues.length > 0) {
      logger.info('\n📋 Most common issues:');
      
      sortedIssues.forEach(([rule, count]) => {
        logger.info(`  ${rule}: ${count} occurrences`);
      });
    }
  }
}