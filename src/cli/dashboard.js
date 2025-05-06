#!/usr/bin/env node

const { program } = require('commander');
const { startServer } = require('../dashboard/server');
const { ReportScheduler } = require('../utils/scheduler');
const logger = require('../utils/common/logger');

// Configure CLI
program
  .name('dashboard')
  .description('Start the data visualization dashboard')
  .version('1.0.0')
  .option('-p, --port <number>', 'Port to run the dashboard on', '3000')
  .option('-o, --open', 'Open dashboard in browser', false)
  .option('-e, --email <config>', 'Email configuration for scheduled reports (JSON string)')
  .action((options) => {
    // Set port in environment variable
    process.env.PORT = options.port;
    
    // Configure email for scheduled reports if provided
    if (options.email) {
      try {
        const emailConfig = JSON.parse(options.email);
        const scheduler = new ReportScheduler();
        scheduler.setEmailConfig(emailConfig);
        logger.info('Email configuration set for scheduled reports');
      } catch (error) {
        logger.error('Invalid email configuration', error);
      }
    }
    
    // Start server
    startServer();
    
    // Open browser if requested
    if (options.open) {
      const open = require('open');
      open(`http://localhost:${options.port}`);
    }
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}