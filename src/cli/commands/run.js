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
