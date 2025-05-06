const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const logger = require('./logger');
const PlaywrightErrorHandler = require('./errorHandler');

/**
 * PlaywrightService - Utility class for Playwright operations
 * Provides browser automation, screenshot capture, PDF generation, and testing capabilities
 */
class PlaywrightService {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.outputDir - Directory to store outputs (screenshots, PDFs, etc.)
   * @param {Object} options.browserOptions - Options for browser launch
   * @param {boolean} options.headless - Whether to run browser in headless mode
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'reports/playwright');
    this.browserOptions = options.browserOptions || {};
    this.headless = options.headless !== false; // Default to headless mode
    
    // Ensure output directory exists
    this._ensureDirectoryExists(this.outputDir);
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
   * Launch browser
   * @param {Object} options - Additional browser options
   * @returns {Promise<Browser>} Playwright browser instance
   */
  async launchBrowser(options = {}) {
    try {
      const browser = await chromium.launch({
        headless: this.headless,
        ...this.browserOptions,
        ...options
      });
      
      return browser;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'launching browser',
        options: { ...this.browserOptions, ...options }
      });
    }
  }
  
  /**
   * Capture screenshot of a page
   * @param {string} url - URL to navigate to
   * @param {Object} options - Screenshot options
   * @param {string} options.path - Path to save screenshot
   * @param {boolean} options.fullPage - Whether to capture full page
   * @param {number} options.timeout - Navigation timeout in milliseconds
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async captureScreenshot(url, options = {}) {
    let browser = null;
    
    try {
      browser = await this.launchBrowser();
      const page = await browser.newPage();
      
      // Set viewport size if provided
      if (options.viewport) {
        await page.setViewportSize(options.viewport);
      }
      
      // Navigate to URL with timeout
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
      
      // Wait for additional time if specified
      if (options.waitTime) {
        await page.waitForTimeout(options.waitTime);
      }
      
      // Generate screenshot path if not provided
      const screenshotPath = options.path || path.join(
        this.outputDir,
        `screenshot-${Date.now()}.png`
      );
      
      // Ensure directory exists
      this._ensureDirectoryExists(path.dirname(screenshotPath));
      
      // Take screenshot
      const screenshot = await page.screenshot({
        path: screenshotPath,
        fullPage: options.fullPage !== false,
        omitBackground: options.transparent || false,
        type: options.type || 'png'
      });
      
      logger.info(`Screenshot captured: ${screenshotPath}`);
      return screenshot;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'capturing screenshot',
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
   * Capture screenshot of a specific element
   * @param {string} url - URL to navigate to
   * @param {string} selector - CSS selector for the element
   * @param {Object} options - Screenshot options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  async captureElementScreenshot(url, selector, options = {}) {
    let browser = null;
    
    try {
      browser = await this.launchBrowser();
      const page = await browser.newPage();
      
      // Navigate to URL
      await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Wait for element to be visible
      await page.waitForSelector(selector, { 
        state: 'visible',
        timeout: options.selectorTimeout || 10000
      });
      
      // Wait for additional time if specified
      if (options.waitTime) {
        await page.waitForTimeout(options.waitTime);
      }
      
      // Generate screenshot path if not provided
      const screenshotPath = options.path || path.join(
        this.outputDir,
        `element-${Date.now()}.png`
      );
      
      // Ensure directory exists
      this._ensureDirectoryExists(path.dirname(screenshotPath));
      
      // Get element and take screenshot
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const screenshot = await element.screenshot({
        path: screenshotPath,
        omitBackground: options.transparent || false,
        type: options.type || 'png'
      });
      
      logger.info(`Element screenshot captured: ${screenshotPath}`);
      return screenshot;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'capturing element screenshot',
        url,
        selector,
        options
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Generate PDF from a URL
   * @param {string} url - URL to navigate to
   * @param {Object} options - PDF options
   * @returns {Promise<string>} Path to the generated PDF
   */
  async generatePdf(url, options = {}) {
    let browser = null;
    
    try {
      browser = await this.launchBrowser();
      const page = await browser.newPage();
      
      // Navigate to URL
      await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Wait for content to be ready
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { 
          state: 'visible',
          timeout: options.selectorTimeout || 10000
        });
      }
      
      // Wait for additional time if specified
      if (options.waitTime) {
        await page.waitForTimeout(options.waitTime);
      }
      
      // Generate PDF path if not provided
      const pdfPath = options.path || path.join(
        this.outputDir,
        `document-${Date.now()}.pdf`
      );
      
      // Ensure directory exists
      this._ensureDirectoryExists(path.dirname(pdfPath));
      
      // Generate PDF
      await page.pdf({
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
      
      logger.info(`PDF generated: ${pdfPath}`);
      return pdfPath;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'generating PDF',
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
   * Run accessibility audit on a page
   * @param {string} url - URL to navigate to
   * @param {Object} options - Audit options
   * @returns {Promise<Object>} Accessibility audit results
   */
  async runAccessibilityAudit(url, options = {}) {
    let browser = null;
    
    try {
      browser = await this.launchBrowser();
      const page = await browser.newPage();
      
      // Navigate to URL
      await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Wait for content to be ready
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { 
          state: 'visible',
          timeout: options.selectorTimeout || 10000
        });
      }
      
      // Wait for additional time if specified
      if (options.waitTime) {
        await page.waitForTimeout(options.waitTime);
      }
      
      // Run accessibility snapshot
      const snapshot = await page.accessibility.snapshot({
        root: options.root ? await page.$(options.root) : undefined,
        interestingOnly: options.interestingOnly !== false
      });
      
      // Analyze for common issues
      const issues = this._analyzeAccessibilityIssues(snapshot);
      
      // Save report if path provided
      if (options.reportPath) {
        const reportPath = options.reportPath;
        this._ensureDirectoryExists(path.dirname(reportPath));
        
        fs.writeFileSync(reportPath, JSON.stringify({
          url,
          timestamp: new Date().toISOString(),
          snapshot,
          issues
        }, null, 2));
        
        logger.info(`Accessibility report saved: ${reportPath}`);
      }
      
      return {
        passed: issues.length === 0,
        issues,
        snapshot
      };
    } catch (error) {
      logger.error(`Failed to run accessibility audit for URL: ${url}`, error);
      throw new Error(`Accessibility audit failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Analyze accessibility issues from snapshot
   * @param {Object} snapshot - Accessibility snapshot
   * @returns {Array<Object>} List of issues
   * @private
   */
  _analyzeAccessibilityIssues(snapshot) {
    const issues = [];
    
    // Helper function to recursively check nodes
    const checkNode = (node) => {
      // Check for missing alt text on images
      if (node.role === 'img' && (!node.name || node.name.trim() === '')) {
        issues.push({
          type: 'missing-alt',
          message: 'Image is missing alt text',
          node
        });
      }
      
      // Check for empty buttons
      if (node.role === 'button' && (!node.name || node.name.trim() === '')) {
        issues.push({
          type: 'empty-button',
          message: 'Button has no accessible name',
          node
        });
      }
      
      // Check for low contrast (if contrast data is available)
      if (node.color && node.backgroundColor) {
        // This is a simplified check - a real implementation would use WCAG contrast formulas
        // For now, we're just checking if the data exists
        if (node.color === node.backgroundColor) {
          issues.push({
            type: 'low-contrast',
            message: 'Element may have insufficient color contrast',
            node
          });
        }
      }
      
      // Check children recursively
      if (node.children) {
        node.children.forEach(child => checkNode(child));
      }
    };
    
    // Start checking from root node
    checkNode(snapshot);
    
    return issues;
  }
  
  /**
   * Test responsiveness across different device viewports
   * @param {string} url - URL to navigate to
   * @param {Array<Object>} devices - List of devices to test
   * @param {Object} options - Test options
   * @returns {Promise<Array<Object>>} Test results for each device
   */
  async testResponsiveness(url, devices = [], options = {}) {
    let browser = null;
    
    try {
      browser = await this.launchBrowser();
      const results = [];
      
      // Use default devices if none provided
      const testDevices = devices.length > 0 ? devices : [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 }
      ];
      
      for (const device of testDevices) {
        const context = await browser.newContext({
          viewport: { width: device.width, height: device.height }
        });
        
        const page = await context.newPage();
        
        // Navigate to URL
        await page.goto(url, { 
          timeout: options.timeout || 30000,
          waitUntil: options.waitUntil || 'networkidle'
        });
        
        // Wait for content to be ready
        if (options.waitForSelector) {
          await page.waitForSelector(options.waitForSelector, { 
            state: 'visible',
            timeout: options.selectorTimeout || 10000
          });
        }
        
        // Wait for additional time if specified
        if (options.waitTime) {
          await page.waitForTimeout(options.waitTime);
        }
        
        // Check for layout issues
        const layoutIssues = await this._checkLayoutIssues(page, options);
        
        // Take screenshot
        const screenshotPath = path.join(
          this.outputDir,
          `responsive-${device.name.toLowerCase()}-${Date.now()}.png`
        );
        
        await page.screenshot({
          path: screenshotPath,
          fullPage: options.fullPage !== false
        });
        
        results.push({
          device: device.name,
          viewport: { width: device.width, height: device.height },
          layoutIssues,
          screenshotPath
        });
      }
      
      return results;
    } catch (error) {
      logger.error(`Failed to test responsiveness for URL: ${url}`, error);
      throw new Error(`Responsiveness test failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Check for common layout issues
   * @param {Page} page - Playwright page
   * @param {Object} options - Check options
   * @returns {Promise<Array<Object>>} List of layout issues
   * @private
   */
  async _checkLayoutIssues(page, options = {}) {
    const issues = [];
    
    try {
      // Check for horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalOverflow) {
        issues.push({
          type: 'horizontal-overflow',
          message: 'Page has horizontal overflow'
        });
      }
      
      // Check for elements extending beyond viewport
      const overflowingElements = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const elements = Array.from(document.querySelectorAll('*'));
        
        return elements
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.right > viewportWidth + 5; // 5px tolerance
          })
          .map(el => ({
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            width: el.getBoundingClientRect().width,
            right: el.getBoundingClientRect().right,
            viewportWidth
          }))
          .slice(0, 10); // Limit to 10 elements to avoid huge results
      });
      
      if (overflowingElements.length > 0) {
        issues.push({
          type: 'overflowing-elements',
          message: `Found ${overflowingElements.length} elements extending beyond viewport`,
          elements: overflowingElements
        });
      }
      
      // Check for tiny tap targets on mobile
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        const smallTapTargets = await page.evaluate(() => {
          const interactiveElements = Array.from(document.querySelectorAll('a, button, [role="button"], input, select, textarea'));
          
          return interactiveElements
            .filter(el => {
              const rect = el.getBoundingClientRect();
              return (rect.width < 44 || rect.height < 44) && // 44px is recommended minimum size
                     (rect.width > 0 && rect.height > 0); // Ignore hidden elements
            })
            .map(el => ({
              tagName: el.tagName,
              id: el.id,
              className: el.className,
              width: el.getBoundingClientRect().width,
              height: el.getBoundingClientRect().height
            }))
            .slice(0, 10); // Limit to 10 elements
        });
        
        if (smallTapTargets.length > 0) {
          issues.push({
            type: 'small-tap-targets',
            message: `Found ${smallTapTargets.length} interactive elements with small tap targets`,
            elements: smallTapTargets
          });
        }
      }
      
      // Check for custom issues if provided
      if (options.customChecks && Array.isArray(options.customChecks)) {
        for (const check of options.customChecks) {
          if (typeof check === 'function') {
            const customIssues = await check(page);
            if (customIssues && Array.isArray(customIssues)) {
              issues.push(...customIssues);
            }
          }
        }
      }
      
      return issues;
    } catch (error) {
      logger.error('Failed to check layout issues', error);
      return [{ type: 'check-error', message: `Error checking layout: ${error.message}` }];
    }
  }
  
  /**
   * Capture a trace of page interactions for debugging
   * @param {Function} interactionFn - Function that performs interactions with the page
   * @param {Object} options - Trace options
   * @returns {Promise<string>} Path to the trace file
   */
  async captureTrace(interactionFn, options = {}) {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: this.headless,
        ...this.browserOptions
      });
      
      const context = await browser.newContext();
      
      // Start tracing
      await context.tracing.start({ 
        screenshots: options.screenshots !== false, 
        snapshots: options.snapshots !== false,
        sources: options.sources !== false
      });
      
      const page = await context.newPage();
      
      // Run the interaction function
      await interactionFn(page, context);
      
      // Generate trace path if not provided
      const tracePath = options.path || path.join(
        this.outputDir,
        `trace-${Date.now()}.zip`
      );
      
      // Ensure directory exists
      this._ensureDirectoryExists(path.dirname(tracePath));
      
      // Stop tracing and save
      await context.tracing.stop({ path: tracePath });
      
      logger.info(`Trace captured: ${tracePath}`);
      return tracePath;
    } catch (error) {
      logger.error('Failed to capture trace', error);
      throw new Error(`Trace capture failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Mock network requests for testing
   * @param {string} url - URL to navigate to
   * @param {Array<Object>} mocks - List of mock configurations
   * @param {Function} interactionFn - Function that performs interactions with the page
   * @param {Object} options - Options
   * @returns {Promise<Object>} Test results
   */
  async withNetworkMocks(url, mocks, interactionFn, options = {}) {
    let browser = null;
    
    try {
      browser = await this.launchBrowser();
      const context = await browser.newContext();
      
      // Set up request interception for each mock
      for (const mock of mocks) {
        await context.route(mock.url, route => {
          if (mock.status) {
            route.fulfill({
              status: mock.status,
              contentType: mock.contentType || 'application/json',
              body: typeof mock.body === 'string' ? mock.body : JSON.stringify(mock.body)
            });
          } else if (mock.error) {
            route.abort('failed');
          } else if (mock.delay) {
            setTimeout(() => {
              route.fulfill({
                status: 200,
                contentType: mock.contentType || 'application/json',
                body: typeof mock.body === 'string' ? mock.body : JSON.stringify(mock.body)
              });
            }, mock.delay);
          } else {
            route.continue();
          }
        });
      }
      
      const page = await context.newPage();
      
      // Navigate to URL
      await page.goto(url, { 
        timeout: options.timeout || 30000,
        waitUntil: options.waitUntil || 'networkidle'
      });
      
      // Run the interaction function if provided
      let result = null;
      if (interactionFn) {
        result = await interactionFn(page, context);
      }
      
      // Take screenshot if requested
      let screenshotPath = null;
      if (options.screenshot) {
        screenshotPath = path.join(
          this.outputDir,
          `mock-test-${Date.now()}.png`
        );
        
        await page.screenshot({
          path: screenshotPath,
          fullPage: options.fullPage !== false
        });
      }
      
      return {
        result,
        screenshotPath
      };
    } catch (error) {
      logger.error(`Failed to run test with network mocks for URL: ${url}`, error);
      throw new Error(`Network mock test failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = PlaywrightService;