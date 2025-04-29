// src/utils/reporting/reportUtils.js

import { execSync } from "child_process";
// Removed redundant import for generateAllureReport and notify
import fs from "fs";

export function generateAllureReport(screenshotPath) {
  try {
    execSync(
      "npx allure generate reports/allure -o reports/allure-report --clean",
      { stdio: "inherit" }
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
}

export function attachScreenshot(screenshotPath, name = "Screenshot") {
  if (!screenshotPath || !fs.existsSync(screenshotPath)) {
    throw new Error(`Screenshot file not found: ${screenshotPath}`);
  }
  try {
    allure.attachment(name, fs.readFileSync(screenshotPath), "image/png");
  } catch (error) {
    throw new Error(`Failed to attach screenshot: ${error.message}`);
  }
}

export function attachLog(message, name = "Log") {
  if (!message) {
    throw new Error("Log message is required");
  }
  try {
    allure.attachment(name, Buffer.from(message), "text/plain");
  } catch (error) {
    throw new Error(`Failed to attach log: ${error.message}`);
  }
}

export async function notify(config) {
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
}
export default { generateAllureReport, notify };
