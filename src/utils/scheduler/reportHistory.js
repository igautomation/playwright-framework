const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

/**
 * Report History Manager for tracking and managing historical reports
 */
class ReportHistory {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.historyDir - Directory to store history records
   * @param {string} options.reportsDir - Directory where reports are stored
   * @param {number} options.maxHistoryAge - Maximum age of history records in days (0 = no limit)
   */
  constructor(options = {}) {
    this.historyDir = options.historyDir || path.resolve(process.cwd(), 'data/history');
    this.reportsDir = options.reportsDir || path.resolve(process.cwd(), 'reports/charts');
    this.maxHistoryAge = options.maxHistoryAge || 0;
    
    // Create history directory if it doesn't exist
    this._ensureDirectoryExists(this.historyDir);
    
    // Initialize history index
    this.historyIndex = this._loadHistoryIndex();
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
   * Load history index
   * @returns {Object} History index
   * @private
   */
  _loadHistoryIndex() {
    try {
      const indexPath = path.join(this.historyDir, 'index.json');
      
      if (!fs.existsSync(indexPath)) {
        return { reports: [] };
      }
      
      return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (error) {
      logger.error('Failed to load history index', error);
      return { reports: [] };
    }
  }
  
  /**
   * Save history index
   * @private
   */
  _saveHistoryIndex() {
    try {
      const indexPath = path.join(this.historyDir, 'index.json');
      fs.writeFileSync(indexPath, JSON.stringify(this.historyIndex, null, 2));
    } catch (error) {
      logger.error('Failed to save history index', error);
    }
  }
  
  /**
   * Add a report to history
   * @param {Object} report - Report information
   * @param {string} report.id - Report ID
   * @param {string} report.title - Report title
   * @param {string} report.path - Path to the report
   * @param {string} report.scheduleId - ID of the schedule that generated the report
   * @param {string} report.scheduleName - Name of the schedule that generated the report
   * @returns {string} Report ID
   */
  addReport(report) {
    try {
      // Generate ID if not provided
      if (!report.id) {
        report.id = `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }
      
      // Add timestamp if not provided
      if (!report.timestamp) {
        report.timestamp = new Date().toISOString();
      }
      
      // Add report to index
      this.historyIndex.reports.push({
        id: report.id,
        title: report.title,
        path: report.path,
        scheduleId: report.scheduleId,
        scheduleName: report.scheduleName,
        timestamp: report.timestamp,
        tags: report.tags || []
      });
      
      // Sort reports by timestamp (newest first)
      this.historyIndex.reports.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      // Save index
      this._saveHistoryIndex();
      
      // Clean up old reports if maxHistoryAge is set
      if (this.maxHistoryAge > 0) {
        this.cleanupOldReports();
      }
      
      logger.info(`Added report to history: ${report.id}`);
      return report.id;
    } catch (error) {
      logger.error('Failed to add report to history', error);
      throw error;
    }
  }
  
  /**
   * Get all reports
   * @param {Object} options - Filter options
   * @param {string} options.scheduleId - Filter by schedule ID
   * @param {string} options.search - Search term for title
   * @param {string} options.startDate - Start date (ISO string)
   * @param {string} options.endDate - End date (ISO string)
   * @param {Array<string>} options.tags - Filter by tags
   * @param {number} options.limit - Maximum number of reports to return
   * @param {number} options.offset - Offset for pagination
   * @returns {Array<Object>} Reports
   */
  getReports(options = {}) {
    try {
      let reports = [...this.historyIndex.reports];
      
      // Apply filters
      if (options.scheduleId) {
        reports = reports.filter(report => report.scheduleId === options.scheduleId);
      }
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        reports = reports.filter(report => 
          report.title.toLowerCase().includes(searchTerm) ||
          report.scheduleName.toLowerCase().includes(searchTerm)
        );
      }
      
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        reports = reports.filter(report => 
          new Date(report.timestamp) >= startDate
        );
      }
      
      if (options.endDate) {
        const endDate = new Date(options.endDate);
        reports = reports.filter(report => 
          new Date(report.timestamp) <= endDate
        );
      }
      
      if (options.tags && options.tags.length > 0) {
        reports = reports.filter(report => 
          options.tags.some(tag => report.tags.includes(tag))
        );
      }
      
      // Apply pagination
      const total = reports.length;
      
      if (options.offset) {
        reports = reports.slice(options.offset);
      }
      
      if (options.limit) {
        reports = reports.slice(0, options.limit);
      }
      
      return {
        reports,
        total,
        offset: options.offset || 0,
        limit: options.limit || total
      };
    } catch (error) {
      logger.error('Failed to get reports', error);
      return { reports: [], total: 0, offset: 0, limit: 0 };
    }
  }
  
  /**
   * Get a report by ID
   * @param {string} id - Report ID
   * @returns {Object|null} Report
   */
  getReport(id) {
    try {
      const report = this.historyIndex.reports.find(report => report.id === id);
      
      if (!report) {
        return null;
      }
      
      return report;
    } catch (error) {
      logger.error(`Failed to get report: ${id}`, error);
      return null;
    }
  }
  
  /**
   * Delete a report
   * @param {string} id - Report ID
   * @param {boolean} deleteFile - Whether to delete the report file
   * @returns {boolean} Success
   */
  deleteReport(id, deleteFile = false) {
    try {
      const reportIndex = this.historyIndex.reports.findIndex(report => report.id === id);
      
      if (reportIndex === -1) {
        return false;
      }
      
      const report = this.historyIndex.reports[reportIndex];
      
      // Delete report file if requested
      if (deleteFile && report.path) {
        const reportPath = path.join(this.reportsDir, report.path);
        
        if (fs.existsSync(reportPath)) {
          // If it's a directory, delete recursively
          if (fs.statSync(reportPath).isDirectory()) {
            fs.rmSync(reportPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(reportPath);
          }
        }
      }
      
      // Remove from index
      this.historyIndex.reports.splice(reportIndex, 1);
      
      // Save index
      this._saveHistoryIndex();
      
      logger.info(`Deleted report from history: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete report: ${id}`, error);
      return false;
    }
  }
  
  /**
   * Add tags to a report
   * @param {string} id - Report ID
   * @param {Array<string>} tags - Tags to add
   * @returns {boolean} Success
   */
  addTags(id, tags) {
    try {
      const report = this.historyIndex.reports.find(report => report.id === id);
      
      if (!report) {
        return false;
      }
      
      // Add tags
      report.tags = [...new Set([...(report.tags || []), ...tags])];
      
      // Save index
      this._saveHistoryIndex();
      
      logger.info(`Added tags to report ${id}: ${tags.join(', ')}`);
      return true;
    } catch (error) {
      logger.error(`Failed to add tags to report: ${id}`, error);
      return false;
    }
  }
  
  /**
   * Remove tags from a report
   * @param {string} id - Report ID
   * @param {Array<string>} tags - Tags to remove
   * @returns {boolean} Success
   */
  removeTags(id, tags) {
    try {
      const report = this.historyIndex.reports.find(report => report.id === id);
      
      if (!report) {
        return false;
      }
      
      // Remove tags
      report.tags = (report.tags || []).filter(tag => !tags.includes(tag));
      
      // Save index
      this._saveHistoryIndex();
      
      logger.info(`Removed tags from report ${id}: ${tags.join(', ')}`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove tags from report: ${id}`, error);
      return false;
    }
  }
  
  /**
   * Get all tags
   * @returns {Array<string>} Tags
   */
  getAllTags() {
    try {
      const tags = new Set();
      
      this.historyIndex.reports.forEach(report => {
        if (report.tags) {
          report.tags.forEach(tag => tags.add(tag));
        }
      });
      
      return Array.from(tags);
    } catch (error) {
      logger.error('Failed to get all tags', error);
      return [];
    }
  }
  
  /**
   * Clean up old reports
   * @param {number} maxAgeDays - Maximum age in days (overrides constructor setting)
   * @returns {number} Number of reports deleted
   */
  cleanupOldReports(maxAgeDays) {
    try {
      const maxAge = maxAgeDays || this.maxHistoryAge;
      
      if (maxAge <= 0) {
        return 0;
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);
      
      const oldReports = this.historyIndex.reports.filter(report => 
        new Date(report.timestamp) < cutoffDate
      );
      
      let deletedCount = 0;
      
      oldReports.forEach(report => {
        if (this.deleteReport(report.id, true)) {
          deletedCount++;
        }
      });
      
      logger.info(`Cleaned up ${deletedCount} old reports`);
      return deletedCount;
    } catch (error) {
      logger.error('Failed to clean up old reports', error);
      return 0;
    }
  }
  
  /**
   * Get report statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    try {
      const reports = this.historyIndex.reports;
      
      // Count reports by schedule
      const scheduleStats = {};
      reports.forEach(report => {
        const scheduleId = report.scheduleId || 'unknown';
        scheduleStats[scheduleId] = scheduleStats[scheduleId] || {
          count: 0,
          name: report.scheduleName || 'Unknown'
        };
        scheduleStats[scheduleId].count++;
      });
      
      // Count reports by month
      const monthStats = {};
      reports.forEach(report => {
        const date = new Date(report.timestamp);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthStats[month] = monthStats[month] || 0;
        monthStats[month]++;
      });
      
      return {
        totalReports: reports.length,
        scheduleStats,
        monthStats,
        oldestReport: reports.length > 0 ? reports[reports.length - 1].timestamp : null,
        newestReport: reports.length > 0 ? reports[0].timestamp : null
      };
    } catch (error) {
      logger.error('Failed to get report statistics', error);
      return {
        totalReports: 0,
        scheduleStats: {},
        monthStats: {},
        oldestReport: null,
        newestReport: null
      };
    }
  }
}

module.exports = ReportHistory;