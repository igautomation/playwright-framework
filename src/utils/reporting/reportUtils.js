<<<<<<< HEAD
// src/utils/reporting/reportUtils.js

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import logger from '../common/logger.js';

/**
 * Path configurations (can be overridden using .env)
 */
const ALLURE_RESULTS_DIR = process.env.ALLURE_RESULTS_DIR || 'reports/allure';
const ALLURE_REPORT_DIR = process.env.ALLURE_REPORT_DIR || 'reports/allure-report';

/**
 * Generates an Allure HTML report by reading raw results.
 * This is usually triggered after all test execution finishes.
 *
 * @throws {Error} if report generation fails
 */
export function generateAllureReport() {
  const resolvedResults = path.resolve(ALLURE_RESULTS_DIR);
  const resolvedOutput = path.resolve(ALLURE_REPORT_DIR);

  if (!fs.existsSync(resolvedResults)) {
    logger.error(`Allure results directory not found: ${resolvedResults}`);
    throw new Error(`Missing results: ${resolvedResults}`);
  }

  try {
    execSync(`npx allure generate ${resolvedResults} -o ${resolvedOutput} --clean`, {
      stdio: 'inherit'
    });

    logger.info(`Allure report generated at ${resolvedOutput}`);
  } catch (error) {
    logger.error(`Failed to generate Allure report: ${error.message}`);
    throw error;
  }
}

/**
 * Attaches a screenshot file to the test report.
 * Should be used inside a test or fixture (e.g., retryDiagnostics).
 *
 * @param {string} screenshotPath - Absolute or relative path to PNG file
 * @param {string} name - Display name for the screenshot in the report
 * @param {object} testInfo - Playwright testInfo object (injected automatically)
 */
export function attachScreenshot(screenshotPath, name = 'Screenshot', testInfo) {
  const resolved = path.resolve(screenshotPath);

  if (!fs.existsSync(resolved)) {
    logger.warn(`Screenshot not found: ${resolved}`);
    return;
  }

  try {
    const image = fs.readFileSync(resolved);
    testInfo.attach(name, {
      body: image,
      contentType: 'image/png'
    });

    logger.info(`Attached screenshot to report: ${name}`);
  } catch (error) {
    logger.error(`Error attaching screenshot: ${error.message}`);
  }
}

/**
 * Attaches a text log to the test report.
 * Can be raw text or a file path.
 *
 * @param {string} content - Raw string or file path
 * @param {string} name - Label in the report
 * @param {object} testInfo - Playwright testInfo object
 */
export function attachLog(content, name = 'Log', testInfo) {
  let body;

  if (!content) {
    logger.warn('No log content provided for attachment');
    return;
  }

  try {
    if (fs.existsSync(content)) {
      body = fs.readFileSync(content);
    } else {
      body = Buffer.from(content, 'utf-8');
    }

    testInfo.attach(name, {
      body,
      contentType: 'text/plain'
    });

    logger.info(`Attached log: ${name}`);
  } catch (error) {
    logger.error(`Failed to attach log: ${error.message}`);
  }
}

/**
 * Sends a webhook notification (Slack, Teams, etc.).
 * Typically used in CI to notify failures or test summaries.
 *
 * @param {Object} config - Notification config
 * @param {string} config.webhookUrl - Destination URL
 * @param {string} config.message - Main message
 * @param {string} [config.channel] - Optional: target channel
 */
export async function sendNotification(config) {
  if (!config || !config.webhookUrl || !config.message) {
    logger.error('Missing webhookUrl or message in notification config');
    return;
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const payload = { text: config.message };

    if (config.channel) {
      payload.channel = config.channel;
    }

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Notification failed: ${response.status} ${response.statusText}`);
    }

    logger.info('Notification sent successfully');
  } catch (error) {
    logger.error(`Notification error: ${error.message}`);
  }
}

/**
 * Optional utility: write JSON metadata to disk.
 * Can be used to export runtime stats or test info for other tools.
 *
 * @param {string} fileName - JSON file name
 * @param {object} data - Any data object to serialize
 */
export async function writeMetadataFile(fileName, data) {
  try {
    const outputPath = path.resolve('reports', fileName);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    logger.info(`Metadata file written: ${outputPath}`);
  } catch (error) {
    logger.error(`Failed to write metadata: ${error.message}`);
  }
}

// Grouped export for convenience
export default {
  generateAllureReport,
  attachScreenshot,
  attachLog,
  sendNotification,
  writeMetadataFile
};
=======
/**
 * Reporting utilities for test reporting
 */
const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

class ReportUtils {
  /**
   * Constructor
   */
  constructor() {
    this.reportsDir = path.resolve(process.cwd(), 'reports');

    // Create reports directory if it doesn't exist
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Save test result to JSON file
   * @param {string} testName - Test name
   * @param {Object} result - Test result
   * @returns {string} Path to the report file
   */
  saveTestResult(testName, result) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${testName}-${timestamp}.json`;
      const filePath = path.join(this.reportsDir, fileName);

      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

      logger.info(`Test result saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error('Failed to save test result', error);
      throw error;
    }
  }

  /**
   * Generate HTML report from test results
   * @param {Array<Object>} results - Test results
   * @returns {string} Path to the HTML report
   */
  generateHtmlReport(results) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `report-${timestamp}.html`;
      const filePath = path.join(this.reportsDir, 'html', fileName);

      // Create HTML report directory if it doesn't exist
      const htmlDir = path.join(this.reportsDir, 'html');
      if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, { recursive: true });
      }

      // Generate HTML content
      const html = this.generateHtmlContent(results);

      // Write HTML file
      fs.writeFileSync(filePath, html);

      logger.info(`HTML report generated at: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error('Failed to generate HTML report', error);
      throw error;
    }
  }

  /**
   * Generate HTML content for report
   * @param {Array<Object>} results - Test results
   * @returns {string} HTML content
   */
  generateHtmlContent(results) {
    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const total = results.length;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Report</title>
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
          h1, h2 {
            color: #333;
          }
          .summary {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
          }
          .card {
            flex: 1;
            min-width: 200px;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .card h3 {
            margin-top: 0;
          }
          .passed { background-color: #d4edda; color: #155724; }
          .failed { background-color: #f8d7da; color: #721c24; }
          .skipped { background-color: #e2e3e5; color: #383d41; }
          .total { background-color: #cce5ff; color: #004085; }
          .metric {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
          }
          tr.passed td:first-child {
            border-left: 4px solid #28a745;
          }
          tr.failed td:first-child {
            border-left: 4px solid #dc3545;
          }
          tr.skipped td:first-child {
            border-left: 4px solid #6c757d;
          }
          .timestamp {
            color: #6c757d;
            font-size: 14px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Test Report</h1>
          
          <div class="summary">
            <div class="card total">
              <h3>Total Tests</h3>
              <div class="metric">${total}</div>
            </div>
            <div class="card passed">
              <h3>Passed</h3>
              <div class="metric">${passed}</div>
            </div>
            <div class="card failed">
              <h3>Failed</h3>
              <div class="metric">${failed}</div>
            </div>
            <div class="card skipped">
              <h3>Skipped</h3>
              <div class="metric">${skipped}</div>
            </div>
          </div>
          
          <h2>Test Results</h2>
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              ${results
                .map(
                  (result) => `
                <tr class="${result.status}">
                  <td>${result.name}</td>
                  <td>${result.status}</td>
                  <td>${result.duration}ms</td>
                  <td>${result.error || ''}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new ReportUtils();
>>>>>>> 51948a2 (Main v1.0)
