#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { ReportHistory } = require('../utils/scheduler');
const logger = require('../utils/common/logger');

// Initialize report history
const history = new ReportHistory();

// Configure CLI
program
  .name('history')
  .description('CLI tool for managing report history')
  .version('1.0.0');

// List reports
program
  .command('list')
  .description('List reports in history')
  .option('-s, --search <term>', 'Search term for title or schedule name')
  .option('-i, --schedule <id>', 'Filter by schedule ID')
  .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
  .option('-f, --from <date>', 'Start date (YYYY-MM-DD)')
  .option('-u, --until <date>', 'End date (YYYY-MM-DD)')
  .option('-l, --limit <number>', 'Maximum number of reports to show', '20')
  .option('-o, --offset <number>', 'Offset for pagination', '0')
  .action(async (options) => {
    try {
      // Parse tags if provided
      const tags = options.tags ? options.tags.split(',') : undefined;
      
      const result = history.getReports({
        search: options.search,
        scheduleId: options.schedule,
        tags,
        startDate: options.from,
        endDate: options.until,
        limit: parseInt(options.limit, 10),
        offset: parseInt(options.offset, 10)
      });
      
      if (result.reports.length === 0) {
        console.log('No reports found');
        return;
      }
      
      console.log(`Found ${result.total} reports (showing ${result.reports.length}):`);
      
      result.reports.forEach(report => {
        const date = new Date(report.timestamp).toLocaleString();
        console.log(`\n[${report.id}] ${report.title}`);
        console.log(`  Schedule: ${report.scheduleName || 'N/A'}`);
        console.log(`  Date: ${date}`);
        console.log(`  Path: ${report.path}`);
        if (report.tags && report.tags.length > 0) {
          console.log(`  Tags: ${report.tags.join(', ')}`);
        }
      });
      
      if (result.total > result.reports.length) {
        console.log(`\nShowing ${result.reports.length} of ${result.total} reports`);
        console.log(`Use --limit and --offset to see more reports`);
      }
    } catch (error) {
      logger.error('Failed to list reports', error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Show report details
program
  .command('show')
  .description('Show report details')
  .requiredOption('-i, --id <id>', 'Report ID')
  .action(async (options) => {
    try {
      const report = history.getReport(options.id);
      
      if (!report) {
        console.error(`Report not found: ${options.id}`);
        process.exit(1);
      }
      
      const date = new Date(report.timestamp).toLocaleString();
      
      console.log(`Report: ${report.title}`);
      console.log(`ID: ${report.id}`);
      console.log(`Schedule: ${report.scheduleName || 'N/A'}`);
      console.log(`Schedule ID: ${report.scheduleId || 'N/A'}`);
      console.log(`Date: ${date}`);
      console.log(`Path: ${report.path}`);
      console.log(`Tags: ${report.tags && report.tags.length > 0 ? report.tags.join(', ') : 'None'}`);
      console.log(`\nView report: file://${path.join(process.cwd(), 'reports/charts', report.path)}`);
    } catch (error) {
      logger.error(`Failed to show report: ${options.id}`, error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Add tags
program
  .command('tag')
  .description('Add tags to a report')
  .requiredOption('-i, --id <id>', 'Report ID')
  .requiredOption('-t, --tags <tags>', 'Tags to add (comma-separated)')
  .action(async (options) => {
    try {
      const tags = options.tags.split(',').map(tag => tag.trim());
      
      const success = history.addTags(options.id, tags);
      
      if (!success) {
        console.error(`Report not found: ${options.id}`);
        process.exit(1);
      }
      
      console.log(`Added tags to report ${options.id}: ${tags.join(', ')}`);
    } catch (error) {
      logger.error(`Failed to add tags to report: ${options.id}`, error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Remove tags
program
  .command('untag')
  .description('Remove tags from a report')
  .requiredOption('-i, --id <id>', 'Report ID')
  .requiredOption('-t, --tags <tags>', 'Tags to remove (comma-separated)')
  .action(async (options) => {
    try {
      const tags = options.tags.split(',').map(tag => tag.trim());
      
      const success = history.removeTags(options.id, tags);
      
      if (!success) {
        console.error(`Report not found: ${options.id}`);
        process.exit(1);
      }
      
      console.log(`Removed tags from report ${options.id}: ${tags.join(', ')}`);
    } catch (error) {
      logger.error(`Failed to remove tags from report: ${options.id}`, error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Delete report
program
  .command('delete')
  .description('Delete a report from history')
  .requiredOption('-i, --id <id>', 'Report ID')
  .option('-f, --file', 'Also delete the report file', false)
  .action(async (options) => {
    try {
      const success = history.deleteReport(options.id, options.file);
      
      if (!success) {
        console.error(`Report not found: ${options.id}`);
        process.exit(1);
      }
      
      console.log(`Deleted report: ${options.id}`);
      if (options.file) {
        console.log('Also deleted report file');
      }
    } catch (error) {
      logger.error(`Failed to delete report: ${options.id}`, error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Clean up old reports
program
  .command('cleanup')
  .description('Clean up old reports')
  .requiredOption('-d, --days <days>', 'Delete reports older than this many days')
  .option('-f, --files', 'Also delete report files', false)
  .action(async (options) => {
    try {
      const days = parseInt(options.days, 10);
      
      if (isNaN(days) || days <= 0) {
        console.error('Days must be a positive number');
        process.exit(1);
      }
      
      const deletedCount = history.cleanupOldReports(days);
      
      console.log(`Deleted ${deletedCount} old reports`);
    } catch (error) {
      logger.error('Failed to clean up old reports', error);
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Get statistics
program
  .command('stats')
  .description('Show report statistics')
  .action(async () => {
    try {
      const stats = history.getStatistics();
      
      console.log(`Total reports: ${stats.totalReports}`);
      
      if (stats.totalReports > 0) {
        console.log(`\nOldest report: ${new Date(stats.oldestReport).toLocaleString()}`);
        console.log(`Newest report: ${new Date(stats.newestReport).toLocaleString()}`);
        
        console.log('\nReports by schedule:');
        Object.entries(stats.scheduleStats).forEach(([id, data]) => {
          console.log(`  ${data.name}: ${data.count}`);
        });
        
        console.log('\nReports by month:');
        Object.entries(stats.monthStats).forEach(([month, count]) => {
          console.log(`  ${month}: ${count}`);
        });
      }
    } catch (error) {
      logger.error('Failed to get statistics', error);
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