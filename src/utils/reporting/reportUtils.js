// src/utils/reporting/reportUtils.js

/**
 * Reporting Utilities for Playwright Framework (ESM Compliant).
 *
 * Responsibilities:
 * - Generate Allure reports
 * - Attach screenshots and logs to Allure results
 * - Send notifications to Slack or Microsoft Teams
 */

import { execSync } from 'child_process';
import { promises as fsPromises, existsSync, readFileSync } from 'fs';
import allure from 'allure-playwright';

class ReportUtils {
  /**
   * Generates an Allure report.
   *
   * @param {string} [screenshotPath] - Optional path to a screenshot to attach.
   */
  generateAllureReport(screenshotPath) {
    try {
      execSync(
        'npx allure generate reports/allure -o reports/allure-report --clean',
        { stdio: 'inherit' }
      );

      if (screenshotPath && existsSync(screenshotPath)) {
        allure.attachment(
          'Screenshot',
          readFileSync(screenshotPath),
          'image/png'
        );
      }
    } catch (error) {
      throw new Error(`Failed to generate Allure report: ${error.message}`);
    }
  }

  /**
   * Attaches a screenshot to the Allure report during test execution.
   *
   * @param {string} screenshotPath - Path to the screenshot file.
   * @param {string} [name='Screenshot'] - Name of the screenshot attachment.
   */
  attachScreenshot(screenshotPath, name = 'Screenshot') {
    if (!screenshotPath || !existsSync(screenshotPath)) {
      throw new Error(`Screenshot file not found: ${screenshotPath}`);
    }
    try {
      allure.attachment(name, readFileSync(screenshotPath), 'image/png');
    } catch (error) {
      throw new Error(`Failed to attach screenshot: ${error.message}`);
    }
  }

  /**
   * Attaches a plain text log message to the Allure report.
   *
   * @param {string} message - Log message to attach.
   * @param {string} [name='Log'] - Name of the log attachment.
   */
  attachLog(message, name = 'Log') {
    if (!message) {
      throw new Error('Log message is required');
    }
    try {
      allure.attachment(name, Buffer.from(message), 'text/plain');
    } catch (error) {
      throw new Error(`Failed to attach log: ${error.message}`);
    }
  }

  /**
   * Sends a notification message to Slack or Microsoft Teams.
   *
   * @param {Object} config - Notification configuration.
   * @param {string} config.webhookUrl - Webhook URL for Slack/Teams.
   * @param {string} config.message - Message to send.
   * @param {string} [config.channel] - Slack-specific optional channel.
   * @returns {Promise<void>} Resolves on success.
   */
  async notify(config) {
    if (!config || !config.webhookUrl || !config.message) {
      throw new Error('Webhook URL and message are required');
    }
    try {
      const fetchModule = await import('node-fetch');
      const fetch = fetchModule.default;

      const payload = {
        text: config.message,
      };

      if (config.channel) {
        payload.channel = config.channel;
      }

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Notification failed: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }
}

export default ReportUtils;