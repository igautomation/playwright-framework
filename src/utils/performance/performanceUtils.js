/**
 * Performance testing utilities for Playwright
 */
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');
const PlaywrightErrorHandler = require('../common/errorHandler');

/**
 * Utilities for performance testing
 */
class PerformanceUtils {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   * @param {Object} options - Configuration options
   */
  constructor(page, options = {}) {
    this.page = page;
    this.outputDir = options.outputDir || path.join(process.cwd(), 'reports', 'performance');
    this.traceDir = options.traceDir || path.join(process.cwd(), 'traces');
    
    // Create directories if they don't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.traceDir)) {
      fs.mkdirSync(this.traceDir, { recursive: true });
    }
  }
  
  /**
   * Measure page load performance
   * @param {string} url - URL to navigate to
   * @param {Object} options - Options
   * @returns {Promise<Object>} Performance metrics
   */
  async measurePageLoad(url, options = {}) {
    try {
      // Start tracing if enabled
      if (options.trace) {
        await this.page.context().tracing.start({ 
          screenshots: true, 
          snapshots: true 
        });
      }
      
      // Enable JS coverage if requested
      if (options.coverage) {
        await this.page.coverage.startJSCoverage();
        await this.page.coverage.startCSSCoverage();
      }
      
      // Navigate to the page and measure performance
      const startTime = Date.now();
      const response = await this.page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      const loadTime = Date.now() - startTime;
      
      // Get performance metrics
      const metrics = await this.page.evaluate(() => JSON.stringify(window.performance));
      const performanceMetrics = JSON.parse(metrics);
      
      // Get resource timing entries
      const resourceTimings = await this.page.evaluate(() => {
        return JSON.stringify(
          Array.from(window.performance.getEntriesByType('resource'))
        );
      });
      
      // Get JS coverage if enabled
      let jsCoverage = null;
      let cssCoverage = null;
      
      if (options.coverage) {
        jsCoverage = await this.page.coverage.stopJSCoverage();
        cssCoverage = await this.page.coverage.stopCSSCoverage();
      }
      
      // Stop tracing if enabled
      let tracePath = null;
      if (options.trace) {
        tracePath = options.tracePath || path.join(this.traceDir, `trace-${Date.now()}.zip`);
        await this.page.context().tracing.stop({ path: tracePath });
      }
      
      // Take a screenshot if enabled
      let screenshotPath = null;
      if (options.screenshot) {
        screenshotPath = options.screenshotPath || path.join(
          this.outputDir,
          'screenshots',
          `performance-${Date.now()}.png`
        );
        
        // Ensure directory exists
        const screenshotDir = path.dirname(screenshotPath);
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        await this.page.screenshot({ path: screenshotPath });
      }
      
      // Calculate total resource size
      const resources = JSON.parse(resourceTimings);
      const totalResourceSize = resources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      // Calculate JS and CSS coverage
      let jsUsage = null;
      let cssUsage = null;
      
      if (options.coverage) {
        const calculateUsage = (coverage) => {
          let totalBytes = 0;
          let usedBytes = 0;
          
          for (const entry of coverage) {
            totalBytes += entry.text.length;
            
            for (const range of entry.ranges) {
              usedBytes += range.end - range.start;
            }
          }
          
          return {
            totalBytes,
            usedBytes,
            usagePercentage: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0
          };
        };
        
        jsUsage = calculateUsage(jsCoverage);
        cssUsage = calculateUsage(cssCoverage);
      }
      
      // Extract key metrics
      const navigationStart = performanceMetrics.timing.navigationStart;
      const domComplete = performanceMetrics.timing.domComplete;
      const loadEventEnd = performanceMetrics.timing.loadEventEnd;
      
      const result = {
        url,
        loadTime,
        statusCode: response.status(),
        timing: {
          ttfb: performanceMetrics.timing.responseStart - navigationStart,
          domContentLoaded: performanceMetrics.timing.domContentLoadedEventEnd - navigationStart,
          domComplete: domComplete - navigationStart,
          loadEvent: loadEventEnd - navigationStart
        },
        resources: {
          count: resources.length,
          totalSize: totalResourceSize,
          byType: this._groupResourcesByType(resources)
        },
        coverage: options.coverage ? {
          js: jsUsage,
          css: cssUsage
        } : null,
        tracePath,
        screenshotPath
      };
      
      // Save results if path provided
      if (options.outputPath) {
        // Ensure directory exists
        const outputDir = path.dirname(options.outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(options.outputPath, JSON.stringify(result, null, 2));
      }
      
      return result;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'measuring page load performance',
        url,
        options
      });
    }
  }
  
  /**
   * Group resources by type
   * @param {Array} resources - Resource timing entries
   * @returns {Object} Resources grouped by type
   * @private
   */
  _groupResourcesByType(resources) {
    const types = {};
    
    resources.forEach(resource => {
      const url = resource.name;
      let type = 'other';
      
      if (url.match(/\.js(\?|$)/)) {
        type = 'script';
      } else if (url.match(/\.css(\?|$)/)) {
        type = 'stylesheet';
      } else if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/)) {
        type = 'image';
      } else if (url.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/)) {
        type = 'font';
      } else if (url.match(/\.(json|xml)(\?|$)/)) {
        type = 'data';
      } else if (url.match(/\.(mp4|webm|ogg)(\?|$)/)) {
        type = 'media';
      }
      
      if (!types[type]) {
        types[type] = {
          count: 0,
          size: 0,
          items: []
        };
      }
      
      types[type].count++;
      types[type].size += (resource.transferSize || 0);
      types[type].items.push({
        url: resource.name,
        size: resource.transferSize || 0,
        duration: resource.duration
      });
    });
    
    return types;
  }
  
  /**
   * Measure user interaction performance
   * @param {Function} interactionFn - Function that performs the interaction
   * @param {Object} options - Options
   * @returns {Promise<Object>} Performance metrics
   */
  async measureInteraction(interactionFn, options = {}) {
    try {
      // Start tracing if enabled
      if (options.trace) {
        await this.page.context().tracing.start({ 
          screenshots: true, 
          snapshots: true 
        });
      }
      
      // Measure interaction time
      const startTime = Date.now();
      await interactionFn(this.page);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Stop tracing if enabled
      let tracePath = null;
      if (options.trace) {
        tracePath = options.tracePath || path.join(this.traceDir, `interaction-trace-${Date.now()}.zip`);
        await this.page.context().tracing.stop({ path: tracePath });
      }
      
      // Take a screenshot if enabled
      let screenshotPath = null;
      if (options.screenshot) {
        screenshotPath = options.screenshotPath || path.join(
          this.outputDir,
          'screenshots',
          `interaction-${Date.now()}.png`
        );
        
        // Ensure directory exists
        const screenshotDir = path.dirname(screenshotPath);
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        await this.page.screenshot({ path: screenshotPath });
      }
      
      const result = {
        name: options.name || 'Unnamed interaction',
        duration,
        tracePath,
        screenshotPath
      };
      
      // Save results if path provided
      if (options.outputPath) {
        // Ensure directory exists
        const outputDir = path.dirname(options.outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(options.outputPath, JSON.stringify(result, null, 2));
      }
      
      return result;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'measuring interaction performance',
        options
      });
    }
  }
  
  /**
   * Run a performance test suite
   * @param {Array} scenarios - Array of test scenarios
   * @param {Object} options - Options
   * @returns {Promise<Object>} Test results
   */
  async runPerformanceTestSuite(scenarios, options = {}) {
    const results = [];
    const startTime = Date.now();
    
    try {
      for (const scenario of scenarios) {
        logger.info(`Running performance scenario: ${scenario.name}`);
        
        // Run the scenario
        const scenarioResult = await this._runScenario(scenario);
        results.push(scenarioResult);
        
        // Wait between scenarios if specified
        if (options.delayBetweenScenarios && scenarios.indexOf(scenario) < scenarios.length - 1) {
          await new Promise(resolve => setTimeout(resolve, options.delayBetweenScenarios));
        }
      }
      
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      const testSuiteResult = {
        name: options.name || 'Performance Test Suite',
        timestamp: new Date().toISOString(),
        duration: totalDuration,
        scenarioCount: scenarios.length,
        scenarios: results
      };
      
      // Generate report if enabled
      if (options.generateReport) {
        const reportPath = options.reportPath || path.join(
          this.outputDir,
          `performance-report-${Date.now()}.html`
        );
        
        await this.generateReport(testSuiteResult, reportPath);
        testSuiteResult.reportPath = reportPath;
      }
      
      // Save results if path provided
      if (options.outputPath) {
        // Ensure directory exists
        const outputDir = path.dirname(options.outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(options.outputPath, JSON.stringify(testSuiteResult, null, 2));
      }
      
      return testSuiteResult;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'running performance test suite',
        options
      });
    }
  }
  
  /**
   * Run a single performance test scenario
   * @param {Object} scenario - Test scenario
   * @returns {Promise<Object>} Scenario result
   * @private
   */
  async _runScenario(scenario) {
    try {
      const scenarioStartTime = Date.now();
      let result = null;
      
      // Handle different scenario types
      switch (scenario.type) {
        case 'pageLoad':
          result = await this.measurePageLoad(scenario.url, scenario.options || {});
          break;
        case 'interaction':
          result = await this.measureInteraction(scenario.interactionFn, scenario.options || {});
          break;
        default:
          throw new Error(`Unknown scenario type: ${scenario.type}`);
      }
      
      const scenarioEndTime = Date.now();
      
      return {
        name: scenario.name,
        type: scenario.type,
        duration: scenarioEndTime - scenarioStartTime,
        result
      };
    } catch (error) {
      logger.error(`Error running scenario ${scenario.name}:`, error);
      
      return {
        name: scenario.name,
        type: scenario.type,
        error: error.message,
        stack: error.stack
      };
    }
  }
  
  /**
   * Generate a performance test report
   * @param {Object} testSuiteResult - Test suite result
   * @param {string} outputPath - Path to save the report
   * @returns {Promise<string>} Path to the report
   */
  async generateReport(testSuiteResult, outputPath) {
    try {
      // Generate report path if not provided
      const reportPath = outputPath || path.join(this.outputDir, `performance-report-${Date.now()}.html`);
      
      // Ensure directory exists
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Generate HTML report
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Performance Test Report</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
            .scenario {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .scenario h3 {
              margin-top: 0;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .error {
              color: #e74c3c;
              background-color: #fadbd8;
              padding: 10px;
              border-radius: 5px;
              margin-top: 10px;
            }
            .metrics {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              margin-top: 15px;
            }
            .metric {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              flex: 1;
              min-width: 200px;
            }
            .metric h4 {
              margin-top: 0;
              color: #7f8c8d;
            }
            .metric .value {
              font-size: 24px;
              font-weight: bold;
              color: #2980b9;
            }
            .chart-container {
              width: 100%;
              max-width: 800px;
              margin: 20px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          <h1>Performance Test Report</h1>
          <div class="summary">
            <p><strong>Test Suite:</strong> ${testSuiteResult.name}</p>
            <p><strong>Generated:</strong> ${new Date(testSuiteResult.timestamp).toLocaleString()}</p>
            <p><strong>Total Duration:</strong> ${(testSuiteResult.duration / 1000).toFixed(2)} seconds</p>
            <p><strong>Scenarios:</strong> ${testSuiteResult.scenarioCount}</p>
          </div>
          
          <h2>Scenarios</h2>
          ${testSuiteResult.scenarios.map(scenario => `
            <div class="scenario">
              <h3>${scenario.name} (${scenario.type})</h3>
              
              ${scenario.error ? `
                <div class="error">
                  <p><strong>Error:</strong> ${scenario.error}</p>
                  <pre>${scenario.stack}</pre>
                </div>
              ` : scenario.type === 'pageLoad' ? `
                <div class="metrics">
                  <div class="metric">
                    <h4>Total Load Time</h4>
                    <div class="value">${(scenario.result.loadTime / 1000).toFixed(2)}s</div>
                  </div>
                  <div class="metric">
                    <h4>TTFB</h4>
                    <div class="value">${(scenario.result.timing.ttfb / 1000).toFixed(2)}s</div>
                  </div>
                  <div class="metric">
                    <h4>DOM Content Loaded</h4>
                    <div class="value">${(scenario.result.timing.domContentLoaded / 1000).toFixed(2)}s</div>
                  </div>
                  <div class="metric">
                    <h4>DOM Complete</h4>
                    <div class="value">${(scenario.result.timing.domComplete / 1000).toFixed(2)}s</div>
                  </div>
                </div>
                
                <h4>Resources</h4>
                <div class="metrics">
                  <div class="metric">
                    <h4>Total Resources</h4>
                    <div class="value">${scenario.result.resources.count}</div>
                  </div>
                  <div class="metric">
                    <h4>Total Size</h4>
                    <div class="value">${(scenario.result.resources.totalSize / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
                
                <div class="chart-container">
                  <canvas id="resourceChart-${scenario.name.replace(/\s+/g, '-')}"></canvas>
                </div>
                
                <h4>Resource Breakdown</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Count</th>
                      <th>Size (KB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(scenario.result.resources.byType).map(([type, data]) => `
                      <tr>
                        <td>${type}</td>
                        <td>${data.count}</td>
                        <td>${(data.size / 1024).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                ${scenario.result.coverage ? `
                  <h4>Code Coverage</h4>
                  <div class="metrics">
                    <div class="metric">
                      <h4>JS Usage</h4>
                      <div class="value">${scenario.result.coverage.js.usagePercentage.toFixed(2)}%</div>
                      <p>${(scenario.result.coverage.js.usedBytes / 1024).toFixed(2)} KB used of ${(scenario.result.coverage.js.totalBytes / 1024).toFixed(2)} KB</p>
                    </div>
                    <div class="metric">
                      <h4>CSS Usage</h4>
                      <div class="value">${scenario.result.coverage.css.usagePercentage.toFixed(2)}%</div>
                      <p>${(scenario.result.coverage.css.usedBytes / 1024).toFixed(2)} KB used of ${(scenario.result.coverage.css.totalBytes / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  
                  <div class="chart-container">
                    <canvas id="coverageChart-${scenario.name.replace(/\s+/g, '-')}"></canvas>
                  </div>
                ` : ''}
                
                ${scenario.result.screenshotPath ? `
                  <h4>Screenshot</h4>
                  <img src="file://${scenario.result.screenshotPath}" alt="Screenshot" style="max-width: 100%; border: 1px solid #ddd;">
                ` : ''}
              ` : scenario.type === 'interaction' ? `
                <div class="metrics">
                  <div class="metric">
                    <h4>Interaction Duration</h4>
                    <div class="value">${(scenario.result.duration / 1000).toFixed(2)}s</div>
                  </div>
                </div>
                
                ${scenario.result.screenshotPath ? `
                  <h4>Screenshot</h4>
                  <img src="file://${scenario.result.screenshotPath}" alt="Screenshot" style="max-width: 100%; border: 1px solid #ddd;">
                ` : ''}
              ` : ''}
            </div>
          `).join('')}
          
          <script>
            // Create charts for each page load scenario
            ${testSuiteResult.scenarios
              .filter(scenario => scenario.type === 'pageLoad' && !scenario.error)
              .map(scenario => `
                {
                  const ctx = document.getElementById('resourceChart-${scenario.name.replace(/\s+/g, '-')}');
                  new Chart(ctx, {
                    type: 'pie',
                    data: {
                      labels: [${Object.keys(scenario.result.resources.byType).map(type => `'${type}'`).join(', ')}],
                      datasets: [{
                        label: 'Resource Size (KB)',
                        data: [${Object.values(scenario.result.resources.byType).map(data => (data.size / 1024).toFixed(2)).join(', ')}],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.7)',
                          'rgba(54, 162, 235, 0.7)',
                          'rgba(255, 206, 86, 0.7)',
                          'rgba(75, 192, 192, 0.7)',
                          'rgba(153, 102, 255, 0.7)',
                          'rgba(255, 159, 64, 0.7)',
                          'rgba(199, 199, 199, 0.7)'
                        ]
                      }]
                    },
                    options: {
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Resource Distribution by Type'
                        }
                      }
                    }
                  });
                  
                  ${scenario.result.coverage ? `
                    const coverageCtx = document.getElementById('coverageChart-${scenario.name.replace(/\s+/g, '-')}');
                    new Chart(coverageCtx, {
                      type: 'bar',
                      data: {
                        labels: ['JavaScript', 'CSS'],
                        datasets: [
                          {
                            label: 'Used (KB)',
                            data: [
                              ${(scenario.result.coverage.js.usedBytes / 1024).toFixed(2)},
                              ${(scenario.result.coverage.css.usedBytes / 1024).toFixed(2)}
                            ],
                            backgroundColor: 'rgba(75, 192, 192, 0.7)'
                          },
                          {
                            label: 'Unused (KB)',
                            data: [
                              ${((scenario.result.coverage.js.totalBytes - scenario.result.coverage.js.usedBytes) / 1024).toFixed(2)},
                              ${((scenario.result.coverage.css.totalBytes - scenario.result.coverage.css.usedBytes) / 1024).toFixed(2)}
                            ],
                            backgroundColor: 'rgba(255, 99, 132, 0.7)'
                          }
                        ]
                      },
                      options: {
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Code Coverage'
                          }
                        },
                        scales: {
                          x: {
                            stacked: true,
                          },
                          y: {
                            stacked: true
                          }
                        }
                      }
                    });
                  ` : ''}
                }
              `).join('')}
          </script>
        </body>
        </html>
      `;
      
      // Write report to file
      fs.writeFileSync(reportPath, html);
      
      return reportPath;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'generating performance report',
        testSuiteResult,
        outputPath
      });
    }
  }
}

module.exports = PerformanceUtils;