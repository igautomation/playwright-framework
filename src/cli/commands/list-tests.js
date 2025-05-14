/**
 * List tests command for the CLI
 *
 * This command lists all available tests without running them
 */
const { execSync } = require('child_process');
const logger = require('../../utils/common/logger');

/**
 * List tests with the specified options
 * @param {Object} options - Command options
 */
module.exports = (options) => {
  try {
    logger.info('Listing tests with options:', options);

    // Build the command
    let command = 'npx playwright test --list';

    // Add project if specified
    if (options.project) {
      command += ` --project=\"${options.project}\"`;
    }
    
    // Add tags if specified (using grep for filtering by tag)
    if (options.tags) {
      // Escape any quotes in the tags to prevent command injection
      const escapedTags = options.tags.replace(/\"/g, '\\\"');
      command += ` --grep \"${escapedTags}\"`;
    }

    // Run the command
    logger.info(`Executing command: ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      env: process.env
    });

    logger.info('Test listing completed successfully');
  } catch (error) {
    logger.error('Test listing failed:', error.message || error);
    process.exit(1);
  }
};