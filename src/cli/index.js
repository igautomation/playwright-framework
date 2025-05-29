#!/usr/bin/env node

/**
 * Command Line Interface for Playwright Framework
 * Provides commands for running tests, generating reports, and other utilities
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Set up the CLI program
program
  .name('playwright-framework')
  .description('CLI for Playwright Testing Framework')
  .version('1.0.0');

// Run tests command
program
  .command('run')
  .description('Run tests with specified options')
  .option('-p, --project <project>', 'Project to run tests on', 'chromium')
  .option('-t, --test <pattern>', 'Test pattern to match')
  .option('-h, --headed', 'Run in headed mode')
  .option('-d, --debug', 'Run in debug mode')
  .option('-r, --reporter <reporter>', 'Reporter to use', 'html')
  .action((options) => {
    let command = 'npx playwright test';
    
    if (options.test) {
      command += ` "${options.test}"`;
    }
    
    command += ` --project=${options.project}`;
    
    if (options.headed) {
      command += ' --headed';
    }
    
    if (options.debug) {
      command += ' --debug';
    }
    
    command += ` --reporter=${options.reporter}`;
    
    console.log(`Running command: ${command}`);
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      process.exit(error.status);
    }
  });

// Generate page object command
program
  .command('generate:page')
  .description('Generate a page object')
  .argument('<name>', 'Name of the page object')
  .option('-o, --output <dir>', 'Output directory', './src/pages')
  .action((name, options) => {
    const outputDir = options.output;
    const fileName = `${name}Page.js`;
    const filePath = path.join(outputDir, fileName);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create page object template
    const template = `/**
 * ${name} Page Object
 */
class ${name}Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Define selectors
    this.selectors = {
      // Add your selectors here
    };
  }
  
  /**
   * Navigate to this page
   */
  async navigate() {
    await this.page.goto(process.env.BASE_URL);
  }
  
  // Add your page methods here
}

module.exports = ${name}Page;
`;
    
    fs.writeFileSync(filePath, template);
    console.log(`✅ Generated page object: ${filePath}`);
  });

// Salesforce commands
program
  .command('salesforce:auth')
  .description('Authenticate with Salesforce')
  .action(() => {
    try {
      execSync('node src/tests/salesforce/global-setup.js', { stdio: 'inherit' });
      console.log('✅ Salesforce authentication completed');
    } catch (error) {
      console.error('❌ Salesforce authentication failed');
      process.exit(1);
    }
  });

// Report command
program
  .command('report')
  .description('Show test report')
  .option('-p, --port <port>', 'Port to serve the report on', '9323')
  .action((options) => {
    try {
      execSync(`npx playwright show-report --port=${options.port}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to show report');
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}