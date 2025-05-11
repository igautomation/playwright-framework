/**
 * Test Coverage Analyzer for Playwright Framework
 * 
 * Analyzes test coverage and provides insights for improving test quality
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob').glob;
const logger = require('../common/logger');

class TestCoverageAnalyzer {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      testDir: path.join(process.cwd(), 'src/tests'),
      sourceDir: path.join(process.cwd(), 'src'),
      coverageThreshold: 80,
      excludePatterns: ['node_modules', 'dist', 'build', 'coverage'],
      ...options
    };
  }

  /**
   * Analyze test coverage
   * @returns {Promise<Object>} Coverage analysis results
   */
  async analyzeCoverage() {
    logger.info('Analyzing test coverage...');

    try {
      // Find all test files
      const testFiles = this._findTestFiles();
      logger.info(`Found ${testFiles.length} test files`);

      // Find all source files
      const sourceFiles = this._findSourceFiles();
      logger.info(`Found ${sourceFiles.length} source files`);

      // Analyze test-to-source mapping
      const coverage = this._analyzeTestSourceMapping(testFiles, sourceFiles);

      // Calculate coverage metrics
      const metrics = this._calculateCoverageMetrics(coverage);

      // Identify coverage gaps
      const gaps = this._identifyCoverageGaps(coverage, metrics);

      return {
        metrics,
        coverage,
        gaps,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error analyzing test coverage:', error);
      throw error;
    }
  }

  /**
   * Find all test files
   * @returns {Array<string>} Test file paths
   * @private
   */
  _findTestFiles() {
    const pattern = path.join(this.options.testDir, '**/*.spec.js');
    return glob.sync(pattern);
  }

  /**
   * Find all source files
   * @returns {Array<string>} Source file paths
   * @private
   */
  _findSourceFiles() {
    const pattern = path.join(this.options.sourceDir, '**/*.js');
    return glob.sync(pattern).filter(file => {
      // Exclude test files and files in excluded directories
      const relativePath = path.relative(process.cwd(), file);
      return !file.includes('.spec.js') && 
             !this.options.excludePatterns.some(pattern => 
               relativePath.includes(pattern)
             );
    });
  }

  /**
   * Analyze test-to-source mapping
   * @param {Array<string>} testFiles - Test file paths
   * @param {Array<string>} sourceFiles - Source file paths
   * @returns {Object} Coverage mapping
   * @private
   */
  _analyzeTestSourceMapping(testFiles, sourceFiles) {
    const coverage = {
      testedFiles: new Set(),
      untestedFiles: new Set(),
      fileMapping: new Map()
    };

    // Create a map of source files for quick lookup
    const sourceFileMap = new Map();
    sourceFiles.forEach(file => {
      const relativePath = path.relative(this.options.sourceDir, file);
      sourceFileMap.set(relativePath, file);
      
      // Initialize file mapping
      coverage.fileMapping.set(file, {
        tests: [],
        covered: false
      });
    });

    // Analyze each test file to determine which source files it tests
    testFiles.forEach(testFile => {
      try {
        const content = fs.readFileSync(testFile, 'utf8');
        const testInfo = {
          path: testFile,
          name: path.basename(testFile),
          imports: this._extractImports(content),
          testCount: this._countTests(content)
        };

        // Check which source files this test imports
        testInfo.imports.forEach(importPath => {
          // Try to resolve the import to a source file
          const possiblePaths = this._resolveImportPath(importPath, testFile);
          
          for (const possiblePath of possiblePaths) {
            if (sourceFileMap.has(possiblePath)) {
              const sourceFile = sourceFileMap.get(possiblePath);
              coverage.testedFiles.add(sourceFile);
              
              // Update file mapping
              const fileInfo = coverage.fileMapping.get(sourceFile);
              if (fileInfo) {
                fileInfo.tests.push(testFile);
                fileInfo.covered = true;
              }
            }
          }
        });
      } catch (error) {
        logger.warn(`Error analyzing test file ${testFile}:`, error.message);
      }
    });

    // Identify untested files
    sourceFiles.forEach(file => {
      if (!coverage.testedFiles.has(file)) {
        coverage.untestedFiles.add(file);
      }
    });

    return coverage;
  }

  /**
   * Extract imports from file content
   * @param {string} content - File content
   * @returns {Array<string>} Import paths
   * @private
   */
  _extractImports(content) {
    const imports = [];
    
    // Match ES6 imports
    const es6ImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = es6ImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Match CommonJS requires
    const commonJsRegex = /(?:const|let|var)\s+(?:\{[^}]*\}|\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    while ((match = commonJsRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * Count tests in file content
   * @param {string} content - File content
   * @returns {number} Test count
   * @private
   */
  _countTests(content) {
    const testMatches = content.match(/test\s*\(/g) || [];
    const itMatches = content.match(/it\s*\(/g) || [];
    return testMatches.length + itMatches.length;
  }

  /**
   * Resolve import path to possible file paths
   * @param {string} importPath - Import path
   * @param {string} fromFile - File containing the import
   * @returns {Array<string>} Possible file paths
   * @private
   */
  _resolveImportPath(importPath, fromFile) {
    const possiblePaths = [];
    
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const basePath = path.dirname(fromFile);
      const resolvedPath = path.resolve(basePath, importPath);
      const relativePath = path.relative(this.options.sourceDir, resolvedPath);
      
      possiblePaths.push(relativePath);
      possiblePaths.push(`${relativePath}.js`);
      possiblePaths.push(`${relativePath}/index.js`);
    } 
    // Handle absolute imports (assuming they're relative to sourceDir)
    else {
      possiblePaths.push(importPath);
      possiblePaths.push(`${importPath}.js`);
      possiblePaths.push(`${importPath}/index.js`);
    }
    
    return possiblePaths;
  }

  /**
   * Calculate coverage metrics
   * @param {Object} coverage - Coverage mapping
   * @returns {Object} Coverage metrics
   * @private
   */
  _calculateCoverageMetrics(coverage) {
    const totalFiles = coverage.fileMapping.size;
    const coveredFiles = coverage.testedFiles.size;
    const uncoveredFiles = coverage.untestedFiles.size;
    
    // Calculate file coverage percentage
    const fileCoverage = totalFiles > 0 ? (coveredFiles / totalFiles) * 100 : 0;
    
    // Calculate test density (tests per file)
    let totalTests = 0;
    coverage.fileMapping.forEach((info, file) => {
      totalTests += info.tests.length;
    });
    const testDensity = coveredFiles > 0 ? totalTests / coveredFiles : 0;
    
    return {
      totalFiles,
      coveredFiles,
      uncoveredFiles,
      fileCoverage,
      testDensity,
      meetsCoverageThreshold: fileCoverage >= this.options.coverageThreshold
    };
  }

  /**
   * Identify coverage gaps
   * @param {Object} coverage - Coverage mapping
   * @param {Object} metrics - Coverage metrics
   * @returns {Object} Coverage gaps
   * @private
   */
  _identifyCoverageGaps(coverage, metrics) {
    const gaps = {
      untested: Array.from(coverage.untestedFiles),
      lowCoverage: [],
      recommendations: []
    };
    
    // Add recommendations based on coverage
    if (metrics.fileCoverage < this.options.coverageThreshold) {
      gaps.recommendations.push({
        type: 'coverage',
        message: `File coverage (${metrics.fileCoverage.toFixed(2)}%) is below threshold (${this.options.coverageThreshold}%)`,
        priority: 'high'
      });
    }
    
    // Identify important files without tests
    const importantPatterns = ['service', 'util', 'helper', 'core', 'api'];
    const importantUntested = gaps.untested.filter(file => 
      importantPatterns.some(pattern => file.toLowerCase().includes(pattern))
    );
    
    if (importantUntested.length > 0) {
      gaps.recommendations.push({
        type: 'important',
        message: `${importantUntested.length} important files have no tests`,
        files: importantUntested,
        priority: 'high'
      });
    }
    
    // Identify files with low test coverage
    coverage.fileMapping.forEach((info, file) => {
      if (info.covered && info.tests.length === 1) {
        gaps.lowCoverage.push(file);
      }
    });
    
    if (gaps.lowCoverage.length > 0) {
      gaps.recommendations.push({
        type: 'lowCoverage',
        message: `${gaps.lowCoverage.length} files have minimal test coverage (only one test)`,
        files: gaps.lowCoverage,
        priority: 'medium'
      });
    }
    
    return gaps;
  }

  /**
   * Generate coverage report
   * @param {Object} analysis - Coverage analysis results
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} Report file path
   */
  async generateReport(analysis, outputPath) {
    logger.info('Generating coverage report...');
    
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Generate report content
      const report = {
        timestamp: new Date().toISOString(),
        metrics: analysis.metrics,
        gaps: {
          untestedCount: analysis.gaps.untested.length,
          lowCoverageCount: analysis.gaps.lowCoverage.length,
          recommendations: analysis.gaps.recommendations
        },
        details: {
          untested: analysis.gaps.untested.map(file => path.relative(process.cwd(), file)),
          lowCoverage: analysis.gaps.lowCoverage.map(file => path.relative(process.cwd(), file))
        }
      };
      
      // Write report to file
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      
      logger.info(`Coverage report generated at: ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error('Error generating coverage report:', error);
      throw error;
    }
  }

  /**
   * Generate HTML coverage report
   * @param {Object} analysis - Coverage analysis results
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} Report file path
   */
  async generateHtmlReport(analysis, outputPath) {
    logger.info('Generating HTML coverage report...');
    
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Generate HTML content
      const html = this._generateHtml(analysis);
      
      // Write HTML to file
      fs.writeFileSync(outputPath, html);
      
      logger.info(`HTML coverage report generated at: ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error('Error generating HTML coverage report:', error);
      throw error;
    }
  }

  /**
   * Generate HTML content
   * @param {Object} analysis - Coverage analysis results
   * @returns {string} HTML content
   * @private
   */
  _generateHtml(analysis) {
    const { metrics, gaps } = analysis;
    
    // Format file paths for display
    const formatPath = (filePath) => path.relative(process.cwd(), filePath);
    
    // Generate HTML
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Coverage Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
          }
          .stat {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            flex: 1;
            min-width: 150px;
            text-align: center;
          }
          .stat h3 {
            margin-top: 0;
            margin-bottom: 5px;
          }
          .stat .value {
            font-size: 24px;
            font-weight: bold;
          }
          .stat.good .value { color: #27ae60; }
          .stat.warning .value { color: #f39c12; }
          .stat.bad .value { color: #e74c3c; }
          
          .progress-bar {
            height: 20px;
            background-color: #ecf0f1;
            border-radius: 10px;
            margin: 10px 0;
            overflow: hidden;
          }
          .progress-bar .progress {
            height: 100%;
            background-color: #3498db;
            border-radius: 10px;
          }
          .progress-bar .progress.good { background-color: #27ae60; }
          .progress-bar .progress.warning { background-color: #f39c12; }
          .progress-bar .progress.bad { background-color: #e74c3c; }
          
          .recommendation {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 10px;
          }
          .recommendation.high {
            border-left: 5px solid #e74c3c;
          }
          .recommendation.medium {
            border-left: 5px solid #f39c12;
          }
          .recommendation.low {
            border-left: 5px solid #3498db;
          }
          
          .file-list {
            max-height: 200px;
            overflow-y: auto;
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
          }
          .file-list ul {
            margin: 0;
            padding-left: 20px;
          }
          .file-list li {
            margin-bottom: 5px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <h1>Test Coverage Report</h1>
        
        <div class="summary">
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          
          <div class="stats">
            <div class="stat ${metrics.fileCoverage >= 80 ? 'good' : metrics.fileCoverage >= 50 ? 'warning' : 'bad'}">
              <h3>File Coverage</h3>
              <div class="value">${metrics.fileCoverage.toFixed(1)}%</div>
              <div class="progress-bar">
                <div class="progress ${metrics.fileCoverage >= 80 ? 'good' : metrics.fileCoverage >= 50 ? 'warning' : 'bad'}" 
                     style="width: ${Math.min(100, metrics.fileCoverage)}%"></div>
              </div>
            </div>
            <div class="stat">
              <h3>Files</h3>
              <div class="value">${metrics.totalFiles}</div>
            </div>
            <div class="stat good">
              <h3>Covered</h3>
              <div class="value">${metrics.coveredFiles}</div>
            </div>
            <div class="stat bad">
              <h3>Uncovered</h3>
              <div class="value">${metrics.uncoveredFiles}</div>
            </div>
          </div>
        </div>
        
        <h2>Recommendations</h2>
        
        ${gaps.recommendations.map(rec => `
          <div class="recommendation ${rec.priority}">
            <h3>${rec.type === 'coverage' ? 'Improve Coverage' : 
                  rec.type === 'important' ? 'Test Important Files' : 
                  'Enhance Test Coverage'}</h3>
            <p>${rec.message}</p>
            ${rec.files ? `
              <div class="file-list">
                <ul>
                  ${rec.files.slice(0, 10).map(file => `
                    <li>${formatPath(file)}</li>
                  `).join('')}
                  ${rec.files.length > 10 ? `<li>...and ${rec.files.length - 10} more</li>` : ''}
                </ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
        
        <h2>Untested Files</h2>
        
        <p>The following ${gaps.untested.length} files have no tests:</p>
        
        <div class="file-list">
          <ul>
            ${gaps.untested.slice(0, 20).map(file => `
              <li>${formatPath(file)}</li>
            `).join('')}
            ${gaps.untested.length > 20 ? `<li>...and ${gaps.untested.length - 20} more</li>` : ''}
          </ul>
        </div>
        
        <h2>Files with Low Coverage</h2>
        
        <p>The following ${gaps.lowCoverage.length} files have minimal test coverage:</p>
        
        <div class="file-list">
          <ul>
            ${gaps.lowCoverage.slice(0, 20).map(file => `
              <li>${formatPath(file)}</li>
            `).join('')}
            ${gaps.lowCoverage.length > 20 ? `<li>...and ${gaps.lowCoverage.length - 20} more</li>` : ''}
          </ul>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = TestCoverageAnalyzer;