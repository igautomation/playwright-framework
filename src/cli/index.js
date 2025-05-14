#!/usr/bin/env node

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
  .option('-l, --list', 'List all tests without running them')
  .action(require('./commands/run'));

program
  .command('list-tags')
  .description('List all available tags')
  .action(() => {
    console.log('Listing tags...');
    // Implementation for listing tags
  });

program
  .command('list-tests')
  .description('List all available tests without running them')
  .option('-p, --project <project>', 'List tests for specific project')
  .option('-t, --tags <tags>', 'Filter tests by tags')
  .action(require('./commands/list-tests'));

program
  .command('self-test')
  .description('Run framework self-test')
  .action(require('./commands/self-test'));

// Test verification commands
program
  .command('verify-tests')
  .description('Verify test files for best practices')
  .option('-d, --dir <directory>', 'Test directory to verify')
  .option('-p, --pattern <pattern>', 'File pattern to match')
  .option('--ignore-errors', 'Continue even if errors are found')
  .option('--generate-report', 'Generate HTML report')
  .option('-v, --verbose', 'Show verbose output')
  .action(require('./commands/verify-tests'));

program
  .command('verify-all-tests')
  .description('Run comprehensive verification of all tests')
  .option('-v, --verbose', 'Show verbose output')
  .option('--generate-report', 'Generate HTML report')
  .option('--ignore-errors', 'Continue even if errors are found')
  .action(require('./commands/verify-all-tests'));

program
  .command('test-lint')
  .description('Lint test files for common issues')
  .option('-d, --dir <directory>', 'Test directory to lint')
  .option('-p, --pattern <pattern>', 'File pattern to match')
  .option('--fix', 'Automatically fix issues when possible')
  .option('--ignore-errors', 'Continue even if errors are found')
  .action(require('./commands/test-lint'));

program
  .command('test-report')
  .description('Generate test reports')
  .option('-o, --output-dir <directory>', 'Output directory for reports')
  .option('-t, --types <types>', 'Report types to generate (comma-separated)', (val) => val.split(','))
  .option('-r, --results-dir <directory>', 'Test results directory')
  .option('--open', 'Open reports after generation')
  .option('-v, --verbose', 'Show verbose output')
  .action(require('./commands/test-report'));

// Test coverage command
program
  .command('test-coverage-analyze')
  .description('Analyze test coverage without instrumentation')
  .option('--test-dir <directory>', 'Test directory')
  .option('--source-dir <directory>', 'Source directory to analyze')
  .option('-o, --output-dir <directory>', 'Output directory for coverage reports')
  .option('-t, --threshold <percentage>', 'Coverage threshold percentage', parseInt)
  .option('--exclude <patterns>', 'Comma-separated patterns to exclude')
  .option('--ignore-threshold', 'Continue even if coverage is below threshold')
  .option('--open', 'Open coverage report after generation')
  .option('--ignore-errors', 'Continue even if errors are found')
  .action(require('./commands/test-coverage-analyze'));

// CI/CD integration commands
program
  .command('ci-setup')
  .description('Set up CI/CD integration')
  .option('-s, --system <system>', 'CI system (github, jenkins, gitlab)')
  .option('-n, --name <name>', 'Workflow/pipeline name')
  .option('-b, --branches <branches>', 'Comma-separated list of branches to trigger on')
  .option('--node-version <version>', 'Node.js version')
  .option('--test-command <command>', 'Test command')
  .option('--report-command <command>', 'Report command')
  .option('--ignore-errors', 'Continue even if errors are found')
  .action(require('./commands/ci-setup'));

// Dashboard command
program
  .command('test-dashboard')
  .description('Generate test quality dashboard')
  .option('-d, --data-dir <directory>', 'Dashboard data directory')
  .option('-o, --output <path>', 'Output file path')
  .option('--add-run', 'Add current test run to dashboard')
  .option('-r, --results-dir <directory>', 'Test results directory')
  .option('--run-id <id>', 'Run ID')
  .option('--history-size <size>', 'Number of runs to keep in history')
  .option('--open', 'Open dashboard after generation')
  .option('--ignore-errors', 'Continue even if errors are found')
  .action(require('./commands/test-dashboard'));

// Parse command line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}