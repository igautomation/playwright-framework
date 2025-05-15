#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Check if xray-integration.js exists and try to import it
let xrayIntegration = null;
try {
  xrayIntegration = require('./utils/xray-integration');
} catch (error) {
  // Silently handle the error if the file doesn't exist
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    proc.on('close', (code) => resolve(code));
  });
}

function showHelp() {
  console.log(`
Playwright Test Framework CLI

Usage:
  node cli.js [command] [options]

Commands:
  run [testPattern]       Run tests matching the pattern
  run:smoke               Run smoke tests
  run:regression          Run regression tests
  run:api                 Run API tests
  run:ui                  Run UI tests
  init                    Initialize project structure
  xray:fetch              Fetch test cases from Xray
  xray:report             Upload test results to Xray
  clean                   Clean test reports and artifacts
  report                  Generate Allure report

Options:
  --browser=<n>           Specify browser (chromium, firefox, webkit)
  --env=<n>               Specify environment (development, qa, uat, production)
  --workers=<number>      Number of parallel workers
  --tags=<pattern>        Test tag grep pattern
  --debug                 Run in debug mode
  --help                  Show this help
  `);
}

async function initializeProject() {
  const folders = [
    'tests/ui',
    'tests/api',
    'tests/hybrid',
    'pages',
    'data',
    'utils',
    'config',
    'reports',
    'state',
    'screenshots',
    '.github/workflows'
  ];

  for (const folder of folders) {
    const folderPath = path.join(__dirname, '..', folder);
    await fs.mkdir(folderPath, { recursive: true });
    console.log(`Created ${folder}`);
  }

  console.log('Project structure initialized');
}

async function cleanArtifacts() {
  const folders = [
    'reports',
    'playwright-report',
    'test-results',
    'allure-results',
    'allure-report'
  ];

  for (const folder of folders) {
    try {
      const folderPath = path.join(__dirname, '..', folder);
      await fs.rm(folderPath, { recursive: true, force: true });
      console.log(`Cleaned ${folder}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Failed to clean ${folder}:`, error);
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help') {
    showHelp();
    return;
  }

  const options = args.slice(1).reduce((opts, arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      opts[key] = value || true;
    } else {
      opts._ = opts._ || [];
      opts._.push(arg);
    }
    return opts;
  }, {});

  if (options.env) {
    process.env.NODE_ENV = options.env;
  }

  const playwrightArgs = [];
  if (options.browser) playwrightArgs.push(`--project=${options.browser}`);
  if (options.workers) playwrightArgs.push(`--workers=${options.workers}`);
  if (options.debug) playwrightArgs.push('--debug');
  if (options.tags) playwrightArgs.push('--grep', options.tags);

  switch (command) {
    case 'run':
      await runCommand('npx', ['playwright', 'test', ...playwrightArgs, ...(options._ || [])]);
      break;
    case 'run:smoke':
      await runCommand('npx', ['playwright', 'test', ...playwrightArgs, '--grep', '@smoke']);
      break;
    case 'run:regression':
      await runCommand('npx', ['playwright', 'test', ...playwrightArgs, '--grep', '@regression']);
      break;
    case 'run:api':
      await runCommand('npx', ['playwright', 'test', ...playwrightArgs, '--grep', '@api']);
      break;
    case 'run:ui':
      await runCommand('npx', ['playwright', 'test', ...playwrightArgs, '--grep', '@ui']);
      break;
    case 'init':
      await initializeProject();
      break;
    case 'xray:fetch':
      try {
        if (!xrayIntegration) {
          console.error('Xray integration module not found');
          process.exit(1);
        }
        const jql = options.jql || '';
        console.log('Fetching test cases from Xray...');
        const testCases = await xrayIntegration.getXrayTestCases(jql);
        await xrayIntegration.saveTestCasesToFile(testCases);
      } catch (error) {
        console.error('Failed to fetch test cases:', error);
        process.exit(1);
      }
      break;
    case 'xray:report':
      await runCommand('npx', ['pw-framework', 'push-to-xray']);
      break;
    case 'report':
      await runCommand('npx', ['pw-framework', 'generate-report']);
      break;
    case 'clean':
      await cleanArtifacts();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});