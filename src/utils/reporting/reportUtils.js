// src/utils/reporting/reportUtils.js

/**
 * Reporting Utilities for Playwright Framework.
 *
 * Responsibilities:
 * - Generate Allure reports
 * - Attach screenshots and logs to Allure results
 * - Send notifications to Slack or Microsoft Teams
 */

const { execSync } = require("child_process");
const allure = require("allure-playwright");
const fs = require("fs");

/**
 * Constructor for ReportUtils.
 */
function ReportUtils() {}

/**
 * Generates an Allure report.
 *
 * Optionally attaches a screenshot if a valid path is provided.
 *
 * @param {string} [screenshotPath] - Path to a screenshot file to attach.
 * @throws {Error} If report generation fails.
 */
ReportUtils.prototype.generateAllureReport = function (screenshotPath) {
  try {
    execSync(
      "npx allure generate reports/allure -o reports/allure-report --clean",
      {
        stdio: "inherit",
      }
    );

    if (screenshotPath && fs.existsSync(screenshotPath)) {
      allure.attachment(
        "Screenshot",
        fs.readFileSync(screenshotPath),
        "image/png"
      );
    }
  } catch (error) {
    throw new Error(`Failed to generate Allure report: ${error.message}`);
  }
};

/**
 * Attaches a screenshot to the Allure report during test execution.
 *
 * @param {string} screenshotPath - Path to the screenshot file.
 * @param {string} [name='Screenshot'] - Name of the screenshot attachment.
 * @throws {Error} If attachment fails or file is missing.
 */
ReportUtils.prototype.attachScreenshot = function (
  screenshotPath,
  name = "Screenshot"
) {
  if (!screenshotPath || !fs.existsSync(screenshotPath)) {
    throw new Error(`Screenshot file not found: ${screenshotPath}`);
  }
  try {
    allure.attachment(name, fs.readFileSync(screenshotPath), "image/png");
  } catch (error) {
    throw new Error(`Failed to attach screenshot: ${error.message}`);
  }
};

/**
 * Attaches a plain text log message to the Allure report.
 *
 * @param {string} message - Log message to attach.
 * @param {string} [name='Log'] - Name of the log attachment.
 * @throws {Error} If attachment fails.
 */
ReportUtils.prototype.attachLog = function (message, name = "Log") {
  if (!message) {
    throw new Error("Log message is required");
  }
  try {
    allure.attachment(name, Buffer.from(message), "text/plain");
  } catch (error) {
    throw new Error(`Failed to attach log: ${error.message}`);
  }
};

/**
 * Sends a notification message to Slack or Microsoft Teams.
 *
 * @param {Object} config - Notification configuration.
 * @param {string} config.webhookUrl - Webhook URL for Slack/Teams.
 * @param {string} config.message - Message to send.
 * @param {string} [config.channel] - Slack-specific optional channel.
 * @returns {Promise<void>} Resolves on success.
 * @throws {Error} If sending the notification fails.
 */
ReportUtils.prototype.notify = async function (config) {
  if (!config || !config.webhookUrl || !config.message) {
    throw new Error("Webhook URL and message are required");
  }
  try {
    const fetch = (await import("node-fetch")).default;

    const payload = {
      text: config.message,
    };

    if (config.channel) {
      payload.channel = config.channel;
    }

    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Notification failed: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

module.exports = ReportUtils;
