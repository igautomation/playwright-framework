#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { ReportScheduler } = require('../utils/scheduler');
const logger = require('../utils/common/logger');

// Initialize report scheduler
const scheduler = new ReportScheduler();

// Configure CLI
program
  .name('schedule')
  .description('CLI tool for managing scheduled reports')
  .version('1.0.0');

// List schedules
program
  .command('list')
  .description('List all schedules')
  .option('-a, --active-only', 'Show only active schedules')
  .action((options) => {
    try {
      const schedules = scheduler.getAllSchedules();
      
      if (schedules.length === 0) {
        console.log('No schedules found');
        return;
      }
      
      const filteredSchedules = options.activeOnly
        ? schedules.filter(s => s.active)
        : schedules;
      
      console.log(`Found ${filteredSchedules.length} schedules:`);
      
      filteredSchedules.forEach(schedule => {
        console.log(`\n[${schedule.id}] ${schedule.name}`);
        console.log(`  Status: ${schedule.active ? 'Active' : 'Inactive'}`);
        console.log(`  Schedule: ${schedule.cronExpression} (${schedule.timezone || 'UTC'})`);
        console.log(`  Report: ${schedule.reportConfig.title}`);
        if (schedule.recipients && schedule.recipients.length > 0) {
          console.log(`  Recipients: ${schedule.recipients.join(', ')}`);
        }
      });
    } catch (error) {
      logger.error('Failed to list schedules', error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Create schedule
program
  .command('create')
  .description('Create a new schedule')
  .requiredOption('-c, --config <file>', 'Schedule configuration file (JSON)')
  .action(async (options) => {
    try {
      // Load configuration file
      const configPath = path.resolve(process.cwd(), options.config);
      
      if (!fs.existsSync(configPath)) {
        console.error(`Configuration file not found: ${configPath}`);
        process.exit(1);
      }
      
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Create schedule
      const id = scheduler.scheduleReport(config);
      
      console.log(`Schedule created with ID: ${id}`);
    } catch (error) {
      logger.error('Failed to create schedule', error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Update schedule
program
  .command('update')
  .description('Update an existing schedule')
  .requiredOption('-i, --id <id>', 'Schedule ID')
  .requiredOption('-c, --config <file>', 'Schedule configuration file (JSON)')
  .action(async (options) => {
    try {
      // Load configuration file
      const configPath = path.resolve(process.cwd(), options.config);
      
      if (!fs.existsSync(configPath)) {
        console.error(`Configuration file not found: ${configPath}`);
        process.exit(1);
      }
      
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Update schedule
      const schedule = scheduler.updateSchedule(options.id, config);
      
      console.log(`Schedule updated: ${schedule.id}`);
    } catch (error) {
      logger.error(`Failed to update schedule: ${options.id}`, error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Delete schedule
program
  .command('delete')
  .description('Delete a schedule')
  .requiredOption('-i, --id <id>', 'Schedule ID')
  .action(async (options) => {
    try {
      const success = scheduler.deleteSchedule(options.id);
      
      if (success) {
        console.log(`Schedule deleted: ${options.id}`);
      } else {
        console.error(`Schedule not found: ${options.id}`);
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Failed to delete schedule: ${options.id}`, error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Run schedule
program
  .command('run')
  .description('Run a schedule immediately')
  .requiredOption('-i, --id <id>', 'Schedule ID')
  .action(async (options) => {
    try {
      console.log(`Running schedule: ${options.id}`);
      const reportPath = await scheduler.runScheduleNow(options.id);
      console.log(`Report generated: ${reportPath}`);
    } catch (error) {
      logger.error(`Failed to run schedule: ${options.id}`, error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Set email configuration
program
  .command('set-email')
  .description('Set email configuration for notifications')
  .requiredOption('-c, --config <json>', 'Email configuration (JSON string)')
  .action((options) => {
    try {
      const config = JSON.parse(options.config);
      scheduler.setEmailConfig(config);
      console.log('Email configuration set successfully');
    } catch (error) {
      logger.error('Failed to set email configuration', error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}