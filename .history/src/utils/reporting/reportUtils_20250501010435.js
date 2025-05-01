// src/utils/reporting/reportUtils.js

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import logger from "../common/logger.js";

/**
 * Path configurations (can be overridden using .env)
 */
const ALLURE_RESULTS_DIR = process.env.ALLURE_RESULTS_DIR || "reports/allure";
const ALLURE_REPORT_DIR =
  process.env.ALLURE_REPORT_DIR || "reports/allure-report";

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
    execSync(
      `npx allure generate ${resolvedResults} -o ${resolvedOutput} --clean`,
      {
        stdio: "inherit",
      }
    );

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
export function attachScreenshot(
  screenshotPath,
  name = "Screenshot",
  testInfo
) {
  const resolved = path.resolve(screenshotPath);

  if (!fs.existsSync(resolved)) {
    logger.warn(`Screenshot not found: ${resolved}`);
    return;
  }

  try {
    const image = fs.readFileSync(resolved);
    testInfo.attach(name, {
      body: image,
      contentType: "image/png",
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
export function attachLog(content, name = "Log", testInfo) {
  let body;

  if (!content) {
    logger.warn("No log content provided for attachment");
    return;
  }

  try {
    if (fs.existsSync(content)) {
      body = fs.readFileSync(content);
    } else {
      body = Buffer.from(content, "utf-8");
    }

    testInfo.attach(name, {
      body,
      contentType: "text/plain",
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
    logger.error("Missing webhookUrl or message in notification config");
    return;
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
      throw new Error(
        `Notification failed: ${response.status} ${response.statusText}`
      );
    }

    logger.info("Notification sent successfully");
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
    const outputPath = path.resolve("reports", fileName);
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
  writeMetadataFile,
};
