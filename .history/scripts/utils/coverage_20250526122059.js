#!/usr/bin/env node
/**
 * Run test coverage analysis
 */
const TestCoverageAnalyzer = require('../src/utils/ci/testCoverageAnalyzer');
const path = require('path');
const fs = require('fs');

async function runCoverage() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    testPattern: args[0] || 'src/tests/**/*.test.js',
    threshold: {
      lines: parseInt(args[1]) || 70,
      functions: parseInt(args[2]) || 70,
      branches: parseInt(args[3]) || 60
    }
  };
  
  console.log(`Running coverage analysis with pattern: ${options.testPattern}`);
  console.log(`Thresholds - Lines: ${options.threshold.lines}%, Functions: ${options.threshold.functions}%, Branches: ${options.threshold.branches}%`);
  
  const analyzer = new TestCoverageAnalyzer(options);
  const report = await analyzer.analyze();
  
  if (report) {
    console.log(`\nOverall Coverage:`);
    console.log(`- Lines: ${report.overallCoverage.lines.toFixed(2)}% (${report.thresholdsMet.lines ? '✅' : '❌'})`);
    console.log(`- Functions: ${report.overallCoverage.functions.toFixed(2)}% (${report.thresholdsMet.functions ? '✅' : '❌'})`);
    console.log(`- Branches: ${report.overallCoverage.branches.toFixed(2)}% (${report.thresholdsMet.branches ? '✅' : '❌'})`);
    console.log(`\nFiles: ${report.fileCount} (${report.fullyCoveredCount} fully covered)`);
    
    if (report.lowCoverageFiles.length > 0) {
      console.log(`\nFiles needing attention:`);
      report.lowCoverageFiles.forEach(file => {
        console.log(`- ${file.file}: ${file.lineCoverage.toFixed(2)}% lines, ${file.functionCoverage.toFixed(2)}% functions`);
      });
    }
    
    const reportPath = path.join(analyzer.options.outputDir, 'coverage-summary.html');
    console.log(`\nDetailed report: ${reportPath}`);
    
    // Exit with error if thresholds not met
    if (!report.thresholdsMet.lines || !report.thresholdsMet.functions || !report.thresholdsMet.branches) {
      console.error('\nCoverage thresholds not met!');
      process.exit(1);
    }
  } else {
    console.error('Failed to generate coverage report');
    process.exit(1);
  }
}

runCoverage().catch(err => {
  console.error('Coverage analysis failed:', err);
  process.exit(1);
});