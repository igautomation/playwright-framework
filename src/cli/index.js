#!/usr/bin/env node

<<<<<<< HEAD
// src/cli/index.js

// Core dependencies
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import fs from 'fs-extra';
import path from 'path';
import { config as loadEnv } from 'dotenv-safe';

// Internal utilities
import logger from '../utils/common/logger.js';
import { generateUsersToFile, generateProductsToCsv } from '../utils/common/testDataFactory.js';
import XrayUtils from '../utils/xray/xrayUtils.js';
import reportUtils from '../utils/reporting/reportUtils.js';
import SetupUtils from '../utils/setup/setupUtils.js';
import TestSelector from '../utils/ci/testSelector.js';
import FlakyTestTracker from '../utils/ci/flakyTestTracker.js';
import CIUtils from '../utils/ci/ciUtils.js';

// CLI commands
import run from './commands/run.js';
import { generateXrayPayloadCommand } from './commands/generate-xray-payload.js';

// Initialize helpers
const testSelector = new TestSelector();
const flakyTracker = new FlakyTestTracker();
const ciUtils = new CIUtils();
const xrayClient = new XrayUtils();
const setupUtils = new SetupUtils();
const { generateAllureReport, sendNotification } = reportUtils;

// Load .env based on NODE_ENV
function loadEnvironmentVariables(projectDir) {
  const env = process.env.NODE_ENV || 'development';
  const envFileName = env === 'development' ? 'dev' : env;

  try {
    loadEnv({
      allowEmptyValues: true,
      path: path.join(projectDir, `src/config/env/${envFileName}.env`),
      example: path.join(projectDir, '.env.example')
    });

    if (!process.env.BASE_URL) {
      throw new Error('BASE_URL is required in the .env file.');
    }

    logger.info(`Environment loaded: ${env}`);
  } catch (error) {
    logger.error(`Failed to load environment: ${error.message}`);
    process.exit(1);
  }

  return env;
}

// CLI entry point
(async () => {
  try {
    const projectDir = process.cwd();
    loadEnvironmentVariables(projectDir);

    yargs(hideBin(process.argv))
      .command(
        'init [dir]',
        'Initialize project',
        (yargs) =>
          yargs.option('dir', {
            describe: 'Directory to scaffold',
            type: 'string',
            default: 'playwright-project'
          }),
        async (argv) => {
          const projectDir = path.resolve(process.cwd(), argv.dir);
          await fs.mkdirp(projectDir);
          logger.info(`Project initialized at ${projectDir}`);
        }
      )

      .command(
        'run [files..]',
        'Run Playwright tests',
        (yargs) =>
          yargs
            .option('tags', { type: 'string', describe: 'Tags to filter' })
            .option('headed', {
              type: 'boolean',
              describe: 'Run browser headed'
            })
            .option('project', { type: 'array', describe: 'Project(s)' })
            .option('workers', {
              type: 'string',
              describe: 'Number of workers'
            })
            .option('retries', { type: 'number', describe: 'Retry count' }),
        (argv) => run(argv)
      )

      .command(
        'generate-data',
        'Generate test users/products',
        (yargs) =>
          yargs
            .option('type', {
              choices: ['users', 'products'],
              demandOption: true
            })
            .option('count', { type: 'number', default: 10 })
            .option('output', { type: 'string', demandOption: true }),
        async (argv) => {
          if (argv.type === 'users') await generateUsersToFile(argv.count, argv.output);
          else await generateProductsToCsv(argv.count, argv.output);
          logger.info('Test data generated');
        }
      )

      .command('list-tags', 'List @tags in test files', {}, async () => {
        const files = fs.readdirSync('src/tests', { recursive: true });
        const tags = new Set();

        files.forEach((file) => {
          if (typeof file === 'string' && file.endsWith('.spec.js')) {
            const content = fs.readFileSync(path.join('src/tests', file), 'utf-8');
            const matches = content.match(/@\w+/g);
            if (matches) matches.forEach((tag) => tags.add(tag));
          }
        });

        logger.info('Available Tags:\n' + [...tags].sort().join('\n'));
      })

      .command('push-to-xray <testExecutionKey>', 'Push test results to Xray', {}, async (argv) => {
        await xrayClient.authenticate();
        const resultsPath = process.env.XRAY_OUTPUT_PATH || 'reports/xray-results.json';
        const results = await fs.readJson(resultsPath);
        await xrayClient.pushExecutionResults(argv.testExecutionKey, results);
        logger.info('Results pushed to Xray');
      })

      .command(
        'select-tests [baseCommit] [headCommit]',
        'Select changed tests from Git diff',
        {},
        (argv) => {
          const selected = testSelector.selectTestsByDiff(
            argv.baseCommit || 'origin/main',
            argv.headCommit || 'HEAD'
          );
          logger.info('Selected Tests:\n' + JSON.stringify(selected, null, 2));
        }
      )

      .command('quarantine-flaky', 'Mark flaky tests from last run', {}, () => {
        const quarantined = flakyTracker.quarantineFlakyTests();
        logger.info('Quarantined:\n' + JSON.stringify(quarantined, null, 2));
      })

      .command('generate-report', 'Generate Allure HTML report', {}, () => {
        generateAllureReport();
        logger.info('Allure report generated');
      })

      .command(
        'notify <webhookUrl> <message> [channel]',
        'Send notification to webhook',
        {},
        async (argv) => {
          await sendNotification({
            webhookUrl: argv.webhookUrl,
            message: argv.message,
            channel: argv.channel
          });
          logger.info('Notification sent');
        }
      )

      .command('install-vscode', 'Install Playwright VS Code extension', {}, () => {
        setupUtils.installPlaywrightVSCode();
        logger.info('VS Code extension installed');
      })

      .command('configure-retry <retries>', 'Update retry config', {}, (argv) => {
        setupUtils.configureRetry(argv.retries);
        logger.info(`Retry count set to ${argv.retries}`);
      })

      .command('git-clone <repoUrl> [destPath]', 'Clone repo', {}, (argv) => {
        ciUtils.git.clone(argv.repoUrl, argv.destPath);
        logger.info('Git repo cloned');
      })

      .command('git-status [repoPath]', 'Check Git status', {}, (argv) => {
        logger.info(ciUtils.git.status(argv.repoPath));
      })

      .command('git-pull [branch] [repoPath]', 'Git pull latest code', {}, (argv) => {
        ciUtils.git.pull(argv.branch, argv.repoPath);
        logger.info('Git pull completed');
      })

      .command('git-commit <message> [repoPath]', 'Commit local changes', {}, (argv) => {
        ciUtils.git.commit(argv.message, argv.repoPath);
        logger.info('Git commit successful');
      })

      .command('git-push <branch> [repoPath]', 'Push committed code', {}, (argv) => {
        ciUtils.git.push(argv.branch, argv.repoPath);
        logger.info('Git push successful');
      })

      .command('setup-ci <repoUrl> [branch] [repoPath]', 'Scaffold CI for repo', {}, (argv) => {
        ciUtils.setupCiEnvironment({
          repoUrl: argv.repoUrl,
          branch: argv.branch,
          repoPath: argv.repoPath
        });
        logger.info('CI setup completed');
      })

      // Register external command modules
      .command(generateXrayPayloadCommand)

      .demandCommand()
      .help().argv;
  } catch (error) {
    logger.error(`CLI error: ${error.message}`);
    process.exit(1);
  }
})();
=======
/**
 * CLI entry point for the framework
 */
const { program } = require('commander');
const path = require('path');
const packageJson = require('../../package.json');

// Set up the CLI program
program
  .name('playwright-framework')
  .description('Enterprise-grade Playwright test automation framework')
  .version(packageJson.version);

// Add commands
program
  .command('run')
  .description('Run tests')
  .option('-t, --tags <tags>', 'Run tests with specific tags')
  .option('-p, --project <project>', 'Run tests with specific project')
  .option('-h, --headed', 'Run tests in headed mode')
  .option('-d, --debug', 'Run tests in debug mode')
  .option('-r, --reporter <reporter>', 'Specify reporter')
  .option('-e, --env <env>', 'Specify environment')
  .action(require('./commands/run'));

program
  .command('list-tags')
  .description('List all available tags')
  .action(() => {
    console.log('Listing tags...');
    // Implementation for listing tags
  });

program
  .command('self-test')
  .description('Run framework self-test')
  .action(require('./commands/self-test'));

// Parse command line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
>>>>>>> 51948a2 (Main v1.0)
