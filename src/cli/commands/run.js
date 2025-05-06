<<<<<<< HEAD
// src/cli/commands/run.js

import path from 'path';
import { spawn } from 'child_process';
import { config as loadEnv } from 'dotenv-safe';
import logger from '../../utils/common/logger.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM-compatible __dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load environment variables from .env files using dotenv-safe.
 * Ensures required keys are set using .env.example.
 */
function loadEnvironmentVariables(projectDir) {
  const env = process.env.NODE_ENV || 'development';
  const envFileName = env === 'development' ? 'dev' : env;

  try {
    loadEnv({
      allowEmptyValues: true,
      example: path.join(projectDir, '.env.example'),
      path: path.join(projectDir, `src/config/env/${envFileName}.env`)
    });

    loadEnv({
      allowEmptyValues: true,
      example: path.join(projectDir, '.env.example')
    });

    if (!process.env.BASE_URL) {
      throw new Error('BASE_URL environment variable is required.');
    }
  } catch (error) {
    logger.error(`Environment load failed: ${error.message}`);
    process.exit(1);
  }

  return env;
}

/**
 * Main handler for `framework run` CLI command.
 * Dynamically constructs and invokes `npx playwright test` command.
 */
export default function run(argv) {
  const projectDir = process.cwd();
  loadEnvironmentVariables(projectDir);

  const command = 'npx';
  const args = ['playwright', 'test'];

  if (argv._.length > 1) {
    const testFiles = argv._.slice(1);
    args.push(...testFiles);
  }

  if (argv.project) {
    argv.project.forEach((p) => args.push(`--project=${p}`));
  }

  if (argv.tags) {
    args.push(`--grep=${argv.tags}`);
  }

  if (argv.headed) {
    args.push('--headed');
  }

  if (argv.workers) {
    args.push(`--workers=${argv.workers}`);
  }

  if (argv.retries !== undefined) {
    args.push(`--retries=${argv.retries}`);
  }

  logger.info(`Executing: ${command} ${args.join(' ')}`);

  const testProcess = spawn(command, args, {
    stdio: 'inherit',
    shell: true
  });

  testProcess.on('exit', (code) => {
    if (code !== 0) {
      logger.error('Playwright test execution failed.');
      process.exit(code);
    } else {
      logger.info('Playwright tests completed successfully.');
    }
  });
}
=======
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

    // Add tags if specified (using grep for filtering by tag)
    if (options.tags) {
      // Escape any quotes in the tags to prevent command injection
      const escapedTags = options.tags.replace(/"/g, '\\"');
      command += ` --grep "${escapedTags}"`;
    }

    // Add project if specified
    if (options.project) {
      command += ` --project="${options.project}"`;
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
      command += ` --reporter="${options.reporter}"`;
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
      command += ` --output="${options.output}"`;
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
>>>>>>> 51948a2 (Main v1.0)
