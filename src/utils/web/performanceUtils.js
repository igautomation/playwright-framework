const logger = require('../common/logger');
const fs = require('fs');
const path = require('path');

/**
 * Performance Utilities class for performance testing
 * Note: This is a simplified version that doesn't require lighthouse
 */
class PerformanceUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Measure page load performance metrics
   * @returns {Promise<Object>} Performance metrics
   */
  async measurePerformance() {
    try {
      logger.info('Measuring page load performance');

      // Get performance metrics using JavaScript Performance API
      const metrics = await this.page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('navigation');
        if (perfEntries.length > 0) {
          const navigationEntry = perfEntries[0];
          return {
            loadTime: navigationEntry.loadEventEnd - navigationEntry.startTime,
            domContentLoaded:
              navigationEntry.domContentLoadedEventEnd -
              navigationEntry.startTime,
            firstPaint:
              navigationEntry.responseStart - navigationEntry.startTime,
            resourceCount: performance.getEntriesByType('resource').length,
            totalResourceSize: performance
              .getEntriesByType('resource')
              .reduce(
                (total, resource) => total + (resource.transferSize || 0),
                0
              ),
          };
        }
        return null;
      });

      logger.info('Performance metrics collected', metrics);

      return metrics;
    } catch (error) {
      logger.error('Failed to measure performance', error);
      throw error;
    }
  }

  /**
   * Measure resource loading performance
   * @returns {Promise<Object>} Resource performance metrics
   */
  async measureResourcePerformance() {
    try {
      logger.info('Measuring resource loading performance');

      // Get resource timing entries
      const resourceTimings = await this.page.evaluate(() => {
        return JSON.stringify(
          performance.getEntriesByType('resource').map((entry) => ({
            name: entry.name,
            entryType: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            initiatorType: entry.initiatorType,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
          }))
        );
      });

      const resources = JSON.parse(resourceTimings);

      // Calculate statistics
      const totalResources = resources.length;
      const totalTransferSize = resources.reduce(
        (sum, resource) => sum + (resource.transferSize || 0),
        0
      );
      const totalDuration = resources.reduce(
        (sum, resource) => sum + resource.duration,
        0
      );
      const averageDuration = totalDuration / totalResources;

      // Group by type
      const resourcesByType = resources.reduce((acc, resource) => {
        const type = resource.initiatorType || 'other';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(resource);
        return acc;
      }, {});

      const result = {
        totalResources,
        totalTransferSize,
        totalDuration,
        averageDuration,
        resourcesByType,
        resources,
      };

      logger.info('Resource performance metrics collected', {
        totalResources,
        totalTransferSize,
        averageDuration,
      });

      return result;
    } catch (error) {
      logger.error('Failed to measure resource performance', error);
      throw error;
    }
  }

  /**
   * Generate performance report
   * @param {Object} options - Report options
   * @returns {Promise<string>} Path to the report
   */
  async generatePerformanceReport(options = {}) {
    try {
      logger.info('Generating performance report');

      // Create report directory if it doesn't exist
      const reportDir =
        options.reportDir || path.resolve(process.cwd(), 'reports/performance');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      // Collect metrics
      const pageMetrics = await this.measurePerformance();
      const resourceMetrics = await this.measureResourcePerformance();

      // Generate report data
      const reportData = {
        url: this.page.url(),
        timestamp: new Date().toISOString(),
        pageMetrics,
        resourceMetrics,
      };

      // Generate report filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(
        reportDir,
        `performance-report-${timestamp}.json`
      );

      // Write report to file
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

      logger.info(`Performance report generated at ${reportPath}`);

      return reportPath;
    } catch (error) {
      logger.error('Failed to generate performance report', error);
      throw error;
    }
  }
}

module.exports = PerformanceUtils;
