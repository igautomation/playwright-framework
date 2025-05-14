/**
 * Run command for the CLI
 *
 * This command runs tests with the specified options
 */
const { execSync } = require('child_process');
const path = require('path');
const logger = require('../../utils/common/logger');

/**
 * Run tests with the specified options
 * @param {Object} options - Command options
 */
module.exports = (options) => {
  try {
    logger.info('Running tests with options:', options);

    // Build the command
    let command = 'npx playwright test';

    // Add specific test files if provided
    if (options.testFiles) {
      command += ` ${options.testFiles}`;
    }

    // Add list flag if specified
    if (options.list) {
      command += ' --list';
    }

    // Add tags if specified (using grep for filtering by tag)
    if (options.tags) {
      // Escape any quotes in the tags to prevent command injection
      const escapedTags = options.tags.replace(/\"/g, '\\\"');
      command += ` --grep \"${escapedTags}\"`;
    }

    // Add project if specified
    if (options.project) {
      command += ` --project=\"${options.project}\"`;
    }

    // Add headed mode if specified
    if (options.headed) {
      command += ' --headed';
    }

    // Add debug mode if specified
    if (options.debug) {
      command += ' --debug';
    }

    // Add reporter if specified
    if (options.reporter) {
      command += ` --reporter=\"${options.reporter}\"`;
    }

    // Add workers if specified
    if (options.workers) {
      command += ` --workers=${options.workers}`;
    }

    // Add timeout if specified
    if (options.timeout) {
      command += ` --timeout=${options.timeout}`;
    }

    // Add retries if specified
    if (options.retries) {
      command += ` --retries=${options.retries}`;
    }

    // Add output directory if specified
    if (options.output) {
      command += ` --output=\"${options.output}\"`;
    }

    // Set environment variables
    const env = { ...process.env };
    
    // Set NODE_ENV if specified
    if (options.env) {
      env.NODE_ENV = options.env;
    }

    // Add any custom environment variables
    if (options.envVars) {
      Object.entries(options.envVars).forEach(([key, value]) => {
        env[key] = value;
      });
    }

    // Run the command
    logger.info(`Executing command: ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      env
    });

    logger.info('Tests completed successfully');
  } catch (error) {
    logger.error('Tests failed:', error.message || error);
    process.exit(1);
  }
};