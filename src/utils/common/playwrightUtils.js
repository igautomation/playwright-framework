/**
 * Additional Playwright utilities based on the latest Playwright features
 * See: https://playwright.dev/docs/intro
 * See: https://playwright.dev/docs/api/class-playwright
 */
const { chromium, firefox, webkit, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const PlaywrightErrorHandler = require('./errorHandler');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

/**
 * Playwright utilities for advanced browser automation
 */
class PlaywrightUtils {
  /**
   * Launch browser with specified browser type
   * @param {string} browserType - Browser type: 'chromium', 'firefox', or 'webkit'
   * @param {Object} options - Browser launch options
   * @returns {Promise<Browser>} Browser instance
   */
  static async launchBrowser(browserType = 'chromium', options = {}) {
    try {
      let browser;
      
      switch (browserType.toLowerCase()) {
        case 'firefox':
          browser = await firefox.launch(options);
          break;
        case 'webkit':
          browser = await webkit.launch(options);
          break;
        case 'chromium':
        default:
          browser = await chromium.launch(options);
          break;
      }
      
      return browser;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: `launching ${browserType} browser`,
        options
      });
    }
  }
  
  /**
   * Create a persistent context (user data directory)
   * @param {string} userDataDir - Path to user data directory
   * @param {Object} options - Context options
   * @returns {Promise<BrowserContext>} Browser context
   */
  static async createPersistentContext(userDataDir, options = {}) {
    try {
      return await chromium.launchPersistentContext(userDataDir, options);
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'creating persistent context',
        userDataDir,
        options
      });
    }
  }
  
  /**
   * Record a video of the browser session
   * @param {Function} interactionFn - Function that performs interactions with the page
   * @param {Object} options - Options
   * @returns {Promise<string>} Path to the video file
   */
  static async recordVideo(interactionFn, options = {}) {
    const videoDir = options.videoDir || path.join(process.cwd(), 'videos');
    const videoPath = options.videoPath || path.join(videoDir, `video-${Date.now()}.webm`);
    
    // Ensure video directory exists
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }
    
    let browser = null;
    let context = null;
    
    try {
      browser = await chromium.launch({
        headless: options.headless !== false,
        ...options.browserOptions
      });
      
      context = await browser.newContext({
        recordVideo: {
          dir: videoDir,
          size: options.videoSize || { width: 1280, height: 720 }
        },
        viewport: options.viewport || { width: 1280, height: 720 }
      });
      
      const page = await context.newPage();
      
      // Run the interaction function
      await interactionFn(page, context);
      
      // Close context to ensure video is saved
      await context.close();
      context = null;
      
      // Find the video file
      const videoFiles = fs.readdirSync(videoDir)
        .filter(file => file.endsWith('.webm'))
        .map(file => path.join(videoDir, file))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
      
      if (videoFiles.length > 0) {
        // Rename the latest video file to the desired name
        fs.renameSync(videoFiles[0], videoPath);
      }
      
      return videoPath;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'recording video',
        options
      });
    } finally {
      if (context) await context.close();
      if (browser) await browser.close();
    }
  }
  
  /**
   * Take a full-page screenshot with device emulation
   * @param {string} url - URL to navigate to
   * @param {string} deviceName - Device name from playwright.devices
   * @param {Object} options - Screenshot options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  static async screenshotWithDevice(url, deviceName, options = {}) {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: options.headless !== false
      });
      
      // Get device descriptor
      const device = devices[deviceName];
      
      if (!device) {
        throw new Error(`Device not found: ${deviceName}`);
      }
      
      const context = await browser.newContext({
        ...device
      });
      
      const page = await context.newPage();
      
      // Navigate to URL
      await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Wait for selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { 
          state: 'visible',
          timeout: options.selectorTimeout || 10000
        });
      }
      
      // Generate screenshot path if not provided
      const screenshotPath = options.path || path.join(
        process.cwd(),
        'screenshots',
        `${deviceName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
      );
      
      // Ensure directory exists
      const screenshotDir = path.dirname(screenshotPath);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      // Take screenshot
      const screenshot = await page.screenshot({
        path: screenshotPath,
        fullPage: options.fullPage !== false
      });
      
      return screenshot;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'capturing screenshot with device emulation',
        url,
        deviceName,
        options
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Perform visual comparison between two screenshots
   * @param {string} screenshotPath1 - Path to first screenshot
   * @param {string} screenshotPath2 - Path to second screenshot
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparison results
   */
  static async compareScreenshots(screenshotPath1, screenshotPath2, options = {}) {
    try {
      // Check if files exist
      if (!fs.existsSync(screenshotPath1)) {
        throw new Error(`Screenshot not found: ${screenshotPath1}`);
      }
      
      if (!fs.existsSync(screenshotPath2)) {
        throw new Error(`Screenshot not found: ${screenshotPath2}`);
      }
      
      // Read images
      const img1 = PNG.sync.read(fs.readFileSync(screenshotPath1));
      const img2 = PNG.sync.read(fs.readFileSync(screenshotPath2));
      
      // Create output image
      const { width, height } = img1;
      const diffImage = new PNG({ width, height });
      
      // Compare images
      const threshold = options.threshold || 0.1;
      const diffPixels = pixelmatch(
        img1.data, 
        img2.data, 
        diffImage.data, 
        width, 
        height, 
        { threshold }
      );
      
      // Calculate diff percentage
      const diffPercentage = (diffPixels / (width * height)) * 100;
      
      // Save diff image if path provided
      if (options.diffPath) {
        // Ensure directory exists
        const diffDir = path.dirname(options.diffPath);
        if (!fs.existsSync(diffDir)) {
          fs.mkdirSync(diffDir, { recursive: true });
        }
        
        // Write diff image
        fs.writeFileSync(options.diffPath, PNG.sync.write(diffImage));
      }
      
      return {
        diffPixels,
        diffPercentage,
        width,
        height,
        match: diffPercentage <= (options.matchThreshold || 0.1),
        diffImage
      };
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'comparing screenshots',
        screenshotPath1,
        screenshotPath2,
        options
      });
    }
  }
  
  /**
   * Measure page performance metrics
   * @param {string} url - URL to navigate to
   * @param {Object} options - Options
   * @returns {Promise<Object>} Performance metrics
   */
  static async measurePerformance(url, options = {}) {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: options.headless !== false
      });
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Start tracing if enabled
      if (options.trace) {
        await context.tracing.start({ 
          screenshots: true, 
          snapshots: true 
        });
      }
      
      // Navigate to URL and measure performance
      const startTime = Date.now();
      
      // Enable JS coverage if requested
      if (options.coverage) {
        await page.coverage.startJSCoverage();
        await page.coverage.startCSSCoverage();
      }
      
      // Navigate to the page
      const response = await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      const loadTime = Date.now() - startTime;
      
      // Wait for network to be idle
      await page.waitForLoadState('networkidle');
      
      // Get performance metrics
      const metrics = await page.evaluate(() => JSON.stringify(window.performance));
      const performanceMetrics = JSON.parse(metrics);
      
      // Get resource timing entries
      const resourceTimings = await page.evaluate(() => {
        return JSON.stringify(
          Array.from(window.performance.getEntriesByType('resource'))
        );
      });
      
      // Get JS coverage if enabled
      let jsCoverage = null;
      let cssCoverage = null;
      
      if (options.coverage) {
        jsCoverage = await page.coverage.stopJSCoverage();
        cssCoverage = await page.coverage.stopCSSCoverage();
      }
      
      // Stop tracing if enabled
      let tracePath = null;
      if (options.trace) {
        tracePath = options.tracePath || path.join(process.cwd(), 'traces', `trace-${Date.now()}.zip`);
        
        // Ensure directory exists
        const traceDir = path.dirname(tracePath);
        if (!fs.existsSync(traceDir)) {
          fs.mkdirSync(traceDir, { recursive: true });
        }
        
        await context.tracing.stop({ path: tracePath });
      }
      
      // Take a screenshot if enabled
      let screenshotPath = null;
      if (options.screenshot) {
        screenshotPath = options.screenshotPath || path.join(
          process.cwd(),
          'screenshots',
          `performance-${Date.now()}.png`
        );
        
        // Ensure directory exists
        const screenshotDir = path.dirname(screenshotPath);
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        await page.screenshot({ path: screenshotPath });
      }
      
      // Calculate total resource size
      const resources = JSON.parse(resourceTimings);
      const totalResourceSize = resources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      // Calculate JS and CSS coverage
      let jsUsage = null;
      let cssUsage = null;
      
      if (options.coverage) {
        const calculateUsage = (coverage) => {
          let totalBytes = 0;
          let usedBytes = 0;
          
          for (const entry of coverage) {
            totalBytes += entry.text.length;
            
            for (const range of entry.ranges) {
              usedBytes += range.end - range.start;
            }
          }
          
          return {
            totalBytes,
            usedBytes,
            usagePercentage: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0
          };
        };
        
        jsUsage = calculateUsage(jsCoverage);
        cssUsage = calculateUsage(cssCoverage);
      }
      
      return {
        url,
        loadTime,
        statusCode: response.status(),
        performanceMetrics,
        resources: {
          count: resources.length,
          totalSize: totalResourceSize
        },
        coverage: options.coverage ? {
          js: jsUsage,
          css: cssUsage
        } : null,
        tracePath,
        screenshotPath
      };
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'measuring performance',
        url,
        options
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Test accessibility of a page
   * @param {string} url - URL to navigate to
   * @param {Object} options - Options
   * @returns {Promise<Object>} Accessibility audit results
   */
  static async testAccessibility(url, options = {}) {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: options.headless !== false
      });
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Navigate to URL
      await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Wait for selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { 
          state: 'visible',
          timeout: options.selectorTimeout || 10000
        });
      }
      
      // Get accessibility snapshot
      const snapshot = await page.accessibility.snapshot({
        interestingOnly: options.interestingOnly !== false
      });
      
      // Analyze accessibility issues
      const issues = await page.evaluate(() => {
        // Simple accessibility checks
        const issues = [];
        
        // Check for images without alt text
        document.querySelectorAll('img').forEach(img => {
          if (!img.alt) {
            issues.push({
              type: 'image-alt',
              message: 'Image missing alt text',
              element: {
                tagName: 'img',
                src: img.src
              }
            });
          }
        });
        
        // Check for form inputs without labels
        document.querySelectorAll('input, select, textarea').forEach(input => {
          const id = input.id;
          if (id && !document.querySelector(`label[for="${id}"]`)) {
            issues.push({
              type: 'input-label',
              message: 'Form control missing associated label',
              element: {
                tagName: input.tagName,
                type: input.type,
                id: input.id
              }
            });
          }
        });
        
        // Check for low contrast (simplified)
        // A proper implementation would use color contrast algorithms
        
        // Check for missing document language
        if (!document.documentElement.lang) {
          issues.push({
            type: 'language',
            message: 'Document language not specified'
          });
        }
        
        return issues;
      });
      
      // Save report if path provided
      if (options.reportPath) {
        // Ensure directory exists
        const reportDir = path.dirname(options.reportPath);
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true });
        }
        
        fs.writeFileSync(options.reportPath, JSON.stringify({
          url,
          timestamp: new Date().toISOString(),
          snapshot,
          issues
        }, null, 2));
      }
      
      return {
        url,
        timestamp: new Date().toISOString(),
        snapshot,
        issues,
        passed: issues.length === 0
      };
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'testing accessibility',
        url,
        options
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Generate PDF from HTML content
   * @param {string} htmlContent - HTML content
   * @param {Object} options - PDF options
   * @returns {Promise<Buffer>} PDF buffer
   */
  static async generatePdfFromHtml(htmlContent, options = {}) {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: true // PDF generation requires headless mode
      });
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Set content
      await page.setContent(htmlContent, {
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Generate PDF path if not provided
      const pdfPath = options.path || path.join(
        process.cwd(),
        'pdfs',
        `document-${Date.now()}.pdf`
      );
      
      // Ensure directory exists
      const pdfDir = path.dirname(pdfPath);
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      
      // Generate PDF
      const pdf = await page.pdf({
        path: pdfPath,
        format: options.format || 'A4',
        margin: options.margin || { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        printBackground: options.printBackground !== false,
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate || '',
        footerTemplate: options.footerTemplate || '',
        scale: options.scale || 1,
        landscape: options.landscape || false,
        pageRanges: options.pageRanges || ''
      });
      
      return pdf;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'generating PDF from HTML',
        options
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Extract data from a table on a webpage
   * @param {string} url - URL to navigate to
   * @param {string} tableSelector - CSS selector for the table
   * @param {Object} options - Options
   * @returns {Promise<Array>} Extracted table data
   */
  static async extractTableData(url, tableSelector, options = {}) {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: options.headless !== false
      });
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Navigate to URL
      await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Wait for table to be visible
      await page.waitForSelector(tableSelector, { 
        state: 'visible',
        timeout: options.selectorTimeout || 10000
      });
      
      // Extract table data
      const tableData = await page.evaluate((selector) => {
        const table = document.querySelector(selector);
        if (!table) return null;
        
        const headers = Array.from(table.querySelectorAll('thead th, tbody tr:first-child th'))
          .map(th => th.textContent.trim());
        
        const rows = Array.from(table.querySelectorAll('tbody tr'))
          .map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'))
              .map(cell => cell.textContent.trim());
            
            // If headers exist, create object with header keys
            if (headers.length > 0) {
              return headers.reduce((obj, header, index) => {
                obj[header] = cells[index] || '';
                return obj;
              }, {});
            }
            
            return cells;
          });
        
        return {
          headers,
          rows
        };
      }, tableSelector);
      
      // Save data if path provided
      if (options.outputPath) {
        // Ensure directory exists
        const outputDir = path.dirname(options.outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(options.outputPath, JSON.stringify(tableData, null, 2));
      }
      
      return tableData;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'extracting table data',
        url,
        tableSelector,
        options
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Test a form by filling and submitting it
   * @param {string} url - URL to navigate to
   * @param {Object} formData - Form field data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Form submission results
   */
  static async testForm(url, formData, options = {}) {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: options.headless !== false
      });
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Start tracing if enabled
      if (options.trace) {
        await context.tracing.start({ 
          screenshots: true, 
          snapshots: true 
        });
      }
      
      // Navigate to URL
      await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Wait for form to be visible
      const formSelector = options.formSelector || 'form';
      await page.waitForSelector(formSelector, { 
        state: 'visible',
        timeout: options.selectorTimeout || 10000
      });
      
      // Fill form fields
      for (const [field, value] of Object.entries(formData)) {
        // Handle different field types
        const fieldSelector = `${formSelector} [name="${field}"]`;
        const fieldType = await page.$eval(fieldSelector, el => el.type || el.tagName.toLowerCase());
        
        switch (fieldType) {
          case 'checkbox':
            if (value) {
              await page.check(fieldSelector);
            } else {
              await page.uncheck(fieldSelector);
            }
            break;
          case 'radio':
            await page.check(`${formSelector} [name="${field}"][value="${value}"]`);
            break;
          case 'select':
          case 'select-one':
          case 'select-multiple':
            await page.selectOption(fieldSelector, value);
            break;
          case 'file':
            await page.setInputFiles(fieldSelector, value);
            break;
          default:
            await page.fill(fieldSelector, String(value));
        }
        
        // Wait a bit between field fills if specified
        if (options.delayBetweenFields) {
          await page.waitForTimeout(options.delayBetweenFields);
        }
      }
      
      // Take screenshot before submission if enabled
      let beforeScreenshotPath = null;
      if (options.screenshotBefore) {
        beforeScreenshotPath = options.beforeScreenshotPath || path.join(
          process.cwd(),
          'screenshots',
          `form-before-${Date.now()}.png`
        );
        
        // Ensure directory exists
        const screenshotDir = path.dirname(beforeScreenshotPath);
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        await page.screenshot({ path: beforeScreenshotPath });
      }
      
      // Set up navigation promise
      const navigationPromise = page.waitForNavigation({
        timeout: options.navigationTimeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      }).catch(() => null); // Catch in case there's no navigation
      
      // Submit form
      if (options.submitButtonSelector) {
        await page.click(options.submitButtonSelector);
      } else {
        await page.evaluate((selector) => {
          const form = document.querySelector(selector);
          if (form) form.submit();
        }, formSelector);
      }
      
      // Wait for navigation or timeout
      const navigationResult = await navigationPromise;
      
      // Take screenshot after submission if enabled
      let afterScreenshotPath = null;
      if (options.screenshotAfter) {
        afterScreenshotPath = options.afterScreenshotPath || path.join(
          process.cwd(),
          'screenshots',
          `form-after-${Date.now()}.png`
        );
        
        // Ensure directory exists
        const screenshotDir = path.dirname(afterScreenshotPath);
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        await page.screenshot({ path: afterScreenshotPath });
      }
      
      // Stop tracing if enabled
      let tracePath = null;
      if (options.trace) {
        tracePath = options.tracePath || path.join(process.cwd(), 'traces', `form-trace-${Date.now()}.zip`);
        
        // Ensure directory exists
        const traceDir = path.dirname(tracePath);
        if (!fs.existsSync(traceDir)) {
          fs.mkdirSync(traceDir, { recursive: true });
        }
        
        await context.tracing.stop({ path: tracePath });
      }
      
      // Check for success indicators
      let success = false;
      let errorMessage = null;
      
      if (options.successSelector) {
        success = await page.$(options.successSelector).then(Boolean);
      }
      
      if (options.errorSelector) {
        const errorElement = await page.$(options.errorSelector);
        if (errorElement) {
          errorMessage = await errorElement.textContent();
          success = false;
        }
      }
      
      // Get current URL
      const currentUrl = page.url();
      
      return {
        success: success || (options.successUrl && currentUrl.includes(options.successUrl)),
        currentUrl,
        errorMessage,
        navigationOccurred: !!navigationResult,
        beforeScreenshotPath,
        afterScreenshotPath,
        tracePath
      };
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'testing form',
        url,
        formData,
        options
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = PlaywrightUtils;