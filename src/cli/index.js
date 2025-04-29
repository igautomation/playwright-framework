#!/usr/bin/env node
// src/cli/index.js

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { config as loadEnv } from 'dotenv-safe';

import logger from '../utils/common/logger.js';
import { generateUsersToFile, generateProductsToCsv } from '../utils/common/testDataFactory.js';
import XrayUtils from '../utils/xray/xrayUtils.js';
import { generateAllureReport, notify } from '../utils/reporting/reportUtils.js';
import { installPlaywrightVSCode, configureRetry } from '../utils/setup/setupUtils.js';
import TestSelector from '../utils/ci/testSelector.js';
import FlakyTestTracker from '../utils/ci/flakyTestTracker.js';
import CIUtils from '../utils/ci/ciUtils.js';

const testSelector = new TestSelector();
const flakyTracker = new FlakyTestTracker();
const ciUtils = new CIUtils();
const xrayClient = new XrayUtils(); // instantiate XrayUtils properly

function loadEnvironmentVariables(projectDir) {
  const env = process.env.NODE_ENV || 'development';
  const envFileName = env === 'development' ? 'dev' : env;
  try {
    loadEnv({
      allowEmptyValues: true,
      example: path.join(projectDir, '.env.example'),
      path: path.join(projectDir, `src/config/env/${envFileName}.env`),
    });
    loadEnv({ allowEmptyValues: true, example: path.join(projectDir, '.env.example') });
  } catch (error) {
    logger.error(`Failed to load environment variables: ${error.message}`);
    process.exit(1);
  }
  return env;
}

(async () => {
  try {
    yargs(hideBin(process.argv))
      .command('init [dir]', 'Initialize project', (yargs) => {
        return yargs.option('dir', {
          describe: 'Directory to scaffold',
          type: 'string',
          default: 'playwright-project',
        });
      }, async (argv) => {
        const projectDir = path.resolve(process.cwd(), argv.dir);
        await fs.mkdirp(projectDir);
        logger.info(`Project initialized at ${projectDir}`);
      })

      .command('run [files..]', 'Run Playwright tests', (yargs) => {
        return yargs
          .option('tags', { describe: 'Tags to filter', type: 'string' })
          .option('headed', { describe: 'Run browser headed', type: 'boolean' })
          .option('project', { describe: 'Project(s)', type: 'array' })
          .option('workers', { describe: 'Number of workers', type: 'string' })
          .option('retries', { describe: 'Retry count', type: 'number' });
      }, (argv) => {
        let command = 'npx playwright test';
        if (argv.tags) command += ` --grep "${argv.tags}"`;
        if (argv.headed) command += ' --headed';
        if (argv.project) command += ` --project ${argv.project.join(' ')}`;
        if (argv.workers) command += ` --workers ${argv.workers}`;
        if (argv.retries !== undefined) command += ` --retries ${argv.retries}`;
        logger.info(`Running command: ${command}`);
        execSync(command, { stdio: 'inherit' });
      })

      .command('generate-data', 'Generate sample users/products', (yargs) => {
        return yargs
          .option('type', { choices: ['users', 'products'], demandOption: true })
          .option('count', { type: 'number', default: 10 })
          .option('output', { type: 'string', demandOption: true });
      }, async (argv) => {
        if (argv.type === 'users') {
          await generateUsersToFile(argv.count, argv.output);
        } else if (argv.type === 'products') {
          await generateProductsToCsv(argv.count, argv.output);
        }
        logger.info('Test data generated.');
      })

      .command('list-tags', 'List @tags from test files', {}, async () => {
        const files = fs.readdirSync('src/tests', { recursive: true });
        const tags = new Set();
        files.forEach(file => {
          if (typeof file === 'string' && file.endsWith('.spec.js')) {
            const content = fs.readFileSync(path.join('src/tests', file), 'utf-8');
            const matches = content.match(/@\w+/g);
            if (matches) matches.forEach(tag => tags.add(tag));
          }
        });
        logger.info('Available Tags:\n' + [...tags].sort().join('\n'));
      })

      .command('push-to-xray <testExecutionKey>', 'Push results to Xray', {}, async (argv) => {
        await xrayClient.authenticate(); // Authenticate first
        const dummyResults = [{ testKey: 'TEST-123', status: 'passed', startTime: Date.now(), endTime: Date.now() }];
        await xrayClient.pushExecutionResults(argv.testExecutionKey, dummyResults);
        logger.info('Results pushed to Xray.');
      })

      .command('select-tests [baseCommit] [headCommit]', 'Select tests by Git diff', {}, (argv) => {
        const selected = testSelector.selectTestsByDiff(argv.baseCommit || 'origin/main', argv.headCommit || 'HEAD');
        logger.info('Selected Tests:\n' + JSON.stringify(selected, null, 2));
      })

      .command('quarantine-flaky', 'Mark flaky tests', {}, () => {
        const quarantined = flakyTracker.quarantineFlakyTests();
        logger.info('Quarantined Tests:\n' + JSON.stringify(quarantined, null, 2));
      })

      .command('generate-report', 'Generate Allure report', {}, () => {
        generateAllureReport();
        logger.info('Allure report generated.');
      })

      .command('notify <webhookUrl> <message> [channel]', 'Send notification', {}, async (argv) => {
        await notify({ webhookUrl: argv.webhookUrl, message: argv.message, channel: argv.channel });
        logger.info('Notification sent.');
      })

      .command('install-vscode', 'Install Playwright VS Code extension', {}, () => {
        installPlaywrightVSCode();
        logger.info('VS Code Playwright extension installed.');
      })

      .command('configure-retry <retries>', 'Configure retries', {}, (argv) => {
        configureRetry(argv.retries);
        logger.info(`Retries configured: ${argv.retries}`);
      })

      .command('git-clone <repoUrl> [destPath]', 'Clone Git repo', {}, (argv) => {
        ciUtils.git.clone(argv.repoUrl, argv.destPath);
        logger.info('Repository cloned.');
      })

      .command('git-status [repoPath]', 'Git status', {}, (argv) => {
        logger.info(ciUtils.git.status(argv.repoPath));
      })

      .command('git-pull [branch] [repoPath]', 'Git pull', {}, (argv) => {
        ciUtils.git.pull(argv.branch, argv.repoPath);
        logger.info('Git pull completed.');
      })

      .command('git-commit <message> [repoPath]', 'Git commit', {}, (argv) => {
        ciUtils.git.commit(argv.message, argv.repoPath);
        logger.info('Git commit completed.');
      })

      .command('git-push <branch> [repoPath]', 'Git push', {}, (argv) => {
        ciUtils.git.push(argv.branch, argv.repoPath);
        logger.info('Git push completed.');
      })

      .command('setup-ci <repoUrl> [branch] [repoPath]', 'Setup CI environment', {}, (argv) => {
        ciUtils.setupCiEnvironment({ repoUrl: argv.repoUrl, branch: argv.branch, repoPath: argv.repoPath });
        logger.info('CI environment setup completed.');
      })

      .command('use-typescript', 'Enable TypeScript support', {}, () => {
        execSync('npm install typescript @types/node --save-dev', { stdio: 'inherit' });
        if (!fs.existsSync('tsconfig.json')) {
          fs.writeFileSync('tsconfig.json', JSON.stringify({
            compilerOptions: {
              target: 'es6',
              module: 'commonjs',
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
            },
            include: ['src/**/*']
          }, null, 2));
        }
        logger.info('TypeScript setup completed.');
      })

      .demandCommand()
      .help()
      .argv;

  } catch (error) {
    logger.error('Framework CLI error: ' + error.message);
    process.exit(1);
  }
})();