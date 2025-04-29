// src/utils/reporting/reportUtils.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import logger from "../common/logger.js";

/**
 * Generates an Allure HTML report.
 * @param {string} [screenshotPath] - Optional path to screenshot to attach (handled in tests).
 */
export function generateAllureReport(screenshotPath) {
  const allureDir = path.resolve("reports/allure");
  const reportDir = path.resolve("reports/allure-report");

  if (!fs.existsSync(allureDir)) {
    logger.error("Allure results directory does not exist: reports/allure");
    throw new Error("Allure results directory not found");
  }

  try {
    execSync(
      "npx allure generate reports/allure -o reports/allure-report --clean",
      { stdio: "inherit" }
    );
    logger.info(`Allure report generated at ${reportDir}`);
  } catch (error) {
    logger.error(`Failed to generate Allure report: ${error.message}`);
    throw new Error(`Failed to generate Allure report: ${error.message}`);
  }
}

/**
 * Attaches a screenshot to the test report using testInfo.
 * @param {string} screenshotPath - Path to screenshot.
 * @param {string} [name='Screenshot'] - Attachment name.
 * @param {object} testInfo - Playwright testInfo object.
 */
export function attachScreenshot(
  screenshotPath,
  name = "Screenshot",
  testInfo
) {
  if (!screenshotPath || !fs.existsSync(screenshotPath)) {
    logger.error(`Screenshot file not found: ${screenshotPath}`);
    throw new Error(`Screenshot file not found: ${screenshotPath}`);
  }
  try {
    testInfo.attach(name, {
      body: fs.readFileSync(screenshotPath),
      contentType: "image/png",
    });
    logger.info(`Attached screenshot to report: ${name}`);
  } catch (error) {
    logger.error(`Failed to attach screenshot: ${error.message}`);
    throw new Error(`Failed to attach screenshot: ${error.message}`);
  }
}

/**
 * Attaches a log entry to the test report using testInfo.
 * @param {string} message - Log message to attach.
 * @param {string} [name='Log'] - Attachment name.
 * @param {object} testInfo - Playwright testInfo object.
 */
export function attachLog(message, name = "Log", testInfo) {
  if (!message) {
    logger.error("Log message is required");
    throw new Error("Log message is required");
  }
  try {
    testInfo.attach(name, {
      body: Buffer.from(message),
      contentType: "text/plain",
    });
    logger.info(`Attached log to report: ${name}`);
  } catch (error) {
    logger.error(`Failed to attach log: ${error.message}`);
    throw new Error(`Failed to attach log: ${error.message}`);
  }
}

/**
 * Sends a notification (Slack/Teams) to the configured webhook.
 * @param {Object} config - Webhook config.
 * @param {string} config.webhookUrl - Webhook URL.
 * @param {string} config.message - Message to send.
 * @param {string} [config.channel] - Channel name (optional).
 */
export async function sendNotification(config) {
  if (!config || !config.webhookUrl || !config.message) {
    logger.error("Webhook URL and message are required");
    throw new Error("Webhook URL and message are required");
  }
  try {
    const fetch = (await import("node-fetch")).default;

    const payload = { text: config.message };
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
    logger.info("Notification sent successfully");
  } catch (error) {
    logger.error(`Failed to send notification: ${error.message}`);
    throw new Error(`Failed to send notification: ${error.message}`);
  }
}

/**
 * Default export for easy grouped import elsewhere.
 */
export default {
  generateAllureReport,
  attachScreenshot,
  attachLog,
  sendNotification,
};
