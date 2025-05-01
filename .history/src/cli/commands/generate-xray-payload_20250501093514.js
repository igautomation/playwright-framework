// src/cli/commands/generate-xray-payload.js

import { generateXrayResults } from '../../utils/xray/xrayResultsGenerator.js';
import logger from '../../utils/common/logger.js';

/**
 * CLI Command: framework generate-xray-payload
 * Converts Playwright results + test mapping into Xray JSON format
 */
export const generateXrayPayloadCommand = {
  command: 'generate-xray-payload',
  describe: 'Convert Playwright results to Xray-compatible JSON',
  handler: async () => {  
    try {
      await generateXrayResults();
    } catch (error) {
      logger.error(`Xray payload generation failed: ${error.message}`);
      process.exit(1);
    }
  },
};
