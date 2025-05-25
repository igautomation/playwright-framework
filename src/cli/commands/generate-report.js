// src/cli/commands/generate-report.js

import { spawn } from 'child_process';
import logger from '../../utils/common/logger.js';
import path from 'path';
import { generateAllureReport } from '../../utils/reporting/reportingUtils.js';

// Default report output directory
const REPORT_DIR = 'reports/allure-results';
const OUTPUT_DIR = 'reports/allure-report';

// Define the CLI command for generating the Allure report
export const generateReportCommand = {
  command: 'generate-report',
  describe: 'Generate Allure report from results',

  handler: async () => {
    try {
      // Log the command being executed
      logger.info('Generating Allure report...');
      
      // Use the unified reporting utility
      const reportPath = await generateAllureReport({
        resultsDir: REPORT_DIR,
        outputDir: OUTPUT_DIR
      });
      
      logger.info(`Allure report generated at ${reportPath}`);
    } catch (error) {
      logger.error(`Allure report generation failed: ${error.message}`);
      process.exit(1);
    }
  }
};