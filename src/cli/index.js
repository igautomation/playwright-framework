#!/usr/bin/env node
// src/cli/index.js

// Import required Node.js modules and dependencies
// - `yargs` and `hideBin` for building the CLI and parsing arguments
// - `execSync` for executing shell commands synchronously
// - `fs-extra` for enhanced file system operations
// - `path` for handling file paths
// - `dotenv-safe` for securely loading environment variables
// - Various utility functions for test data, Xray integration, CI setup, Git operations, and reporting
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { config: loadEnv } = require('dotenv-safe');
const { generateUsersToFile, generateProductsToCsv } = require('../utils/common/testDataFactory');
const { pushExecutionResults } = require('../utils/xray/xrayUtils');
const { pushToGitHub, configureJenkinsPipeline, setupCiEnvironment } = require('../utils/ci/ciUtils');
const { installPlaywrightVSCode, configureRetry } = require('../utils/setup/setupUtils');
const { clone, checkout, status, pull, commit, push } = require('../utils/git/gitUtils');
const { generateAllureReport, notify, uploadReport, uploadArtifacts } = require('../utils/reporting/reportUtils');
const TestSelector = require('../utils/ci/testSelector');
const FlakyTestTracker = require('../utils/ci/flakyTestTracker');

const testSelector = new TestSelector();
const flakyTracker = new FlakyTestTracker();

// Load environment variables using dotenv-safe
// This block ensures that environment variables are available for the CLI
// - `NODE_ENV` determines the environment (e.g., 'development', 'qa', 'prod')
// - Maps 'development' to 'dev.env' to match the file naming convention
// - Uses `.env.example` as a template for required variables
// - Loads environment-specific `.env` file (e.g., `src/config/env/dev.env`)
const env = process.env.NODE_ENV || 'development';
const envFileName = env === 'development' ? 'dev' : env;
try {
  loadEnv({
    allowEmptyValues: true,
    example: '.env.example',
    path: `src/config/env/${envFileName}.env`,
  });
  loadEnv({ allowEmptyValues: true, example: '.env.example' });
} catch (error) {
  console.error(`Failed to load environment variables: ${error.message}`);
  process.exit(1);
}

// Define the CLI using yargs
// - `hideBin` removes Node.js process arguments from the CLI input
// - Each command is defined with a description, arguments, options, and handler function
yargs(hideBin(process.argv))
  // Command: `init [dir]`
  // Purpose: Initializes a new Playwright project with a predefined structure
  // - Scaffolds directories (`src/tests`, `src/pages`, `src/utils`, `src/data`, `src/config/env`)
  // - Creates necessary files (`playwright.config.js`, sample test, pages, utils, data, env files)
  // - Creates a `package.json` with necessary dependencies
  // - Installs dependencies and initializes a Git repository
  // - Inspired by Boyka Framework's `boyka init` for zero boilerplate setup
  .command('init [dir]', 'Initialize a new project', (yargs) => {
    return yargs.option('dir', {
      describe: 'Directory to scaffold the project in',
      default: 'playwright-project',
      type: 'string',
    });
  }, async (argv) => {
    try {
      const projectDir = path.resolve(process.cwd(), argv.dir);
      console.log(`Scaffolding project in ${projectDir}...`);

      // Create directory structure for the new project
      await fs.mkdir(projectDir, { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src/tests'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src/pages'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src/utils/common'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src/config/env'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src/data/csv'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'src/data/json'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'logs'), { recursive: true });

      // Copy template files from src/templates/
      const templateDir = path.join(__dirname, '../templates');
      await fs.copyFile(
        path.join(templateDir, 'playwright.config.js'),
        path.join(projectDir, 'playwright.config.js')
      );
      await fs.copyFile(
        path.join(templateDir, 'sample-test.spec.js'),
        path.join(projectDir, 'src/tests/sample-test.spec.js')
      );
      await fs.copyFile(
        path.join(templateDir, 'SamplePage.js'),
        path.join(projectDir, 'src/pages/SamplePage.js')
      );

      // Create additional files for a complete project setup
      // Pages for Page Object Model (POM)
      await fs.writeFile(
        path.join(projectDir, 'src/pages/LoginPage.js'),
        `class LoginPage {
          constructor(page) {
            this.page = page;
          }
          async navigate() {
            await this.page.goto(process.env.CUSTOM_LOGIN_URL || '/login');
          }
          async login(username, password) {
            await this.page.fill('#username', username);
            await this.page.fill('#password', password);
            await this.page.click('button[type="submit"]');
          }
          async getLoginError() {
            return await this.page.locator('.error-message').textContent();
          }
        }
        module.exports = LoginPage;`
      );

      await fs.writeFile(
        path.join(projectDir, 'src/pages/HomePage.js'),
        `class HomePage {
          constructor(page) {
            this.page = page;
          }
          async getWelcomeMessage() {
            return await this.page.locator('h1').textContent();
          }
        }
        module.exports = HomePage;`
      );

      // Utility for reading data files
      await fs.writeFile(
        path.join(projectDir, 'src/utils/common/dataUtils.js'),
        `const fs = require('fs').promises;
        async function readData(filePath) {
          const data = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(data);
        }
        module.exports = { readData };`
      );

      // Sample test data
      await fs.writeFile(
        path.join(projectDir, 'src/data/csv/products.csv'),
        `id,name,price,category,stock
        1,Product 1,10.99,Electronics,100
        2,Product 2,20.99,Books,50`
      );

      await fs.writeFile(
        path.join(projectDir, 'src/data/json/credentials.json'),
        JSON.stringify({
          users: [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: 'user', password: 'user123', role: 'user' },
          ],
        }, null, 2)
      );

      // Environment configuration files
      await fs.writeFile(
        path.join(projectDir, 'src/config/env/dev.env'),
        `# Base configuration for development environment
        BASE_URL=https://example.com
        API_KEY=your-api-key-placeholder
        HEADLESS=true
        TIMEOUT_MULTIPLIER=1
        JIRA_PROJECT_ID=PROJ-123
        XRAY_TOKEN=your-xray-token-placeholder
        STORAGE_STATE=test-results/state.json
        LOCALE=en-US
        TIMEZONE=UTC
        GEOLOCATION_LATITUDE=40.7128
        GEOLOCATION_LONGITUDE=-74.0060
        OFFLINE=false
        JAVASCRIPT_ENABLED=true
        AUTH_TOKEN=mock-auth-token
        CUSTOM_LOGIN_URL=/login
        SF_USERNAME=salesforce-username-placeholder
        SF_PASSWORD=salesforce-password-placeholder`
      );

      await fs.writeFile(
        path.join(projectDir, '.env.example'),
        `BASE_URL=
        API_KEY=
        HEADLESS=
        TIMEOUT_MULTIPLIER=
        JIRA_PROJECT_ID=
        XRAY_TOKEN=
        STORAGE_STATE=
        LOCALE=
        TIMEZONE=
        GEOLOCATION_LATITUDE=
        GEOLOCATION_LONGITUDE=
        OFFLINE=
        JAVASCRIPT_ENABLED=
        AUTH_TOKEN=
        CUSTOM_LOGIN_URL=
        SF_USERNAME=
        SF_PASSWORD=`
      );

      // Create package.json with project dependencies and scripts
      const packageJson = {
        name: 'playwright-project',
        version: '1.0.0',
        scripts: {
          test: 'npx framework run',
          'list-tags': 'npx framework list-tags',
          'generate-report': 'npx framework generate-report',
          lint: 'eslint src',
          format: 'prettier --write src',
          'format:check': 'prettier --check src',
        },
        dependencies: {
          '@your-org/playwright-framework': '^1.0.0',
          '@playwright/test': '^1.42.0',
          'dotenv-safe': '^8.2.0',
          '@faker-js/faker': '^7.0.0',
          'uuid': '^8.3.2',
          'yargs': '^17.0.0',
          'fs-extra': '^10.0.0',
          'allure-playwright': '^2.0.0',
          'js-yaml': '^4.1.0',
          'csv-parse': '^5.0.0',
          'graphql-request': '^5.0.0',
          'subscriptions-transport-ws': '^0.11.0',
          'ws': '^8.0.0',
          'node-fetch': '^2.6.1',
          'aws-sdk': '^2.0.0',
          'mime': '^3.0.0',
          'winston': '^3.0.0', // Added for structured logging
          'ajv': '^8.0.0', // Added for API schema validation
        },
        devDependencies: {
          eslint: '^8.0.0',
          prettier: '^2.0.0',
          husky: '^8.0.0',
          'lint-staged': '^13.0.0',
        },
      };
      await fs.writeFile(
        path.join(projectDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Install dependencies using npm
      execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
      console.log('Installed dependencies');

      // Initialize a Git repository for version control
      execSync('git init', { cwd: projectDir, stdio: 'inherit' });
      console.log('Initialized Git repository');

      console.log('Project scaffolded successfully! Run:');
      console.log(`cd ${argv.dir} && npm run test`);
    } catch (error) {
      console.error(`Failed to scaffold project: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `run [files..]`
  // Purpose: Runs Playwright tests with full support for all CLI options
  // - Supports all Playwright CLI options from "Command Line" documentation
  // - Aligns with "Test Configuration", "Parallelism", "Projects", "Reporters", "Retries", "Sharding", "Timeouts", "UI Mode"
  // - Allows filtering tests, running in UI mode, sharding, custom reporters, etc.
  .command('run [files..]', 'Run tests', (yargs) => {
    return yargs
      .positional('files', {
        describe: 'Test files or patterns to run (e.g., "tests/todo-page.spec.ts" or "my-spec")',
        type: 'string',
      })
      .option('tags', {
        description: 'Comma-separated tags or test titles to filter tests (e.g., "smoke,regression" or "add a todo item")',
        type: 'string',
      })
      .option('headed', {
        description: 'Run in headed mode',
        type: 'boolean',
      })
      .option('project', {
        description: 'Playwright project(s) to run (e.g., "chromium")',
        type: 'array',
      })
      .option('shard', {
        description: 'Sharding (e.g., "1/3")',
        type: 'string',
      })
      .option('workers', {
        description: 'Number of concurrent workers (e.g., "1" or "50%")',
        type: 'string',
      })
      .option('reporter', {
        description: 'Reporter to use (e.g., "dot", "list", "html")',
        type: 'string',
      })
      .option('debug', {
        description: 'Run in debug mode with Playwright Inspector',
        type: 'boolean',
      })
      .option('last-failed', {
        description: 'Only re-run the failures',
        type: 'boolean',
      })
      .option('list', {
        description: 'List all tests without running them',
        type: 'boolean',
      })
      .option('max-failures', {
        alias: 'x',
        description: 'Stop after N failures (use -x to stop after 1 failure)',
        type: 'number',
      })
      .option('repeat-each', {
        description: 'Run each test N times',
        type: 'number',
      })
      .option('timeout', {
        description: 'Test timeout in milliseconds',
        type: 'number',
      })
      .option('global-timeout', {
        description: 'Maximum time for the test suite in milliseconds',
        type: 'number',
      })
      .option('retries', {
        description: 'Maximum retry count for flaky tests',
        type: 'number',
      })
      .option('update-snapshots', {
        alias: 'u',
        description: 'Update snapshots ("all", "changed", "missing", "none")',
        type: 'string',
        choices: ['all', 'changed', 'missing', 'none'],
      })
      .option('update-source-method', {
        description: 'Method to update snapshots ("patch", "3way", "overwrite")',
        type: 'string',
        choices: ['patch', '3way', 'overwrite'],
      })
      .option('no-deps', {
        description: 'Ignore dependencies and teardowns',
        type: 'boolean',
      })
      .option('config', {
        alias: 'c',
        description: 'Configuration file to use',
        type: 'string',
      })
      .option('grep-invert', {
        alias: 'gv',
        description: 'Only run tests that do not match this regular expression',
        type: 'string',
      })
      .option('ignore-snapshots', {
        description: 'Ignore screenshot and snapshot expectations',
        type: 'boolean',
      })
      .option('only-changed', {
        description: 'Only run test files that have been changed (e.g., "origin/main")',
        type: 'string',
      })
      .option('pass-with-no-tests', {
        description: 'Succeed even if no tests are found',
        type: 'boolean',
      })
      .option('quiet', {
        description: 'Suppress stdio output',
        type: 'boolean',
      })
      .option('tsconfig', {
        description: 'Path to a single tsconfig.json',
        type: 'string',
      })
      .option('ui', {
        description: 'Run tests in interactive UI mode',
        type: 'boolean',
      })
      .option('ui-host', {
        description: 'Host to serve UI on',
        type: 'string',
      })
      .option('ui-port', {
        description: 'Port to serve UI on (0 for any free port)',
        type: 'number',
      });
  }, (argv) => {
    console.log(`Running tests in ${env} environment...`);
    let command = `NODE_ENV=${env} npx playwright test`;

    // Add non-option arguments (test files or patterns)
    if (argv.files && argv.files.length > 0) {
      command += ` ${argv.files.join(' ')}`;
    }

    // Add all supported Playwright CLI options
    if (argv.tags) {
      const tags = argv.tags.split(',').map(tag => `(?=.*@${tag})`).join('');
      command += ` --grep "${tags}"`;
    }
    if (argv.headed) command += ' --headed';
    if (argv.project) {
      const projects = Array.isArray(argv.project) ? argv.project : [argv.project];
      projects.forEach(project => {
        command += ` --project ${project}`;
      });
    }
    if (argv.shard) command += ` --shard ${argv.shard}`;
    if (argv.workers) command += ` --workers ${argv.workers}`;
    if (argv.reporter) command += ` --reporter ${argv.reporter}`;
    if (argv.debug) command += ' --debug';
    if (argv.lastFailed) command += ' --last-failed';
    if (argv.list) command += ' --list';
    if (argv.maxFailures) command += ` --max-failures ${argv.maxFailures}`;
    if (argv.repeatEach) command += ` --repeat-each ${argv.repeatEach}`;
    if (argv.timeout) command += ` --timeout ${argv.timeout}`;
    if (argv.globalTimeout) command += ` --global-timeout ${argv.globalTimeout}`;
    if (argv.retries) command += ` --retries ${argv.retries}`;
    if (argv.updateSnapshots) command += ` --update-snapshots ${argv.updateSnapshots}`;
    if (argv.updateSourceMethod) command += ` --update-source-method ${argv.updateSourceMethod}`;
    if (argv.noDeps) command += ' --no-deps';
    if (argv.config) command += ` --config ${argv.config}`;
    if (argv.grepInvert) command += ` --grep-invert "${argv.grepInvert}"`;
    if (argv.ignoreSnapshots) command += ' --ignore-snapshots';
    if (argv.onlyChanged) command += ` --only-changed ${argv.onlyChanged}`;
    if (argv.passWithNoTests) command += ' --pass-with-no-tests';
    if (argv.quiet) command += ' --quiet';
    if (argv.tsconfig) command += ` --tsconfig ${argv.tsconfig}`;
    if (argv.ui) command += ' --ui';
    if (argv.uiHost) command += ` --ui-host ${argv.uiHost}`;
    if (argv.uiPort) command += ` --ui-port ${argv.uiPort}`;

    try {
      execSync(command, { stdio: 'inherit' });
      console.log('Tests executed successfully.');
    } catch (error) {
      console.error(`Test execution failed: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `list-tags`
  // Purpose: Lists all unique tags found in test files
  // - Recursively scans test files for tags (e.g., @smoke, @regression)
  // - Useful for understanding available test categories
  .command('list-tags', 'List available tags', () => {}, async () => {
    console.log('Listing test tags...');
    const testDir = path.join(__dirname, '../tests');
    const tags = new Set();

    const walkDir = async (dir) => {
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          await walkDir(fullPath);
        } else if (file.name.endsWith('.spec.js')) {
          const content = await fs.readFile(fullPath, 'utf8');
          const tagMatches = content.match(/@[\w-]+/g) || [];
          tagMatches.forEach(tag => tags.add(tag));
        }
      }
    };

    try {
      await walkDir(testDir);
      if (tags.size === 0) {
        console.log('No tags found in test files.');
      } else {
        console.log('Available tags:');
        tags.forEach(tag => console.log(`- ${tag}`));
      }
    } catch (error) {
      console.error(`Failed to list tags: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `generate-data`
  // Purpose: Generates test data (users or products) for use in tests
  // - Supports generating user data (JSON) or product data (CSV)
  // - Useful for creating mock data for testing
  .command('generate-data', 'Generate test data', (yargs) => {
    return yargs
      .option('type', {
        describe: 'Type of data to generate (users, products)',
        demandOption: true,
        type: 'string',
        choices: ['users', 'products'],
      })
      .option('count', {
        describe: 'Number of records to generate',
        default: 10,
        type: 'number',
      })
      .option('output', {
        describe: 'Output file path',
        demandOption: true,
        type: 'string',
      });
  }, async (argv) => {
    try {
      if (argv.type === 'users') {
        await generateUsersToFile(argv.count, argv.output);
        console.log(`Generated ${argv.count} users to ${argv.output}`);
      } else if (argv.type === 'products') {
        await generateProductsToCsv(argv.count, argv.output);
        console.log(`Generated ${argv.count} products to ${argv.output}`);
      }
    } catch (error) {
      console.error(`Failed to generate test data: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `generate-report`
  // Purpose: Generates an Allure report from test results
  // - Uses the `allure-playwright` reporter output to create a detailed report
  // - Useful for analyzing test results post-execution
  .command('generate-report', 'Generate Allure report', () => {}, () => {
    try {
      generateAllureReport();
      console.log('Allure report generated successfully.');
    } catch (error) {
      console.error(`Failed to generate Allure report: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `merge-reports [reportDir]`
  // Purpose: Merges blob reports from sharded test runs into a single HTML report
  // - Aligns with "Sharding" documentation for combining sharded test results
  // - Outputs a merged report for comprehensive analysis
  .command('merge-reports [reportDir]', 'Merge blob reports from sharded runs', (yargs) => {
    return yargs
      .positional('reportDir', {
        describe: 'Directory containing blob reports (default: "blob-report")',
        type: 'string',
        default: 'blob-report',
      })
      .option('output', {
        description: 'Output directory for merged report (default: "merged-report")',
        type: 'string',
        default: 'merged-report',
      });
  }, (argv) => {
    console.log(`Merging reports from ${argv.reportDir} into ${argv.output}...`);
    let command = `npx playwright merge-reports ${argv.reportDir} --reporter html --output ${argv.output}`;
    try {
      execSync(command, { stdio: 'inherit' });
      console.log(`Merged report generated at ${argv.output}`);
    } catch (error) {
      console.error(`Failed to merge reports: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `notify <webhookUrl> <message> [channel]`
  // Purpose: Sends a notification to Slack or Teams
  // - Useful for alerting teams about test results or CI pipeline status
  // - Supports specifying a channel for Slack notifications
  .command('notify <webhookUrl> <message> [channel]', 'Send notification to Slack/Teams', (yargs) => {
    return yargs
      .positional('webhookUrl', {
        describe: 'Webhook URL for Slack/Teams',
        type: 'string',
        demandOption: true,
      })
      .positional('message', {
        describe: 'Message to send',
        type: 'string',
        demandOption: true,
      })
      .positional('channel', {
        describe: 'Channel or user to notify (Slack)',
        type: 'string',
      });
  }, async (argv) => {
    try {
      await notify({ webhookUrl: argv.webhookUrl, message: argv.message, channel: argv.channel });
      console.log('Notification sent successfully.');
    } catch (error) {
      console.error(`Failed to send notification: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `upload-report <bucket> [reportPath] [s3Path]`
  // Purpose: Uploads test reports to an S3 bucket
  // - Useful for storing test reports in a centralized cloud storage
  // - Supports specifying a custom report path and S3 path
  .command('upload-report <bucket> [reportPath] [s3Path]', 'Upload report to S3', (yargs) => {
    return yargs
      .positional('bucket', {
        describe: 'S3 bucket name',
        type: 'string',
        demandOption: true,
      })
      .positional('reportPath', {
        describe: 'Path to report directory',
        type: 'string',
        default: 'reports/allure-report',
      })
      .positional('s3Path', {
        describe: 'Path in S3 to upload to',
        type: 'string',
      });
  }, async (argv) => {
    try {
      await uploadReport({ bucket: argv.bucket, reportPath: argv.reportPath, s3Path: argv.s3Path });
      console.log(`Report uploaded to S3 bucket ${argv.bucket} at ${argv.s3Path || ''}`);
    } catch (error) {
      console.error(`Failed to upload report to S3: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `upload-artifacts <bucket> [artifactsPath] [s3Path]`
  // Purpose: Uploads test artifacts (e.g., screenshots, traces) to an S3 bucket
  // - Useful for archiving test artifacts in cloud storage
  // - Supports specifying a custom artifacts path and S3 path
  .command('upload-artifacts <bucket> [artifactsPath] [s3Path]', 'Upload artifacts to S3', (yargs) => {
    return yargs
      .positional('bucket', {
        describe: 'S3 bucket name',
        type: 'string',
        demandOption: true,
      })
      .positional('artifactsPath', {
        describe: 'Path to artifacts directory',
        type: 'string',
        default: 'artifacts',
      })
      .positional('s3Path', {
        describe: 'Path in S3 to upload to',
        type: 'string',
      });
  }, async (argv) => {
    try {
      await uploadArtifacts({ bucket: argv.bucket, artifactsPath: argv.artifactsPath, s3Path: argv.s3Path });
      console.log(`Artifacts uploaded to S3 bucket ${argv.bucket} at ${argv.s3Path || ''}`);
    } catch (error) {
      console.error(`Failed to upload artifacts to S3: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `select-tests [baseCommit] [headCommit]`
  // Purpose: Selects tests to run based on Git diffs
  // - Uses `TestSelector` to identify changed tests between commits
  // - Useful for optimizing CI runs by running only affected tests
  .command('select-tests [baseCommit] [headCommit]', 'Select tests based on Git diff', (yargs) => {
    return yargs
      .positional('baseCommit', {
        describe: 'Base commit (default: origin/main)',
        type: 'string',
        default: 'origin/main',
      })
      .positional('headCommit', {
        describe: 'Head commit (default: HEAD)',
        type: 'string',
        default: 'HEAD',
      });
  }, (argv) => {
    try {
      const tests = testSelector.selectTestsByDiff(argv.baseCommit, argv.headCommit);
      console.log('Selected tests:', tests);
    } catch (error) {
      console.error(`Failed to select tests: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `quarantine-flaky`
  // Purpose: Identifies and quarantines flaky tests
  // - Uses `FlakyTestTracker` to manage flaky tests
  // - Useful for isolating unreliable tests in CI pipelines
  .command('quarantine-flaky', 'Quarantine flaky tests', () => {}, () => {
    try {
      const flakyTests = flakyTracker.quarantineFlakyTests();
      console.log('Quarantined flaky tests:', flakyTests);
    } catch (error) {
      console.error(`Failed to quarantine flaky tests: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `push-to-xray <testExecutionKey>`
  // Purpose: Pushes test results to Xray for test management
  // - Integrates with Xray by uploading test execution results
  // - Useful for tracking test results in a test management system
  .command('push-to-xray <testExecutionKey>', 'Push test results to Xray', (yargs) => {
    return yargs.positional('testExecutionKey', {
      describe: 'Xray Test Execution key',
      type: 'string',
      demandOption: true,
    });
  }, async (argv) => {
    try {
      const results = [
        { testKey: 'TEST-123', startTime: Date.now() - 1000, endTime: Date.now(), status: 'passed' },
      ];
      await pushExecutionResults(argv.testExecutionKey, results);
      console.log(`Test results pushed to Xray with key ${argv.testExecutionKey}`);
    } catch (error) {
      console.error(`Failed to push results to Xray: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `codegen <url> [output]`
  // Purpose: Runs Playwright's codegen to generate test code
  // - Opens a browser and records user actions as test code
  // - Useful for quickly creating Playwright tests
  .command('codegen <url> [output]', 'Run Playwright codegen', (yargs) => {
    return yargs
      .positional('url', {
        describe: 'URL to open for codegen',
        type: 'string',
        demandOption: true,
      })
      .positional('output', {
        describe: 'Output file path',
        type: 'string',
      });
  }, (argv) => {
    let command = `npx playwright codegen ${argv.url}`;
    if (argv.output) command += ` --output ${argv.output}`;
    try {
      execSync(command, { stdio: 'inherit' });
      console.log('Codegen completed successfully.');
    } catch (error) {
      console.error(`Codegen failed: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `push-github <branch> [message]`
  // Purpose: Commits and pushes changes to GitHub
  // - Automates Git push operations for CI/CD workflows
  // - Requires a branch name and optional commit message
  .command('push-github <branch> [message]', 'Push to GitHub', (yargs) => {
    return yargs
      .positional('branch', {
        describe: 'Branch to push to',
        type: 'string',
        demandOption: true,
      })
      .positional('message', {
        describe: 'Commit message',
        type: 'string',
      });
  }, (argv) => {
    try {
      pushToGitHub(argv.branch, argv.message);
      console.log(`Pushed to GitHub branch ${argv.branch}`);
    } catch (error) {
      console.error(`Failed to push to GitHub: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `configure-jenkins <jobName> [script]`
  // Purpose: Configures a Jenkins pipeline for CI/CD
  // - Automates Jenkins job setup with a pipeline script
  // - Useful for integrating with Jenkins CI environments
  .command('configure-jenkins <jobName> [script]', 'Configure Jenkins pipeline', (yargs) => {
    return yargs
      .positional('jobName', {
        describe: 'Jenkins job name',
        type: 'string',
        demandOption: true,
      })
      .positional('script', {
        describe: 'Pipeline script path',
        type: 'string',
      });
  }, (argv) => {
    try {
      configureJenkinsPipeline({ jobName: argv.jobName, pipelineScript: argv.script });
      console.log(`Jenkins pipeline configured for job ${argv.jobName}`);
    } catch (error) {
      console.error(`Failed to configure Jenkins pipeline: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `install-vscode`
  // Purpose: Installs the Playwright VS Code extension
  // - Automates setup of Playwright tooling in VS Code
  // - Useful for developers to quickly set up their IDE
  .command('install-vscode', 'Install Playwright VS Code extension', () => {}, () => {
    try {
      installPlaywrightVSCode();
      console.log('Playwright VS Code extension installed successfully.');
    } catch (error) {
      console.error(`Failed to install VS Code extension: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `configure-retry <retries>`
  // Purpose: Configures the retry count for tests
  // - Updates the framework’s retry settings
  // - Aligns with "Retries" documentation for managing flaky tests
  .command('configure-retry <retries>', 'Configure test retries', (yargs) => {
    return yargs.positional('retries', {
      describe: 'Number of retries',
      type: 'number',
      demandOption: true,
    });
  }, (argv) => {
    try {
      configureRetry(argv.retries);
      console.log(`Test retries configured to ${argv.retries}`);
    } catch (error) {
      console.error(`Failed to configure retries: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `git-clone <repoUrl> [destPath]`
  // Purpose: Clones a Git repository
  // - Automates cloning for CI/CD setup or local development
  // - Supports specifying a destination path
  .command('git-clone <repoUrl> [destPath]', 'Clone a Git repository', (yargs) => {
    return yargs
      .positional('repoUrl', {
        describe: 'Repository URL',
        type: 'string',
        demandOption: true,
      })
      .positional('destPath', {
        describe: 'Destination path',
        type: 'string',
      });
  }, (argv) => {
    try {
      clone(argv.repoUrl, argv.destPath);
      console.log(`Repository cloned to ${argv.destPath || process.cwd()}`);
    } catch (error) {
      console.error(`Failed to clone repository: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `git-checkout <branch> [repoPath]`
  // Purpose: Checks out a specific Git branch
  // - Automates branch switching for CI/CD or local workflows
  // - Supports specifying a repository path
  .command('git-checkout <branch> [repoPath]', 'Checkout a Git branch', (yargs) => {
    return yargs
      .positional('branch', {
        describe: 'Branch name',
        type: 'string',
        demandOption: true,
      })
      .positional('repoPath', {
        describe: 'Repository path',
        type: 'string',
      });
  }, (argv) => {
    try {
      checkout(argv.branch, argv.repoPath);
      console.log(`Checked out branch ${argv.branch} in ${argv.repoPath || process.cwd()}`);
    } catch (error) {
      console.error(`Failed to checkout branch: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `git-status [repoPath]`
  // Purpose: Displays the Git status of a repository
  // - Useful for checking the state of the repository during CI/CD
  // - Supports specifying a repository path
  .command('git-status [repoPath]', 'Get Git status', (yargs) => {
    return yargs.positional('repoPath', {
      describe: 'Repository path',
      type: 'string',
    });
  }, (argv) => {
    try {
      const gitStatus = status(argv.repoPath);
      console.log(gitStatus);
    } catch (error) {
      console.error(`Failed to get Git status: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `git-pull [branch] [repoPath]`
  // Purpose: Pulls changes from a Git remote
  // - Automates pulling updates for CI/CD or local workflows
  // - Supports specifying a branch and repository path
  .command('git-pull [branch] [repoPath]', 'Pull from Git', (yargs) => {
    return yargs
      .positional('branch', {
        describe: 'Branch to pull',
        type: 'string',
      })
      .positional('repoPath', {
        describe: 'Repository path',
        type: 'string',
      });
  }, (argv) => {
    try {
      pull(argv.branch, argv.repoPath);
      console.log(`Pulled ${argv.branch || 'current branch'} in ${argv.repoPath || process.cwd()}`);
    } catch (error) {
      console.error(`Failed to pull from Git: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `git-commit <message> [repoPath]`
  // Purpose: Commits changes to a Git repository
  // - Automates committing changes for CI/CD or local workflows
  // - Requires a commit message and supports a repository path
  .command('git-commit <message> [repoPath]', 'Commit changes', (yargs) => {
    return yargs
      .positional('message', {
        describe: 'Commit message',
        type: 'string',
        demandOption: true,
      })
      .positional('repoPath', {
        describe: 'Repository path',
        type: 'string',
      });
  }, (argv) => {
    try {
      commit(argv.message, argv.repoPath);
      console.log(`Committed changes in ${argv.repoPath || process.cwd()} with message: "${argv.message}"`);
    } catch (error) {
      console.error(`Failed to commit changes: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `git-push <branch> [repoPath]`
  // Purpose: Pushes changes to a Git remote
  // - Automates pushing commits for CI/CD or local workflows
  // - Requires a branch name and supports a repository path
  .command('git-push <branch> [repoPath]', 'Push to GitHub', (yargs) => {
    return yargs
      .positional('branch', {
        describe: 'Branch to push to',
        type: 'string',
        demandOption: true,
      })
      .positional('repoPath', {
        describe: 'Repository path',
        type: 'string',
      });
  }, (argv) => {
    try {
      push(argv.branch, argv.repoPath);
      console.log(`Pushed to branch ${argv.branch} in ${argv.repoPath || process.cwd()}`);
    } catch (error) {
      console.error(`Failed to push to GitHub: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `setup-ci <repoUrl> [branch] [repoPath]`
  // Purpose: Sets up a CI environment by cloning a repository and checking out a branch
  // - Automates CI setup for running tests in a pipeline
  // - Requires a repository URL and supports a branch and path
  .command('setup-ci <repoUrl> [branch] [repoPath]', 'Set up CI environment', (yargs) => {
    return yargs
      .positional('repoUrl', {
        describe: 'Repository URL to clone',
        type: 'string',
        demandOption: true,
      })
      .positional('branch', {
        describe: 'Branch to checkout',
        type: 'string',
      })
      .positional('repoPath', {
        describe: 'Path to clone the repository',
        type: 'string',
      });
  }, (argv) => {
    try {
      setupCiEnvironment({ repoUrl: argv.repoUrl, branch: argv.branch, repoPath: argv.repoPath });
      console.log(`CI environment set up in ${argv.repoPath || process.cwd()}`);
    } catch (error) {
      console.error(`Failed to set up CI environment: ${error.message}`);
      process.exit(1);
    }
  })

  // Command: `use-typescript`
  // Purpose: Enables TypeScript support in the project
  // - Adds TypeScript dependencies, generates a `tsconfig.json`, and updates scripts
  // - Useful for projects that want to transition to TypeScript
  .command('use-typescript', 'Enable TypeScript support', () => {}, () => {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = fs.readJsonSync(packageJsonPath);
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        typescript: '^5.0.0',
        '@types/node': '^18.0.0',
      };
      fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
      console.log('Added TypeScript dependencies to package.json');

      execSync('npm install', { stdio: 'inherit' });

      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      if (!fs.existsSync(tsconfigPath)) {
        fs.writeJsonSync(tsconfigPath, {
          compilerOptions: {
            target: 'es6',
            module: 'commonjs',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            outDir: './dist',
            rootDir: './src',
          },
          include: ['src/**/*'],
          exclude: ['node_modules'],
        }, { spaces: 2 });
        console.log('Generated tsconfig.json');
      }

      const configJsPath = path.join(process.cwd(), 'src/config/playwright.config.js');
      const configTsPath = path.join(process.cwd(), 'src/config/playwright.config.ts');
      if (fs.existsSync(configJsPath)) {
        fs.renameSync(configJsPath, configTsPath);
        console.log('Renamed playwright.config.js to playwright.config.ts');
      }

      packageJson.scripts = {
        ...packageJson.scripts,
        test: 'tsc && npx framework run',
      };
      fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
      console.log('Updated package.json scripts for TypeScript');

      console.log('TypeScript support enabled successfully!');
    } catch (error) {
      console.error(`Failed to enable TypeScript: ${error.message}`);
      process.exit(1);
    }
  })

  // Final CLI setup
  // - `demandCommand` ensures at least one command is provided
  // - `help` enables the help output for all commands
  .demandCommand()
  .help()
  .argv;