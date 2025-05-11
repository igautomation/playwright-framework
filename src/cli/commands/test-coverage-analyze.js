/**
 * Test-coverage-analyze command for the CLI
 *
 * This command analyzes test coverage without requiring instrumentation
 */
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/common/logger');
const TestCoverageAnalyzer = require('../../utils/ci/testCoverageAnalyzer');

/**
 * Analyze test coverage
 * @param {Object} options - Command options
 */
module.exports = async (options = {}) => {
  try {
    logger.info('Starting test coverage analysis...');
    
    const testDir = options.testDir || path.join(process.cwd(), 'src/tests');
    const sourceDir = options.sourceDir || path.join(process.cwd(), 'src');
    const outputDir = options.outputDir || path.join(process.cwd(), 'reports/coverage');
    const threshold = options.threshold ? parseInt(options.threshold, 10) : 80;
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create analyzer
    const analyzer = new TestCoverageAnalyzer({
      testDir,
      sourceDir,
      coverageThreshold: threshold,
      excludePatterns: options.exclude ? options.exclude.split(',') : ['node_modules', 'dist', 'build', 'coverage']
    });
    
    // Run analysis
    logger.info('Analyzing test coverage...');
    const analysis = await analyzer.analyzeCoverage();
    
    // Generate reports
    const jsonReportPath = path.join(outputDir, 'coverage-report.json');
    await analyzer.generateReport(analysis, jsonReportPath);
    
    const htmlReportPath = path.join(outputDir, 'coverage-report.html');
    await analyzer.generateHtmlReport(analysis, htmlReportPath);
    
    // Print summary
    printCoverageSummary(analysis);
    
    // Check if coverage meets threshold
    if (!analysis.metrics.meetsCoverageThreshold) {
      logger.error(`Coverage (${analysis.metrics.fileCoverage.toFixed(2)}%) is below threshold (${threshold}%)`);
      if (!options.ignoreThreshold) {
        process.exit(1);
      }
    } else {
      logger.info(`Coverage (${analysis.metrics.fileCoverage.toFixed(2)}%) meets threshold (${threshold}%)`);
    }
    
    // Open report if requested
    if (options.open) {
      try {
        const platform = process.platform;
        
        if (platform === 'win32') {
          require('child_process').execSync(`start "" "${htmlReportPath}"`);
        } else if (platform === 'darwin') {
          require('child_process').execSync(`open "${htmlReportPath}"`);
        } else {
          require('child_process').execSync(`xdg-open "${htmlReportPath}"`);
        }
      } catch (error) {
        logger.warn('Failed to open report:', error.message);
      }
    }
    
    return {
      metrics: analysis.metrics,
      reportPaths: {
        json: jsonReportPath,
        html: htmlReportPath
      }
    };
  } catch (error) {
    logger.error('Error during test coverage analysis:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
  }
};

/**
 * Print coverage summary
 * @param {Object} analysis - Coverage analysis results
 */
function printCoverageSummary(analysis) {
  const { metrics, gaps } = analysis;
  
  logger.info('\n📊 Test Coverage Summary');
  logger.info(`File coverage: ${metrics.fileCoverage.toFixed(2)}%`);
  logger.info(`Total files: ${metrics.totalFiles}`);
  logger.info(`Covered files: ${metrics.coveredFiles}`);
  logger.info(`Uncovered files: ${metrics.uncoveredFiles}`);
  
  if (gaps.recommendations.length > 0) {
    logger.info('\n📋 Recommendations:');
    
    gaps.recommendations.forEach(rec => {
      const prefix = rec.priority === 'high' ? '❗' : rec.priority === 'medium' ? '⚠️' : 'ℹ️';
      logger.info(`  ${prefix} ${rec.message}`);
    });
  }
  
  if (gaps.untested.length > 0) {
    logger.info(`\n❌ ${gaps.untested.length} files have no tests`);
    
    // Show a few examples
    gaps.untested.slice(0, 5).forEach(file => {
      logger.info(`  - ${path.relative(process.cwd(), file)}`);
    });
    
    if (gaps.untested.length > 5) {
      logger.info(`  - ...and ${gaps.untested.length - 5} more`);
    }
  }
  
  if (gaps.lowCoverage.length > 0) {
    logger.info(`\n⚠️ ${gaps.lowCoverage.length} files have minimal test coverage`);
  }
}