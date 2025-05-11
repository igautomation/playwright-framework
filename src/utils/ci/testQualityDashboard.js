/**
 * Test Quality Dashboard for Playwright Framework
 * 
 * Generates a dashboard with test quality metrics
 */
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

class TestQualityDashboard {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      dataDir: path.join(process.cwd(), 'reports/dashboard'),
      historySize: 10,
      ...options
    };
    
    // Ensure data directory exists
    if (!fs.existsSync(this.options.dataDir)) {
      fs.mkdirSync(this.options.dataDir, { recursive: true });
    }
  }

  /**
   * Add test run data
   * @param {Object} data - Test run data
   * @returns {Promise<string>} Path to saved data file
   */
  async addTestRun(data) {
    try {
      // Generate run ID
      const runId = data.runId || `run-${Date.now()}`;
      
      // Add timestamp if not present
      if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
      }
      
      // Save run data
      const runDataPath = path.join(this.options.dataDir, `${runId}.json`);
      fs.writeFileSync(runDataPath, JSON.stringify(data, null, 2));
      
      // Update history
      await this._updateHistory(runId, data);
      
      return runDataPath;
    } catch (error) {
      logger.error('Error adding test run data:', error);
      throw error;
    }
  }

  /**
   * Update test run history
   * @param {string} runId - Run ID
   * @param {Object} data - Run data
   * @returns {Promise<void>}
   * @private
   */
  async _updateHistory(runId, data) {
    const historyPath = path.join(this.options.dataDir, 'history.json');
    
    // Read existing history or create new one
    let history = [];
    if (fs.existsSync(historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      } catch (error) {
        logger.warn('Error reading history file, creating new one:', error.message);
      }
    }
    
    // Add new run to history
    history.unshift({
      runId,
      timestamp: data.timestamp,
      summary: {
        total: data.summary?.total || 0,
        passed: data.summary?.passed || 0,
        failed: data.summary?.failed || 0,
        skipped: data.summary?.skipped || 0,
        duration: data.summary?.duration || 0,
        passRate: data.summary?.passRate || 0
      }
    });
    
    // Limit history size
    if (history.length > this.options.historySize) {
      history = history.slice(0, this.options.historySize);
    }
    
    // Save updated history
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  }

  /**
   * Get test run history
   * @returns {Promise<Array>} Test run history
   */
  async getHistory() {
    const historyPath = path.join(this.options.dataDir, 'history.json');
    
    if (!fs.existsSync(historyPath)) {
      return [];
    }
    
    try {
      return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (error) {
      logger.error('Error reading history file:', error);
      return [];
    }
  }

  /**
   * Get test run data
   * @param {string} runId - Run ID
   * @returns {Promise<Object>} Test run data
   */
  async getTestRun(runId) {
    const runDataPath = path.join(this.options.dataDir, `${runId}.json`);
    
    if (!fs.existsSync(runDataPath)) {
      throw new Error(`Test run data not found for ID: ${runId}`);
    }
    
    try {
      return JSON.parse(fs.readFileSync(runDataPath, 'utf8'));
    } catch (error) {
      logger.error(`Error reading test run data for ID ${runId}:`, error);
      throw error;
    }
  }

  /**
   * Generate dashboard
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} Path to generated dashboard
   */
  async generateDashboard(outputPath) {
    try {
      // Get test run history
      const history = await this.getHistory();
      
      if (history.length === 0) {
        throw new Error('No test run history available');
      }
      
      // Generate dashboard HTML
      const html = this._generateDashboardHtml(history);
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write dashboard to file
      fs.writeFileSync(outputPath, html);
      
      logger.info(`Dashboard generated at: ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error('Error generating dashboard:', error);
      throw error;
    }
  }

  /**
   * Generate dashboard HTML
   * @param {Array} history - Test run history
   * @returns {string} Dashboard HTML
   * @private
   */
  _generateDashboardHtml(history) {
    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };
    
    // Format duration
    const formatDuration = (ms) => {
      if (!ms) return '0s';
      if (ms < 1000) return `${ms}ms`;
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    };
    
    // Calculate trends
    const calculateTrends = () => {
      if (history.length < 2) return { passRate: 0, duration: 0 };
      
      const current = history[0].summary;
      const previous = history[1].summary;
      
      return {
        passRate: current.passRate - previous.passRate,
        duration: previous.duration ? ((current.duration - previous.duration) / previous.duration) * 100 : 0
      };
    };
    
    const trends = calculateTrends();
    
    // Generate chart data
    const generateChartData = () => {
      const labels = history.map(run => formatDate(run.timestamp).split(',')[0]).reverse();
      const passRates = history.map(run => run.summary.passRate).reverse();
      const failRates = history.map(run => 100 - run.summary.passRate).reverse();
      
      return {
        labels: JSON.stringify(labels),
        passRates: JSON.stringify(passRates),
        failRates: JSON.stringify(failRates)
      };
    };
    
    const chartData = generateChartData();
    
    // Generate HTML
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Quality Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #f8f9fa;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .card {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
            text-align: center;
          }
          .card h3 {
            margin-top: 0;
            color: #7f8c8d;
            font-size: 16px;
            font-weight: normal;
          }
          .card .value {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
          }
          .card .trend {
            font-size: 14px;
          }
          .card .trend.positive {
            color: #27ae60;
          }
          .card .trend.negative {
            color: #e74c3c;
          }
          .card.pass-rate .value {
            color: #27ae60;
          }
          .card.fail-rate .value {
            color: #e74c3c;
          }
          .card.duration .value {
            color: #3498db;
          }
          .chart-container {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 30px;
          }
          .history {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          tr:hover {
            background-color: #f8f9fa;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: #fff;
          }
          .badge.pass {
            background-color: #27ae60;
          }
          .badge.fail {
            background-color: #e74c3c;
          }
          .badge.skip {
            background-color: #f39c12;
          }
        </style>
      </head>
      <body>
        <h1>Test Quality Dashboard</h1>
        
        <div class="dashboard">
          <div class="card pass-rate">
            <h3>Pass Rate</h3>
            <div class="value">${history[0].summary.passRate.toFixed(1)}%</div>
            <div class="trend ${trends.passRate >= 0 ? 'positive' : 'negative'}">
              ${trends.passRate >= 0 ? '↑' : '↓'} ${Math.abs(trends.passRate).toFixed(1)}%
            </div>
          </div>
          
          <div class="card fail-rate">
            <h3>Fail Rate</h3>
            <div class="value">${(100 - history[0].summary.passRate).toFixed(1)}%</div>
            <div class="trend ${trends.passRate >= 0 ? 'positive' : 'negative'}">
              ${trends.passRate >= 0 ? '↓' : '↑'} ${Math.abs(trends.passRate).toFixed(1)}%
            </div>
          </div>
          
          <div class="card">
            <h3>Total Tests</h3>
            <div class="value">${history[0].summary.total}</div>
          </div>
          
          <div class="card duration">
            <h3>Duration</h3>
            <div class="value">${formatDuration(history[0].summary.duration)}</div>
            <div class="trend ${trends.duration <= 0 ? 'positive' : 'negative'}">
              ${trends.duration <= 0 ? '↓' : '↑'} ${Math.abs(trends.duration).toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <canvas id="passRateChart"></canvas>
        </div>
        
        <div class="history">
          <h2>Test Run History</h2>
          <table>
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Date</th>
                <th>Pass Rate</th>
                <th>Tests</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skipped</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(run => `
                <tr>
                  <td>${run.runId}</td>
                  <td>${formatDate(run.timestamp)}</td>
                  <td>
                    <div class="badge ${run.summary.passRate >= 90 ? 'pass' : run.summary.passRate >= 70 ? 'skip' : 'fail'}">
                      ${run.summary.passRate.toFixed(1)}%
                    </div>
                  </td>
                  <td>${run.summary.total}</td>
                  <td>${run.summary.passed}</td>
                  <td>${run.summary.failed}</td>
                  <td>${run.summary.skipped}</td>
                  <td>${formatDuration(run.summary.duration)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <script>
          // Create pass rate chart
          const ctx = document.getElementById('passRateChart').getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ${chartData.labels},
              datasets: [
                {
                  label: 'Pass Rate',
                  data: ${chartData.passRates},
                  backgroundColor: 'rgba(39, 174, 96, 0.2)',
                  borderColor: 'rgba(39, 174, 96, 1)',
                  borderWidth: 2,
                  tension: 0.3,
                  fill: true
                },
                {
                  label: 'Fail Rate',
                  data: ${chartData.failRates},
                  backgroundColor: 'rgba(231, 76, 60, 0.2)',
                  borderColor: 'rgba(231, 76, 60, 1)',
                  borderWidth: 2,
                  tension: 0.3,
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Pass/Fail Rate Trend',
                  font: {
                    size: 16
                  }
                },
                legend: {
                  position: 'top',
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Percentage (%)'
                  }
                }
              }
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}

module.exports = TestQualityDashboard;