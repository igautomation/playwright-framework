#!/usr/bin/env node
/**
 * CLI utility for Salesforce Playwright framework
 */
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getXrayTestCases, saveTestCasesToFile } from './utils/xray-integration.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Run command and stream output
 * @param {string} command - Command to run
 * @param {Array<string>} args - Command arguments
 * @returns {Promise<number>} Exit code
 */
function runCommand(command, args) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    proc.on('close', (code) => resolve(code));
  });
}

/**
 * Print help message
 */
function showHelp() {
  console.log(`
Salesforce Playwright Test Framework CLI

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

Options:
  --browser=<name>        Specify browser (chromium, firefox, webkit)
  --env=<name>            Specify environment (development, qa, uat, production)
  --workers=<number>      Number of parallel workers
  --debug                 Run in debug mode
  --help                  Show this help
  `);
}

/**
 * Create folder structure
 */
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
    const folderPath = path.join(__dirname, folder);
    await fs.mkdir(folderPath, { recursive: true });
    console.log(`✅ Created ${folder}`);
  }
  
  console.log('🎉 Project structure initialized!');
}

/**
 * Clean reports and artifacts
 */
async function cleanArtifacts() {
  const folders = ['reports', 'playwright-report', 'test-results', 'allure-results', 'allure-report'];
  
  for (const folder of folders) {
    try {
      const folderPath = path.join(__dirname, folder);
      await fs.rm(folderPath, { recursive: true, force: true });
      console.log(`✅ Cleaned ${folder}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Failed to clean ${folder}:`, error);
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === '--help') {
    showHelp();
    return;
  }
  
  // Parse options
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
  
  // Set environment variable
  if (options.env) {
    process.env.NODE_ENV = options.env;
  }
  
  // Prepare playwright options
  const playwrightArgs = [];
  if (options.browser) playwrightArgs.push(`--project=${options.browser}`);
  if (options.workers) playwrightArgs.push(`--workers=${options.workers}`);
  if (options.debug) playwrightArgs.push('--debug');
  
  switch (command) {
    case 'run':
      if (options._ && options._[0]) {
        await runCommand('npx', ['playwright', 'test', ...playwrightArgs, options._[0]]);
      } else {
        await runCommand('npx', ['playwright', 'test', ...playwrightArgs]);
      }
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
        const jql = options.jql || '';
        console.log('Fetching test cases from Xray...');
        const testCases = await getXrayTestCases(jql);
        await saveTestCasesToFile(testCases);
      } catch (error) {
        console.error('Failed to fetch test cases:', error);
        process.exit(1);
      }
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

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});