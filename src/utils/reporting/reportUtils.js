// src/utils/reporting/reportUtils.js (updated)
const { execSync } = require('child_process');
const allure = require('allure-playwright');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

/**
 * Reporting utilities for Playwright tests
 */
function ReportUtils() {
  this.s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

/**
 * Generates an Allure report with optional screenshot attachment
 * @param {string} [screenshotPath] - Path to screenshot to attach
 * @returns {void}
 * @throws {Error} If report generation fails
 */
ReportUtils.prototype.generateAllureReport = function (screenshotPath) {
  try {
    execSync('npx allure generate reports/allure -o reports/allure-report --clean', {
      stdio: 'inherit',
    });
    if (screenshotPath && fs.existsSync(screenshotPath)) {
      allure.attachment('Screenshot', fs.readFileSync(screenshotPath), 'image/png');
    }
  } catch (error) {
    throw new Error(`Failed to generate Allure report: ${error.message}`);
  }
};

/**
 * Attaches a screenshot to the Allure report during test execution
 * @param {string} screenshotPath - Path to the screenshot file
 * @param {string} [name='Screenshot'] - Name of the attachment
 * @returns {void}
 * @throws {Error} If attachment fails
 */
ReportUtils.prototype.attachScreenshot = function (screenshotPath, name = 'Screenshot') {
  if (!screenshotPath || !fs.existsSync(screenshotPath)) {
    throw new Error(`Screenshot file not found: ${screenshotPath}`);
  }
  try {
    allure.attachment(name, fs.readFileSync(screenshotPath), 'image/png');
  } catch (error) {
    throw new Error(`Failed to attach screenshot: ${error.message}`);
  }
};

/**
 * Attaches a log message to the Allure report
 * @param {string} message - Log message to attach
 * @param {string} [name='Log'] - Name of the attachment
 * @returns {void}
 * @throws {Error} If attachment fails
 */
ReportUtils.prototype.attachLog = function (message, name = 'Log') {
  if (!message) throw new Error('Log message is required');
  try {
    allure.attachment(name, Buffer.from(message), 'text/plain');
  } catch (error) {
    throw new Error(`Failed to attach log: ${error.message}`);
  }
};

/**
 * Sends a notification to Slack or Microsoft Teams
 * @param {Object} config - Notification configuration
 * @param {string} config.webhookUrl - Webhook URL for Slack or Teams
 * @param {string} config.message - Message to send
 * @param {string} [config.channel] - Channel or user to notify (Slack)
 * @returns {Promise} Resolves when notification is sent
 * @throws {Error} If notification fails
 */
ReportUtils.prototype.notify = async function (config) {
  if (!config || !config.webhookUrl || !config.message) {
    throw new Error('Webhook URL and message are required');
  }
  try {
    const fetch = require('node-fetch');
    const payload = {
      text: config.message,
    };
    if (config.channel) {
      payload.channel = config.channel; // Slack-specific
    }
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Notification failed: ${response.statusText}`);
  } catch (error) {
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

/**
 * Uploads the Allure report to S3
 * @param {Object} config - S3 upload configuration
 * @param {string} config.bucket - S3 bucket name
 * @param {string} config.reportPath - Path to the Allure report directory
 * @param {string} [config.s3Path='reports/allure-report'] - Path in S3 to upload to
 * @returns {Promise} Resolves when upload completes
 * @throws {Error} If upload fails
 */
ReportUtils.prototype.uploadReport = async function (config) {
  if (!config || !config.bucket || !config.reportPath) {
    throw new Error('Bucket and report path are required');
  }
  try {
    const reportPath = config.reportPath;
    const s3Path = config.s3Path || 'reports/allure-report';
    const files = fs.readdirSync(reportPath);

    for (const file of files) {
      const filePath = path.join(reportPath, file);
      const fileContent = fs.readFileSync(filePath);
      const params = {
        Bucket: config.bucket,
        Key: `${s3Path}/${file}`,
        Body: fileContent,
        ContentType: mime.lookup(filePath) || 'application/octet-stream',
      };
      await this.s3.upload(params).promise();
      console.log(`Uploaded ${filePath} to s3://${config.bucket}/${s3Path}/${file}`);
    }
  } catch (error) {
    throw new Error(`Failed to upload report to S3: ${error.message}`);
  }
};

/**
 * Uploads artifacts (videos, traces, logs) to S3
 * @param {Object} config - S3 upload configuration
 * @param {string} config.bucket - S3 bucket name
 * @param {string} config.artifactsPath - Path to the artifacts directory
 * @param {string} [config.s3Path='artifacts'] - Path in S3 to upload to
 * @returns {Promise} Resolves when upload completes
 * @throws {Error} If upload fails
 */
ReportUtils.prototype.uploadArtifacts = async function (config) {
  if (!config || !config.bucket || !config.artifactsPath) {
    throw new Error('Bucket and artifacts path are required');
  }
  try {
    const artifactsPath = config.artifactsPath;
    const s3Path = config.s3Path || 'artifacts';
    if (!fs.existsSync(artifactsPath)) {
      console.warn(`Artifacts path not found: ${artifactsPath}, skipping...`);
      return;
    }

    const files = fs.readdirSync(artifactsPath);
    for (const file of files) {
      const filePath = path.join(artifactsPath, file);
      const fileContent = fs.readFileSync(filePath);
      const params = {
        Bucket: config.bucket,
        Key: `${s3Path}/${file}`,
        Body: fileContent,
        ContentType: mime.lookup(filePath) || 'application/octet-stream',
      };
      await this.s3.upload(params).promise();
      console.log(`Uploaded ${filePath} to s3://${config.bucket}/${s3Path}/${file}`);
    }
  } catch (error) {
    throw new Error(`Failed to upload artifacts to S3: ${error.message}`);
  }
};

module.exports = ReportUtils;