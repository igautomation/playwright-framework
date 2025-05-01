// src/cli/commands/generate-report.js

import { spawn } from "child_process";
import logger from "../../utils/common/logger.js";
import path from "path";

// Default report output directory
const REPORT_DIR = "reports/allure-results";
const OUTPUT_DIR = "reports/allure-report";

// Define the CLI command for generating the Allure report
export const generateReportCommand = {
  command: "generate-report",
  describe: "Generate Allure report from results",

  handler: () => {
    // Prepare the allure command
    const command = "npx";
    const args = [
      "allure",
      "generate",
      REPORT_DIR,
      "--clean",
      "--output",
      OUTPUT_DIR,
    ];

    // Log the command being executed
    logger.info("Generating Allure report...");
    logger.info("Executing: " + [command, ...args].join(" "));

    // Spawn the report generation process
    const generate = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    // Capture exit and show success/failure message
    generate.on("exit", (code) => {
      if (code === 0) {
        logger.info(`Allure report generated at ${OUTPUT_DIR}`);
      } else {
        logger.error(`Allure report generation failed with exit code ${code}`);
        process.exit(code);
      }
    });
  },
};
