/**
 * Test Coverage Analyzer
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestCoverageAnalyzer {
  constructor(options = {}) {
    this.options = {
      outputDir: path.resolve(process.cwd(), 'coverage'),
      testPattern: 'src/tests/**/*.test.js',
      threshold: {
        lines: 70,
        functions: 70,
        branches: 60
      },
      ...options
    };
    
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }
  }

  async analyze() {
    // Install c8 if needed
    try {
      execSync('npx c8 --version', { stdio: 'ignore' });
    } catch (e) {
      console.log('Installing c8...');
      execSync('npm install --no-save c8', { stdio: 'inherit' });
    }
    
    // Run tests with coverage
    console.log('Running tests with coverage...');
    execSync(
      `npx c8 --reporter=html --reporter=json-summary --reporter=text ` +
      `--report-dir=${this.options.outputDir} ` +
      `npx playwright test ${this.options.testPattern}`,
      { stdio: 'inherit' }
    );
    
    // Read coverage summary
    const summaryPath = path.join(this.options.outputDir, 'coverage-summary.json');
    if (!fs.existsSync(summaryPath)) {
      console.error('No coverage summary generated');
      return null;
    }
    
    const coverageSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    return this.generateReport(coverageSummary);
  }
  
  generateReport(coverageSummary) {
    const total = coverageSummary.total;
    
    // Calculate overall coverage
    const overallCoverage = {
      lines: total.lines.pct,
      statements: total.statements.pct,
      functions: total.functions.pct,
      branches: total.branches.pct
    };
    
    // Get files with low coverage
    const lowCoverageFiles = Object.entries(coverageSummary)
      .filter(([file, data]) => file !== 'total' && data.lines.pct < this.options.threshold.lines)
      .map(([file, data]) => ({
        file,
        lineCoverage: data.lines.pct,
        functionCoverage: data.functions.pct,
        branchCoverage: data.branches.pct,
        uncoveredLines: data.lines.skipped || []
      }));
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      overallCoverage,
      fileCount: Object.keys(coverageSummary).length - 1, // Exclude total
      fullyCoveredCount: Object.entries(coverageSummary)
        .filter(([file, data]) => file !== 'total' && data.lines.pct === 100).length,
      lowCoverageFiles,
      thresholdsMet: {
        lines: overallCoverage.lines >= this.options.threshold.lines,
        functions: overallCoverage.functions >= this.options.threshold.functions,
        branches: overallCoverage.branches >= this.options.threshold.branches
      }
    };
    
    // Save report
    fs.writeFileSync(
      path.join(this.options.outputDir, 'coverage-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Generate HTML summary
    this.generateHtmlSummary(report, coverageSummary);
    
    return report;
  }
  
  generateHtmlSummary(report, coverageSummary) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Coverage Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { margin-bottom: 20px; }
          .progress { height: 20px; background: #f0f0f0; border-radius: 3px; margin-bottom: 10px; }
          .progress-bar { height: 100%; background: #4CAF50; border-radius: 3px; }
          .progress-bar.warning { background: #FFC107; }
          .progress-bar.danger { background: #F44336; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Test Coverage Report</h1>
        <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
        
        <div class="summary">
          <h2>Overall Coverage</h2>
          <div>
            <strong>Lines:</strong> ${report.overallCoverage.lines.toFixed(2)}% 
            (Threshold: ${this.options.threshold.lines}%)
            <div class="progress">
              <div class="progress-bar ${report.overallCoverage.lines < this.options.threshold.lines ? 'danger' : ''}" 
                   style="width: ${report.overallCoverage.lines}%"></div>
            </div>
          </div>
          <div>
            <strong>Functions:</strong> ${report.overallCoverage.functions.toFixed(2)}% 
            (Threshold: ${this.options.threshold.functions}%)
            <div class="progress">
              <div class="progress-bar ${report.overallCoverage.functions < this.options.threshold.functions ? 'danger' : ''}" 
                   style="width: ${report.overallCoverage.functions}%"></div>
            </div>
          </div>
          <div>
            <strong>Branches:</strong> ${report.overallCoverage.branches.toFixed(2)}% 
            (Threshold: ${this.options.threshold.branches}%)
            <div class="progress">
              <div class="progress-bar ${report.overallCoverage.branches < this.options.threshold.branches ? 'danger' : ''}" 
                   style="width: ${report.overallCoverage.branches}%"></div>
            </div>
          </div>
        </div>
        
        <div>
          <h2>Files Summary</h2>
          <p>Total Files: ${report.fileCount}</p>
          <p>Fully Covered Files: ${report.fullyCoveredCount}</p>
          <p>Low Coverage Files: ${report.lowCoverageFiles.length}</p>
        </div>
        
        <div>
          <h2>Files Needing Attention</h2>
          <table>
            <tr>
              <th>File</th>
              <th>Line Coverage</th>
              <th>Function Coverage</th>
              <th>Branch Coverage</th>
            </tr>
            ${report.lowCoverageFiles.map(file => `
              <tr>
                <td>${file.file}</td>
                <td>${file.lineCoverage.toFixed(2)}%</td>
                <td>${file.functionCoverage.toFixed(2)}%</td>
                <td>${file.branchCoverage.toFixed(2)}%</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </body>
      </html>
    `;
    
    fs.writeFileSync(
      path.join(this.options.outputDir, 'coverage-summary.html'),
      html
    );
  }
}

module.exports = TestCoverageAnalyzer;