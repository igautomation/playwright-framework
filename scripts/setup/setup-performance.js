#!/usr/bin/env node

/**
 * Script to set up performance testing in the framework
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up performance testing...');

// Install required dependencies
console.log('Installing dependencies...');
execSync('npm install --save-dev lighthouse playwright-lighthouse', {
  stdio: 'inherit',
});

// Create performance utility file
const performanceUtilPath = path.resolve(
  __dirname,
  '../src/utils/web/performanceUtils.js'
);

const performanceUtilContent = `const { playAudit } = require('playwright-lighthouse');
const lighthouse = require('lighthouse');
const logger = require('../common/logger');
const fs = require('fs');
const path = require('path');

/**
 * Performance Utilities class for performance testing
 */
class PerformanceUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    this.port = 9222;
  }

  /**
   * Run Lighthouse audit on the current page
   * @param {Object} options - Audit options
   * @returns {Promise<Object>} Lighthouse audit results
   */
  async runLighthouseAudit(options = {}) {
    try {
      logger.info('Running Lighthouse audit');
      
      const url = this.page.url();
      
      // Default thresholds
      const thresholds = {
        performance: options.performance || 80,
        accessibility: options.accessibility || 90,
        'best-practices': options.bestPractices || 85,
        seo: options.seo || 80,
        pwa: options.pwa || 50
      };
      
      // Default config
      const config = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: options.onlyCategories || ['performance', 'accessibility', 'best-practices', 'seo'],
          formFactor: options.formFactor || 'desktop',
          throttling: {
            rttMs: options.rttMs || 40,
            throughputKbps: options.throughputKbps || 10240,
            cpuSlowdownMultiplier: options.cpuSlowdownMultiplier || 1
          }
        }
      };
      
      // Run audit
      const results = await playAudit({
        page: this.page,
        port: this.port,
        thresholds,
        reports: {
          formats: {
            html: true,
            json: true
          },
          directory: options.reportDir || path.resolve(process.cwd(), 'reports/lighthouse')
        },
        config
      });
      
      logger.info('Lighthouse audit completed');
      
      return results;
    } catch (error) {
      logger.error('Failed to run Lighthouse audit', error);
      throw error;
    }
  }

  /**
   * Measure page load performance metrics
   * @returns {Promise<Object>} Performance metrics
   */
  async measurePerformance() {
    try {
      logger.info('Measuring page load performance');
      
      // Get performance metrics
      const metrics = await this.page.evaluate(() => JSON.stringify(window.performance));
      const performanceMetrics = JSON.parse(metrics);
      
      // Calculate key metrics
      const navigationStart = performanceMetrics.timing.navigationStart;
      const loadEventEnd = performanceMetrics.timing.loadEventEnd;
      const domComplete = performanceMetrics.timing.domComplete;
      const firstPaint = performanceMetrics.timing.responseStart;
      
      const pageLoadTime = loadEventEnd - navigationStart;
      const domReadyTime = domComplete - navigationStart;
      const firstPaintTime = firstPaint - navigationStart;
      
      const result = {
        pageLoadTime,
        domReadyTime,
        firstPaintTime,
        rawMetrics: performanceMetrics
      };
      
      logger.info('Performance metrics collected', result);
      
      return result;
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
          performance.getEntriesByType('resource').map(entry => ({
            name: entry.name,
            entryType: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            initiatorType: entry.initiatorType,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize
          }))
        );
      });
      
      const resources = JSON.parse(resourceTimings);
      
      // Calculate statistics
      const totalResources = resources.length;
      const totalTransferSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
      const totalDuration = resources.reduce((sum, resource) => sum + resource.duration, 0);
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
        resources
      };
      
      logger.info('Resource performance metrics collected', {
        totalResources,
        totalTransferSize,
        averageDuration
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
      const reportDir = options.reportDir || path.resolve(process.cwd(), 'reports/performance');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Collect metrics
      const pageMetrics = await this.measurePerformance();
      const resourceMetrics = await this.measureResourcePerformance();
      
      // Run Lighthouse audit if requested
      let lighthouseResults = null;
      if (options.includeLighthouse) {
        lighthouseResults = await this.runLighthouseAudit(options);
      }
      
      // Generate report data
      const reportData = {
        url: this.page.url(),
        timestamp: new Date().toISOString(),
        pageMetrics,
        resourceMetrics,
        lighthouse: lighthouseResults
      };
      
      // Generate report filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reportDir, \`performance-report-\${timestamp}.json\`);
      
      // Write report to file
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      
      logger.info(\`Performance report generated at \${reportPath}\`);
      
      return reportPath;
    } catch (error) {
      logger.error('Failed to generate performance report', error);
      throw error;
    }
  }
}

module.exports = PerformanceUtils;`;

// Write the file
fs.writeFileSync(performanceUtilPath, performanceUtilContent);
console.log(`Created performance utility at: ${performanceUtilPath}`);

// Create example performance test
const performanceTestPath = path.resolve(
  __dirname,
  '../src/tests/ui/performance/basic.spec.js'
);

// Create directory if it doesn't exist
const performanceTestDir = path.dirname(performanceTestPath);
if (!fs.existsSync(performanceTestDir)) {
  fs.mkdirSync(performanceTestDir, { recursive: true });
}

const performanceTestContent = `const { test, expect } = require('@playwright/test');
const PerformanceUtils = require('../../../utils/web/performanceUtils');

test.describe('Performance Testing @performance', () => {
  test('Homepage should load within acceptable time @p1', async ({ page }) => {
    // Navigate to the homepage
    await page.goto(process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    
    // Create performance utils instance
    const performanceUtils = new PerformanceUtils(page);
    
    // Measure performance
    const metrics = await performanceUtils.measurePerformance();
    
    // Assert page load time is acceptable
    expect(metrics.pageLoadTime).toBeLessThan(5000); // 5 seconds
    
    // Assert DOM ready time is acceptable
    expect(metrics.domReadyTime).toBeLessThan(3000); // 3 seconds
    
    // Generate performance report
    await performanceUtils.generatePerformanceReport();
  });
  
  test('Resource loading should be optimized @p2', async ({ page }) => {
    // Navigate to the homepage
    await page.goto(process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    
    // Create performance utils instance
    const performanceUtils = new PerformanceUtils(page);
    
    // Measure resource performance
    const resourceMetrics = await performanceUtils.measureResourcePerformance();
    
    // Assert total transfer size is acceptable
    expect(resourceMetrics.totalTransferSize).toBeLessThan(5000000); // 5MB
    
    // Assert average resource load time is acceptable
    expect(resourceMetrics.averageDuration).toBeLessThan(500); // 500ms
  });
  
  test('Lighthouse audit should pass performance thresholds @p1', async ({ page }) => {
    // This test may take longer to run
    test.setTimeout(60000);
    
    // Navigate to the homepage
    await page.goto(process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    
    // Create performance utils instance
    const performanceUtils = new PerformanceUtils(page);
    
    // Run Lighthouse audit with custom thresholds
    const results = await performanceUtils.runLighthouseAudit({
      performance: 70, // Lower threshold for demo
      accessibility: 80,
      bestPractices: 80,
      seo: 80
    });
    
    // Results will automatically be compared against thresholds
    // The test will fail if any threshold is not met
  });
});`;

// Write the file
fs.writeFileSync(performanceTestPath, performanceTestContent);
console.log(`Created example performance test at: ${performanceTestPath}`);

// Update package.json to add performance test script
try {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = require(packageJsonPath);

  if (!packageJson.scripts['test:performance']) {
    packageJson.scripts['test:performance'] =
      'node src/cli/index.js test --tags @performance';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Added performance test script to package.json');
  }
} catch (error) {
  console.error('Failed to update package.json:', error);
}

console.log('Performance testing setup complete!');
console.log('Run performance tests with: npm run test:performance');
