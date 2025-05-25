/**
 * Report utilities for test reporting
 * @deprecated Use reportingUtils.js instead
 */
const reportingUtils = require('./reportingUtils');

// Re-export functions from reportingUtils for backward compatibility
class ReportUtils {
  static generateAllureReport(options = {}) {
    console.warn('ReportUtils.generateAllureReport is deprecated. Use reportingUtils.generateAllureReport instead.');
    return reportingUtils.generateAllureReport(options);
  }

  static openAllureReport(reportDir) {
    console.warn('ReportUtils.openAllureReport is deprecated. Use reportingUtils.openAllureReport instead.');
    return reportingUtils.openAllureReport(reportDir);
  }

  static generateHtmlReport(options = {}) {
    console.warn('ReportUtils.generateHtmlReport is deprecated. Use reportingUtils.generateHtmlReport instead.');
    return reportingUtils.generateHtmlReport(options);
  }

  static generateJUnitReport(options = {}) {
    console.warn('ReportUtils.generateJUnitReport is deprecated. Use reportingUtils.generateJUnitReport instead.');
    return reportingUtils.generateJUnitReport(options);
  }

  static mergeReports(reportPaths, outputPath) {
    console.warn('ReportUtils.mergeReports is deprecated. Use reportingUtils directly.');
    // This function is kept for backward compatibility
    try {
      const fs = require('fs');
      const path = require('path');
      const { execSync } = require('child_process');
      
      console.log(`Merging reports: ${reportPaths.join(', ')}`);
      
      // For Allure reports, use allure-merge
      if (reportPaths.every(p => p.includes('allure'))) {
        const outputDir = path.dirname(outputPath);
        
        // Create output directory
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Merge reports
        execSync(`npx allure-merge ${reportPaths.join(' ')} -o ${outputPath}`);
        
        return outputPath;
      }
      
      return outputPath;
    } catch (error) {
      console.error('Failed to merge reports:', error);
      throw error;
    }
  }
  
  static async sendReportNotification(options = {}) {
    console.warn('ReportUtils.sendReportNotification is deprecated. Use reportingUtils.sendReportNotification instead.');
    return reportingUtils.sendReportNotification(options);
  }
}

module.exports = ReportUtils;