const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { PlaywrightService } = require('../common');
const logger = require('../common/logger');

/**
 * Chart Generator for creating chart images and reports
 */
class ChartGenerator {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.outputDir - Directory to store generated charts
   * @param {number} options.width - Default chart width
   * @param {number} options.height - Default chart height
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.resolve(process.cwd(), 'reports/charts');
    this.width = options.width || 800;
    this.height = options.height || 400;
    
    // Initialize chart renderer
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: this.width,
      height: this.height,
      backgroundColour: 'white'
    });
    
    // Initialize Playwright service
    this.playwrightService = new PlaywrightService({
      outputDir: path.join(this.outputDir, 'playwright')
    });
    
    // Create output directory if it doesn't exist
    this._ensureDirectoryExists(this.outputDir);
  }
  
  /**
   * Ensure directory exists
   * @param {string} dir - Directory path
   * @private
   */
  _ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Generate bar chart
   * @param {Object} config - Chart configuration
   * @param {string} filename - Output filename (without extension)
   * @returns {Promise<string>} Path to the generated chart
   */
  async generateBarChart(config, filename) {
    try {
      const chartConfig = {
        type: 'bar',
        data: {
          labels: config.labels,
          datasets: config.datasets
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: config.title || 'Bar Chart'
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };
      
      return this._generateChart(chartConfig, filename);
    } catch (error) {
      logger.error('Failed to generate bar chart', error);
      throw new Error(`Bar chart generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate line chart
   * @param {Object} config - Chart configuration
   * @param {string} filename - Output filename (without extension)
   * @returns {Promise<string>} Path to the generated chart
   */
  async generateLineChart(config, filename) {
    try {
      const chartConfig = {
        type: 'line',
        data: {
          labels: config.labels,
          datasets: config.datasets
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: config.title || 'Line Chart'
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };
      
      return this._generateChart(chartConfig, filename);
    } catch (error) {
      logger.error('Failed to generate line chart', error);
      throw new Error(`Line chart generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate pie chart
   * @param {Object} config - Chart configuration
   * @param {string} filename - Output filename (without extension)
   * @returns {Promise<string>} Path to the generated chart
   */
  async generatePieChart(config, filename) {
    try {
      const chartConfig = {
        type: 'pie',
        data: {
          labels: config.labels,
          datasets: [{
            data: config.data,
            backgroundColor: config.backgroundColor || [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)'
            ]
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: config.title || 'Pie Chart'
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          responsive: true
        }
      };
      
      return this._generateChart(chartConfig, filename);
    } catch (error) {
      logger.error('Failed to generate pie chart', error);
      throw new Error(`Pie chart generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate table image
   * @param {Array<Object>} data - Table data
   * @param {Object} options - Table options
   * @param {string} filename - Output filename (without extension)
   * @returns {Promise<string>} Path to the generated table image
   */
  async generateTableImage(data, options, filename) {
    try {
      // Create HTML for table
      const tableHtml = this._generateTableHtml(data, options);
      
      // Create a temporary HTML file
      const tempDir = path.join(this.outputDir, 'temp');
      this._ensureDirectoryExists(tempDir);
      
      const tempHtmlPath = path.join(tempDir, `${filename || 'table'}.html`);
      fs.writeFileSync(tempHtmlPath, tableHtml);
      
      // Generate output path
      const outputPath = path.join(this.outputDir, `${filename || 'table'}.png`);
      
      // Use Playwright to capture screenshot
      await this.playwrightService.captureElementScreenshot(
        `file://${tempHtmlPath}`,
        'table',
        {
          path: outputPath,
          waitTime: 500 // Wait for styles to apply
        }
      );
      
      // Clean up temporary file
      fs.unlinkSync(tempHtmlPath);
      
      return outputPath;
    } catch (error) {
      logger.error('Failed to generate table image', error);
      throw new Error(`Table image generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate HTML for table
   * @param {Array<Object>} data - Table data
   * @param {Object} options - Table options
   * @returns {string} HTML string
   * @private
   */
  _generateTableHtml(data, options) {
    const title = options.title || 'Data Table';
    const columns = options.columns || Object.keys(data[0] || {});
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            padding: 20px;
          }
          h2 {
            color: #333;
            margin-top: 0;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${title}</h2>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        let cellValue = row[col];
        
        // Format cell value
        if (cellValue === null || cellValue === undefined) {
          cellValue = '';
        } else if (typeof cellValue === 'object') {
          cellValue = JSON.stringify(cellValue);
        }
        
        html += `<td>${cellValue}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Generate chart image
   * @param {Object} config - Chart configuration
   * @param {string} filename - Output filename (without extension)
   * @returns {Promise<string>} Path to the generated chart
   * @private
   */
  async _generateChart(config, filename) {
    try {
      // Generate chart image buffer
      const buffer = await this.chartJSNodeCanvas.renderToBuffer(config);
      
      // Generate output path
      const outputPath = path.join(this.outputDir, `${filename || 'chart'}.png`);
      
      // Write buffer to file
      fs.writeFileSync(outputPath, buffer);
      
      return outputPath;
    } catch (error) {
      logger.error('Failed to generate chart', error);
      throw new Error(`Chart generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate report with multiple charts
   * @param {Array<Object>} charts - Chart configurations
   * @param {string} title - Report title
   * @returns {Promise<string>} Path to the generated report
   */
  async generateReport(charts, title) {
    try {
      // Create report directory
      const reportDir = path.join(this.outputDir, title || `report-${Date.now()}`);
      this._ensureDirectoryExists(reportDir);
      
      // Generate each chart
      const chartPaths = [];
      
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const chartFilename = `chart-${i + 1}`;
        let chartPath;
        
        if (chart.type === 'bar') {
          chartPath = await this.generateBarChart(chart.config, chartFilename);
        } else if (chart.type === 'line') {
          chartPath = await this.generateLineChart(chart.config, chartFilename);
        } else if (chart.type === 'pie') {
          chartPath = await this.generatePieChart(chart.config, chartFilename);
        } else if (chart.type === 'table') {
          chartPath = await this.generateTableImage(chart.data, chart.options, chartFilename);
        } else {
          logger.warn(`Unsupported chart type: ${chart.type}`);
          continue;
        }
        
        // Copy chart to report directory
        const chartFilename2 = path.basename(chartPath);
        const reportChartPath = path.join(reportDir, chartFilename2);
        fs.copyFileSync(chartPath, reportChartPath);
        
        chartPaths.push({
          path: chartFilename2,
          title: chart.title || `Chart ${i + 1}`,
          type: chart.type
        });
      }
      
      // Generate HTML report
      const reportHtml = this._generateReportHtml(chartPaths, title);
      fs.writeFileSync(path.join(reportDir, 'index.html'), reportHtml);
      
      // Generate PDF version using Playwright
      await this.generateReportPdf(reportDir, title);
      
      return reportDir;
    } catch (error) {
      logger.error('Failed to generate report', error);
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate HTML for report
   * @param {Array<Object>} charts - Chart information
   * @param {string} title - Report title
   * @returns {string} HTML string
   * @private
   */
  _generateReportHtml(charts, title) {
    const reportTitle = title || 'Data Report';
    const date = new Date().toLocaleString();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          header {
            background-color: #f8f9fa;
            padding: 20px;
            margin-bottom: 30px;
            border-bottom: 1px solid #dee2e6;
          }
          h1 {
            margin: 0;
            color: #495057;
          }
          .meta {
            color: #6c757d;
            font-size: 0.9rem;
            margin-top: 5px;
          }
          .chart-container {
            margin-bottom: 40px;
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            overflow: hidden;
          }
          .chart-header {
            background-color: #f8f9fa;
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
          }
          .chart-title {
            margin: 0;
            color: #495057;
          }
          .chart-body {
            padding: 20px;
            text-align: center;
          }
          .chart-image {
            max-width: 100%;
            height: auto;
          }
          footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 0.9rem;
          }
          @media print {
            header {
              background-color: white !important;
            }
            .chart-header {
              background-color: white !important;
            }
            .chart-container {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>${reportTitle}</h1>
            <div class="meta">Generated on: ${date}</div>
          </div>
        </header>
        
        <div class="container">
    `;
    
    charts.forEach(chart => {
      html += `
        <div class="chart-container">
          <div class="chart-header">
            <h2 class="chart-title">${chart.title}</h2>
          </div>
          <div class="chart-body">
            <img src="${chart.path}" alt="${chart.title}" class="chart-image">
          </div>
        </div>
      `;
    });
    
    html += `
          <footer>
            <p>Generated by Playwright Framework</p>
          </footer>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Generate PDF version of the report
   * @param {string} reportDir - Report directory
   * @param {string} title - Report title
   * @returns {Promise<string>} Path to the generated PDF
   */
  async generateReportPdf(reportDir, title) {
    try {
      const reportUrl = `file://${path.join(reportDir, 'index.html')}`;
      const pdfPath = path.join(reportDir, `${title || 'report'}.pdf`);
      
      // Use Playwright to generate PDF
      await this.playwrightService.generatePdf(reportUrl, {
        path: pdfPath,
        format: 'A4',
        margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size: 10px; text-align: center; width: 100%;">${title || 'Data Report'}</div>`,
        footerTemplate: `<div style="font-size: 8px; text-align: center; width: 100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
        timeout: 60000 // Longer timeout for complex reports
      });
      
      return pdfPath;
    } catch (error) {
      logger.error('Failed to generate report PDF', error);
      // Don't throw error here, as the HTML report is still generated
      logger.warn('Continuing without PDF generation');
      return null;
    }
  }
  
  /**
   * Test report accessibility
   * @param {string} reportPath - Path to the report directory
   * @returns {Promise<Object>} Accessibility test results
   */
  async testReportAccessibility(reportPath) {
    try {
      const reportUrl = `file://${path.join(reportPath, 'index.html')}`;
      
      // Use Playwright to run accessibility audit
      const results = await this.playwrightService.runAccessibilityAudit(reportUrl, {
        waitForSelector: '.chart-container',
        reportPath: path.join(reportPath, 'accessibility-report.json')
      });
      
      return results;
    } catch (error) {
      logger.error('Failed to test report accessibility', error);
      throw new Error(`Accessibility test failed: ${error.message}`);
    }
  }
  
  /**
   * Test report responsiveness
   * @param {string} reportPath - Path to the report directory
   * @returns {Promise<Array<Object>>} Responsiveness test results
   */
  async testReportResponsiveness(reportPath) {
    try {
      const reportUrl = `file://${path.join(reportPath, 'index.html')}`;
      
      // Use Playwright to test responsiveness
      const results = await this.playwrightService.testResponsiveness(reportUrl, [], {
        waitForSelector: '.chart-container',
        fullPage: true
      });
      
      // Save results to report directory
      fs.writeFileSync(
        path.join(reportPath, 'responsiveness-report.json'),
        JSON.stringify(results, null, 2)
      );
      
      return results;
    } catch (error) {
      logger.error('Failed to test report responsiveness', error);
      throw new Error(`Responsiveness test failed: ${error.message}`);
    }
  }
}

module.exports = ChartGenerator;