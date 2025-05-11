/**
 * Test-coverage command for the CLI
 *
 * This command analyzes test coverage and generates reports
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../../utils/common/logger');

/**
 * Generate and analyze test coverage
 * @param {Object} options - Command options
 */
module.exports = async (options = {}) => {
  try {
    logger.info('Analyzing test coverage...');
    
    const coverageDir = options.outputDir || path.join(process.cwd(), 'coverage');
    const testDir = options.testDir || path.join(process.cwd(), 'src/tests');
    const sourceDir = options.sourceDir || path.join(process.cwd(), 'src');
    const threshold = options.threshold || 80;
    
    // Ensure coverage directory exists
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
    }
    
    // Run tests with coverage
    logger.info('Running tests with coverage collection...');
    
    try {
      const command = [
        'npx playwright test',
        `--config=${options.config || 'playwright.config.js'}`,
        '--reporter=html',
        `--reporter-option=outputFolder=${coverageDir}`,
        options.testPattern || ''
      ].filter(Boolean).join(' ');
      
      execSync(command, { 
        stdio: options.verbose ? 'inherit' : 'pipe',
        env: {
          ...process.env,
          PLAYWRIGHT_JUNIT_OUTPUT_NAME: path.join(coverageDir, 'junit-results.xml'),
          NODE_V8_COVERAGE: path.join(coverageDir, 'v8-coverage')
        }
      });
      
      logger.info('Tests completed successfully');
    } catch (error) {
      logger.warn('Some tests failed, but continuing with coverage analysis');
    }
    
    // Generate coverage report
    logger.info('Generating coverage report...');
    
    try {
      execSync(`npx c8 report --reporter=html --reporter=text --reporter=lcov --report-dir=${coverageDir}`, {
        stdio: options.verbose ? 'inherit' : 'pipe'
      });
    } catch (error) {
      logger.error('Failed to generate coverage report:', error.message);
      throw error;
    }
    
    // Analyze coverage data
    const coverageResults = analyzeCoverageData(coverageDir);
    
    // Print coverage summary
    printCoverageSummary(coverageResults, threshold);
    
    // Check if coverage meets threshold
    if (coverageResults.overall < threshold) {
      logger.error(`Coverage (${coverageResults.overall.toFixed(2)}%) is below threshold (${threshold}%)`);
      if (!options.ignoreThreshold) {
        process.exit(1);
      }
    } else {
      logger.info(`Coverage (${coverageResults.overall.toFixed(2)}%) meets threshold (${threshold}%)`);
    }
    
    return coverageResults;
  } catch (error) {
    logger.error('Error during coverage analysis:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
  }
};

/**
 * Analyze coverage data from reports
 * @param {string} coverageDir - Coverage directory
 * @returns {Object} Coverage results
 */
function analyzeCoverageData(coverageDir) {
  try {
    // Try to read lcov info file
    const lcovPath = path.join(coverageDir, 'lcov.info');
    
    if (!fs.existsSync(lcovPath)) {
      logger.warn(`LCOV file not found at ${lcovPath}`);
      return {
        overall: 0,
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        files: []
      };
    }
    
    const lcovContent = fs.readFileSync(lcovPath, 'utf-8');
    const coverageData = parseLcovData(lcovContent);
    
    return coverageData;
  } catch (error) {
    logger.error('Error analyzing coverage data:', error.message);
    return {
      overall: 0,
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
      files: []
    };
  }
}

/**
 * Parse LCOV data
 * @param {string} lcovContent - LCOV file content
 * @returns {Object} Parsed coverage data
 */
function parseLcovData(lcovContent) {
  const files = [];
  let currentFile = null;
  
  // Split by lines and process
  const lines = lcovContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('SF:')) {
      // Start of a new file section
      const filePath = line.substring(3);
      currentFile = {
        path: filePath,
        name: path.basename(filePath),
        lines: { found: 0, hit: 0, coverage: 0 },
        functions: { found: 0, hit: 0, coverage: 0 },
        branches: { found: 0, hit: 0, coverage: 0 }
      };
      files.push(currentFile);
    } else if (line.startsWith('LF:')) {
      currentFile.lines.found = parseInt(line.substring(3), 10);
    } else if (line.startsWith('LH:')) {
      currentFile.lines.hit = parseInt(line.substring(3), 10);
      currentFile.lines.coverage = currentFile.lines.found > 0 
        ? (currentFile.lines.hit / currentFile.lines.found) * 100 
        : 0;
    } else if (line.startsWith('FNF:')) {
      currentFile.functions.found = parseInt(line.substring(4), 10);
    } else if (line.startsWith('FNH:')) {
      currentFile.functions.hit = parseInt(line.substring(4), 10);
      currentFile.functions.coverage = currentFile.functions.found > 0 
        ? (currentFile.functions.hit / currentFile.functions.found) * 100 
        : 0;
    } else if (line.startsWith('BRF:')) {
      currentFile.branches.found = parseInt(line.substring(4), 10);
    } else if (line.startsWith('BRH:')) {
      currentFile.branches.hit = parseInt(line.substring(4), 10);
      currentFile.branches.coverage = currentFile.branches.found > 0 
        ? (currentFile.branches.hit / currentFile.branches.found) * 100 
        : 0;
    }
  }
  
  // Calculate overall metrics
  const totals = files.reduce((acc, file) => {
    acc.lines.found += file.lines.found;
    acc.lines.hit += file.lines.hit;
    acc.functions.found += file.functions.found;
    acc.functions.hit += file.functions.hit;
    acc.branches.found += file.branches.found;
    acc.branches.hit += file.branches.hit;
    return acc;
  }, {
    lines: { found: 0, hit: 0 },
    functions: { found: 0, hit: 0 },
    branches: { found: 0, hit: 0 }
  });
  
  const linesCoverage = totals.lines.found > 0 
    ? (totals.lines.hit / totals.lines.found) * 100 
    : 0;
  
  const functionsCoverage = totals.functions.found > 0 
    ? (totals.functions.hit / totals.functions.found) * 100 
    : 0;
  
  const branchesCoverage = totals.branches.found > 0 
    ? (totals.branches.hit / totals.branches.found) * 100 
    : 0;
  
  // Calculate overall coverage as weighted average
  const overall = (linesCoverage + functionsCoverage + branchesCoverage) / 3;
  
  return {
    overall,
    statements: linesCoverage,
    branches: branchesCoverage,
    functions: functionsCoverage,
    lines: linesCoverage,
    files: files.sort((a, b) => a.lines.coverage - b.lines.coverage) // Sort by coverage
  };
}

/**
 * Print coverage summary
 * @param {Object} coverageResults - Coverage results
 * @param {number} threshold - Coverage threshold
 */
function printCoverageSummary(coverageResults, threshold) {
  logger.info('\n📊 Test Coverage Summary');
  
  // Print overall metrics
  logger.info(`Overall coverage: ${coverageResults.overall.toFixed(2)}%`);
  logger.info(`Statements: ${coverageResults.statements.toFixed(2)}%`);
  logger.info(`Branches: ${coverageResults.branches.toFixed(2)}%`);
  logger.info(`Functions: ${coverageResults.functions.toFixed(2)}%`);
  logger.info(`Lines: ${coverageResults.lines.toFixed(2)}%`);
  
  // Print files with low coverage
  const lowCoverageFiles = coverageResults.files.filter(file => 
    file.lines.coverage < threshold
  );
  
  if (lowCoverageFiles.length > 0) {
    logger.info('\n📋 Files with coverage below threshold:');
    
    lowCoverageFiles.forEach(file => {
      logger.info(`${file.name}: ${file.lines.coverage.toFixed(2)}% (${file.lines.hit}/${file.lines.found} lines)`);
    });
  }
  
  // Print high coverage files
  const highCoverageFiles = coverageResults.files.filter(file => 
    file.lines.coverage >= 90 && file.lines.found > 10
  );
  
  if (highCoverageFiles.length > 0) {
    logger.info('\n🌟 Files with excellent coverage (>90%):');
    
    highCoverageFiles.slice(0, 5).forEach(file => {
      logger.info(`${file.name}: ${file.lines.coverage.toFixed(2)}% (${file.lines.hit}/${file.lines.found} lines)`);
    });
    
    if (highCoverageFiles.length > 5) {
      logger.info(`...and ${highCoverageFiles.length - 5} more files`);
    }
  }
}