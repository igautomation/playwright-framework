// src/cli/commands/push-to-xray.js

import fs from 'fs-extra';
import path from 'path';
import XrayUtils from '../../utils/xray/xrayUtils.js';
import logger from '../../utils/common/logger.js';

// Initialize the Xray API client
const xrayClient = new XrayUtils();

export const pushToXrayCommand = {
  command: 'push-to-xray <testExecutionKey>',
  describe: 'Push test results to Xray',
  builder: (yargs) => {
    return yargs.option('results', {
      alias: 'r',
      type: 'string',
      describe: 'Path to test result JSON file',
      default: 'reports/xray-results.json',
    });
  },
  handler: async (argv) => {
    try {
      // Authenticate with Xray API using .env credentials
      await xrayClient.authenticate();

      // Resolve the path to the result file
      const resultsPath = path.resolve(process.cwd(), argv.results);

      // Check file existence and load JSON data
      if (!fs.existsSync(resultsPath)) {
        throw new Error(`Result file not found: ${resultsPath}`);
      }

      const results = fs.readJsonSync(resultsPath);

      // Send the loaded results to Xray
      await xrayClient.pushExecutionResults(argv.testExecutionKey, results);

      logger.info('Results pushed to Xray.');
    } catch (error) {
      logger.error(`Failed to push results to Xray: ${error.message}`);
      process.exit(1);
    }
  },
};
