// src/cli/commands/run.js

import path from 'path';
import { spawn } from 'child_process';
import { config as loadEnv } from 'dotenv-safe';
import logger from '../../utils/common/logger.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Utility to resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to load env based on NODE_ENV and fallback
function loadEnvironmentVariables(projectDir) {
  const env = process.env.NODE_ENV || 'development';
  const envFileName = env === 'development' ? 'dev' : env;

  try {
    loadEnv({
      allowEmptyValues: true,
      example: path.join(projectDir, '.env.example'),
      path: path.join(projectDir, `src/config/env/${envFileName}.env`),
    });

    loadEnv({
      allowEmptyValues: true,
      example: path.join(projectDir, '.env.example'),
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

// Main CLI handler for `framework run`
export default function run(argv) {
  const projectDir = process.cwd();

  // Load environment variables before running tests
  loadEnvironmentVariables(projectDir);

  // Build base command: npx playwright test
  const command = 'npx';
  const args = ['playwright', 'test'];

  // Add file path if specific files are passed (e.g., [files..])
  if (argv._.length > 1) {
    const testFiles = argv._.slice(1); // skip the command name
    args.push(...testFiles);
  }

  // Apply --project if defined (Playwright project name)
  if (argv.project) {
    argv.project.forEach((p) => args.push('--project=' + p));
  }

  // Add tag filtering via --grep
  if (argv.tags) {
    args.push('--grep=' + argv.tags);
  }

  // Add headed mode
  if (argv.headed) {
    args.push('--headed');
  }

  // Set custom worker count if defined
  if (argv.workers) {
    args.push('--workers=' + argv.workers);
  }

  // Set retry count if defined
  if (argv.retries !== undefined) {
    args.push('--retries=' + argv.retries);
  }

  // Log the final constructed command for reference
  logger.info('Executing: ' + [command, ...args].join(' '));

  // Spawn the child process to run the Playwright CLI
  const testProcess = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
  });

  // Handle child process exit status
  testProcess.on('exit', (code) => {
    if (code !== 0) {
      logger.error('Playwright test execution failed.');
      process.exit(code);
    } else {
      logger.info('Playwright tests completed successfully.');
    }
  });
}
