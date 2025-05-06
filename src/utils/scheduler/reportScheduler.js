const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { ChartGenerator, DataAnalyzer } = require('../visualization');
const { DataProvider } = require('../web');
const { PlaywrightService } = require('../common');
const ReportHistory = require('./reportHistory');
const logger = require('../common/logger');

/**
 * Report Scheduler for automating report generation
 */
class ReportScheduler {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.schedulesDir - Directory to store schedules
   * @param {string} options.reportsDir - Directory to store generated reports
   * @param {Object} options.emailConfig - Email configuration for sending reports
   */
  constructor(options = {}) {
    this.schedulesDir = options.schedulesDir || path.resolve(process.cwd(), 'data/schedules');
    this.reportsDir = options.reportsDir || path.resolve(process.cwd(), 'reports/charts/scheduled');
    this.emailConfig = options.emailConfig || null;
    this.activeJobs = new Map();
    
    // Create directories if they don't exist
    this._ensureDirectoryExists(this.schedulesDir);
    this._ensureDirectoryExists(this.reportsDir);
    
    // Initialize data provider and analyzer
    this.dataProvider = new DataProvider();
    this.dataAnalyzer = new DataAnalyzer();
    this.chartGenerator = new ChartGenerator({
      outputDir: this.reportsDir
    });
    
    // Initialize Playwright service
    this.playwrightService = new PlaywrightService({
      outputDir: path.join(this.reportsDir, 'playwright')
    });
    
    // Initialize report history
    this.reportHistory = new ReportHistory();
    
    // Load existing schedules
    this.loadSchedules();
  }
  
  /**
   * Ensure directory exists
   * @param {string} dir - Directory path
   * @private
   */
  _ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Load existing schedules
   */
  loadSchedules() {
    try {
      // Clear existing jobs
      this.activeJobs.forEach(job => job.stop());
      this.activeJobs.clear();
      
      // Get schedule files
      const scheduleFiles = fs.readdirSync(this.schedulesDir)
        .filter(file => file.endsWith('.json'));
      
      // Load each schedule
      scheduleFiles.forEach(file => {
        try {
          const filePath = path.join(this.schedulesDir, file);
          const schedule = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Schedule the job if it's active
          if (schedule.active) {
            this.scheduleReport(schedule);
          }
        } catch (error) {
          logger.error(`Failed to load schedule from file: ${file}`, error);
        }
      });
      
      logger.info(`Loaded ${this.activeJobs.size} active report schedules`);
    } catch (error) {
      logger.error('Failed to load schedules', error);
    }
  }
  
  /**
   * Schedule a report
   * @param {Object} schedule - Schedule configuration
   * @returns {string} Schedule ID
   */
  scheduleReport(schedule) {
    try {
      // Validate schedule
      if (!schedule.id) {
        schedule.id = `schedule-${Date.now()}`;
      }
      
      if (!schedule.cronExpression) {
        throw new Error('Cron expression is required');
      }
      
      if (!schedule.reportConfig) {
        throw new Error('Report configuration is required');
      }
      
      // Validate cron expression
      if (!cron.validate(schedule.cronExpression)) {
        throw new Error('Invalid cron expression');
      }
      
      // Stop existing job if it exists
      if (this.activeJobs.has(schedule.id)) {
        this.activeJobs.get(schedule.id).stop();
      }
      
      // Schedule the job
      const job = cron.schedule(schedule.cronExpression, async () => {
        try {
          await this.generateScheduledReport(schedule);
        } catch (error) {
          logger.error(`Failed to generate scheduled report: ${schedule.id}`, error);
        }
      }, {
        scheduled: true,
        timezone: schedule.timezone || 'UTC'
      });
      
      // Store the job
      this.activeJobs.set(schedule.id, job);
      
      // Save the schedule
      this.saveSchedule(schedule);
      
      logger.info(`Scheduled report: ${schedule.id} with cron: ${schedule.cronExpression}`);
      return schedule.id;
    } catch (error) {
      logger.error('Failed to schedule report', error);
      throw error;
    }
  }
  
  /**
   * Save schedule to file
   * @param {Object} schedule - Schedule configuration
   */
  saveSchedule(schedule) {
    try {
      const filePath = path.join(this.schedulesDir, `${schedule.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(schedule, null, 2));
      logger.info(`Saved schedule to file: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to save schedule: ${schedule.id}`, error);
      throw error;
    }
  }
  
  /**
   * Generate a scheduled report
   * @param {Object} schedule - Schedule configuration
   * @returns {Promise<string>} Path to the generated report
   */
  async generateScheduledReport(schedule) {
    try {
      logger.info(`Generating scheduled report: ${schedule.id}`);
      
      // Start tracing for debugging if there are issues
      let tracePath = null;
      try {
        tracePath = await this.playwrightService.captureTrace(async (page) => {
          // Load data
          let data;
          const dataConfig = schedule.reportConfig.dataSource;
          
          if (dataConfig.type === 'file') {
            // Load data from file
            if (dataConfig.fileType === 'json') {
              data = this.dataProvider.loadFromJson(dataConfig.fileName);
            } else if (dataConfig.fileType === 'csv') {
              data = this.dataProvider.loadFromCsv(dataConfig.fileName);
            } else {
              throw new Error(`Unsupported file type: ${dataConfig.fileType}`);
            }
          } else {
            throw new Error(`Unsupported data source type: ${dataConfig.type}`);
          }
          
          // Generate charts
          const charts = [];
          
          for (const chartConfig of schedule.reportConfig.charts) {
            let chartData;
            
            if (chartConfig.type === 'bar' || chartConfig.type === 'line') {
              // Prepare data for bar/line chart
              chartData = this.dataAnalyzer.prepareChartData(
                data,
                chartConfig.xAxis,
                chartConfig.yAxis,
                chartConfig.type
              );
              
              charts.push({
                type: chartConfig.type,
                title: chartConfig.title,
                config: {
                  title: chartConfig.title,
                  labels: chartData.labels,
                  datasets: chartData.datasets
                },
                dimensions: chartConfig.dimensions
              });
            } else if (chartConfig.type === 'pie') {
              // Prepare data for pie chart
              chartData = this.dataAnalyzer.prepareChartData(
                data,
                chartConfig.labels,
                chartConfig.values,
                'pie'
              );
              
              charts.push({
                type: 'pie',
                title: chartConfig.title,
                config: {
                  title: chartConfig.title,
                  labels: chartData.labels,
                  data: chartData.data,
                  backgroundColor: chartData.backgroundColor
                },
                dimensions: chartConfig.dimensions
              });
            } else if (chartConfig.type === 'table') {
              // Prepare data for table
              let tableData = data;
              
              // Apply filter if provided
              if (chartConfig.filter) {
                tableData = this.dataAnalyzer.filter(
                  data,
                  new Function('item', `return ${chartConfig.filter}`)
                );
              }
              
              // Limit rows if needed
              if (chartConfig.limit && chartConfig.limit > 0) {
                tableData = tableData.slice(0, chartConfig.limit);
              }
              
              charts.push({
                type: 'table',
                title: chartConfig.title,
                data: tableData,
                options: {
                  title: chartConfig.title,
                  columns: chartConfig.columns
                },
                dimensions: chartConfig.dimensions
              });
            }
          }
          
          // Generate timestamp for report name
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const reportName = `${schedule.id}-${timestamp}`;
          
          // Generate report
          const reportPath = await this.chartGenerator.generateReport(
            charts,
            reportName
          );
          
          // Test report accessibility
          try {
            await this.chartGenerator.testReportAccessibility(reportPath);
          } catch (accessibilityError) {
            logger.warn(`Accessibility test failed for report: ${reportPath}`, accessibilityError);
          }
          
          // Test report responsiveness
          try {
            await this.chartGenerator.testReportResponsiveness(reportPath);
          } catch (responsivenessError) {
            logger.warn(`Responsiveness test failed for report: ${reportPath}`, responsivenessError);
          }
          
          return reportPath;
        }, {
          path: path.join(this.reportsDir, 'traces', `${schedule.id}-${Date.now()}.zip`),
          screenshots: true,
          snapshots: true
        });
      } catch (traceError) {
        logger.error('Failed to capture trace during report generation', traceError);
      }
      
      // Generate timestamp for report name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportName = `${schedule.id}-${timestamp}`;
      
      // Generate report
      const reportPath = await this.chartGenerator.generateReport(
        schedule.reportConfig.charts.map(chartConfig => {
          return {
            type: chartConfig.type,
            title: chartConfig.title,
            config: chartConfig,
            data: [], // This would be populated with actual data
            options: {
              title: chartConfig.title,
              columns: chartConfig.columns
            },
            dimensions: chartConfig.dimensions
          };
        }),
        reportName
      );
      
      logger.info(`Generated scheduled report: ${reportPath}`);
      
      // Add to report history
      try {
        const relativePath = path.relative(
          path.join(process.cwd(), 'reports/charts'),
          reportPath
        );
        
        this.reportHistory.addReport({
          title: schedule.reportConfig.title,
          path: path.dirname(relativePath),
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          tags: ['scheduled']
        });
        
        logger.info('Added report to history');
      } catch (historyError) {
        logger.error('Failed to add report to history', historyError);
      }
      
      // Send email if configured
      if (schedule.recipients && schedule.recipients.length > 0) {
        await this.sendReportEmail(reportPath, schedule);
      }
      
      return reportPath;
    } catch (error) {
      logger.error(`Failed to generate scheduled report: ${schedule.id}`, error);
      throw error;
    }
  }
  
  /**
   * Send report email
   * @param {string} reportPath - Path to the generated report
   * @param {Object} schedule - Schedule configuration
   * @returns {Promise<void>}
   */
  async sendReportEmail(reportPath, schedule) {
    try {
      if (!this.emailConfig) {
        logger.warn('Email configuration not provided, skipping email notification');
        return;
      }
      
      if (!schedule.recipients || schedule.recipients.length === 0) {
        logger.warn('No recipients specified, skipping email notification');
        return;
      }
      
      logger.info(`Sending report email to ${schedule.recipients.join(', ')}`);
      
      // Create transporter
      const transporter = nodemailer.createTransport(this.emailConfig);
      
      // Get report URL
      const reportUrl = schedule.baseUrl 
        ? `${schedule.baseUrl}/charts/${path.basename(path.dirname(reportPath))}`
        : `file://${reportPath}`;
      
      // Generate PDF version of the report
      let pdfPath = null;
      try {
        pdfPath = await this.playwrightService.generatePdf(`file://${path.join(reportPath, 'index.html')}`, {
          path: path.join(reportPath, `${path.basename(reportPath)}.pdf`),
          format: 'A4',
          margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: `<div style="font-size: 10px; text-align: center; width: 100%;">${schedule.reportConfig.title}</div>`,
          footerTemplate: `<div style="font-size: 8px; text-align: center; width: 100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`
        });
      } catch (pdfError) {
        logger.error('Failed to generate PDF for email', pdfError);
      }
      
      // Prepare attachments
      const attachments = [];
      if (pdfPath) {
        attachments.push({
          filename: `${schedule.reportConfig.title}.pdf`,
          path: pdfPath
        });
      }
      
      // Send email
      const info = await transporter.sendMail({
        from: this.emailConfig.auth.user,
        to: schedule.recipients.join(', '),
        subject: `Scheduled Report: ${schedule.name || schedule.id}`,
        html: `
          <h2>Scheduled Report: ${schedule.name || schedule.id}</h2>
          <p>Your scheduled report has been generated.</p>
          <p><a href="${reportUrl}">View Report</a></p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <hr>
          <p><small>This is an automated message from the Playwright Framework Dashboard.</small></p>
        `,
        attachments
      });
      
      logger.info(`Report email sent: ${info.messageId}`);
    } catch (error) {
      logger.error('Failed to send report email', error);
    }
  }
  
  /**
   * Get all schedules
   * @returns {Array<Object>} List of schedules
   */
  getAllSchedules() {
    try {
      const scheduleFiles = fs.readdirSync(this.schedulesDir)
        .filter(file => file.endsWith('.json'));
      
      return scheduleFiles.map(file => {
        const filePath = path.join(this.schedulesDir, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      });
    } catch (error) {
      logger.error('Failed to get schedules', error);
      return [];
    }
  }
  
  /**
   * Get a schedule by ID
   * @param {string} id - Schedule ID
   * @returns {Object|null} Schedule configuration
   */
  getSchedule(id) {
    try {
      const filePath = path.join(this.schedulesDir, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      logger.error(`Failed to get schedule: ${id}`, error);
      return null;
    }
  }
  
  /**
   * Update a schedule
   * @param {string} id - Schedule ID
   * @param {Object} updates - Schedule updates
   * @returns {Object} Updated schedule
   */
  updateSchedule(id, updates) {
    try {
      const schedule = this.getSchedule(id);
      
      if (!schedule) {
        throw new Error(`Schedule not found: ${id}`);
      }
      
      // Update schedule
      const updatedSchedule = { ...schedule, ...updates };
      
      // Reschedule if cron expression or active status changed
      if (updates.cronExpression !== undefined || updates.active !== undefined) {
        // Stop existing job
        if (this.activeJobs.has(id)) {
          this.activeJobs.get(id).stop();
          this.activeJobs.delete(id);
        }
        
        // Schedule new job if active
        if (updatedSchedule.active) {
          this.scheduleReport(updatedSchedule);
        }
      }
      
      // Save updated schedule
      this.saveSchedule(updatedSchedule);
      
      return updatedSchedule;
    } catch (error) {
      logger.error(`Failed to update schedule: ${id}`, error);
      throw error;
    }
  }
  
  /**
   * Delete a schedule
   * @param {string} id - Schedule ID
   * @returns {boolean} Success
   */
  deleteSchedule(id) {
    try {
      const filePath = path.join(this.schedulesDir, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      // Stop job if active
      if (this.activeJobs.has(id)) {
        this.activeJobs.get(id).stop();
        this.activeJobs.delete(id);
      }
      
      // Delete file
      fs.unlinkSync(filePath);
      
      logger.info(`Deleted schedule: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete schedule: ${id}`, error);
      return false;
    }
  }
  
  /**
   * Run a schedule immediately
   * @param {string} id - Schedule ID
   * @returns {Promise<string>} Path to the generated report
   */
  async runScheduleNow(id) {
    try {
      const schedule = this.getSchedule(id);
      
      if (!schedule) {
        throw new Error(`Schedule not found: ${id}`);
      }
      
      const reportPath = await this.generateScheduledReport(schedule);
      
      // Add manual-run tag to the report in history
      try {
        const reports = this.reportHistory.getReports({
          scheduleId: id,
          limit: 1
        }).reports;
        
        if (reports.length > 0) {
          this.reportHistory.addTags(reports[0].id, ['manual-run']);
          logger.info('Added manual-run tag to report');
        }
      } catch (historyError) {
        logger.error('Failed to add manual-run tag to report', historyError);
      }
      
      return reportPath;
    } catch (error) {
      logger.error(`Failed to run schedule now: ${id}`, error);
      throw error;
    }
  }
  
  /**
   * Set email configuration
   * @param {Object} config - Email configuration
   */
  setEmailConfig(config) {
    this.emailConfig = config;
  }
  
  /**
   * Stop all scheduled jobs
   */
  stopAllJobs() {
    this.activeJobs.forEach(job => job.stop());
    this.activeJobs.clear();
    logger.info('Stopped all scheduled jobs');
  }
}

module.exports = ReportScheduler;