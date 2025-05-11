const { chromium, firefox, webkit } = require('playwright');
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
   * @param {string} options.browserType - Browser type to use ('chromium', 'firefox', 'webkit')
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'reports/playwright');
    this.browserOptions = options.browserOptions || {};
    this.headless = options.headless !== false; // Default to headless mode
    this.browserType = options.browserType || 'chromium'; // Default to chromium
    
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
   * Get browser instance based on browser type
   * @param {string} browserType - Browser type ('chromium', 'firefox', 'webkit')
   * @returns {Object} Browser instance
   * @private
   */
  _getBrowserInstance(browserType) {
    switch (browserType.toLowerCase()) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }
  
  /**
   * Launch browser
   * @param {Object} options - Additional browser options
   * @returns {Promise<Browser>} Playwright browser instance
   */
  async launchBrowser(options = {}) {
    try {
      const browserType = options.browserType || this.browserType;
      const browser = this._getBrowserInstance(browserType);
      
      logger.debug(`Launching ${browserType} browser`);
      
      const browserInstance = await browser.launch({
        headless: this.headless,
        ...this.browserOptions,
        ...options
      });
      
      return browserInstance;
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
      browser = await this.launchBrowser(options);
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
      browser = await this.launchBrowser(options);
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
      // PDF generation is only supported in Chromium
      browser = await this.launchBrowser({ browserType: 'chromium', ...options });
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
      browser = await this.launchBrowser(options);
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
      const accessibilitySnapshot = await page.accessibility.snapshot({
        interestingOnly: options.interestingOnly !== false,
        root: options.root ? await page.$(options.root) : undefined
      });
      
      // Generate report path if not provided
      if (options.outputPath) {
        const reportPath = options.outputPath;
        this._ensureDirectoryExists(path.dirname(reportPath));
        fs.writeFileSync(reportPath, JSON.stringify(accessibilitySnapshot, null, 2));
        logger.info(`Accessibility report written to: ${reportPath}`);
      }
      
      return accessibilitySnapshot;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'running accessibility audit',
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
   * Check if browsers are installed
   * @returns {Promise<Object>} Status of browser installations
   */
  static async checkBrowsersInstallation() {
    try {
      const result = {
        chromium: false,
        firefox: false,
        webkit: false
      };
      
      // Try to execute a simple command with each browser type
      try {
        await chromium.launch({ headless: true });
        result.chromium = true;
      } catch (e) {
        logger.warn('Chromium browser check failed', e);
      }
      
      try {
        await firefox.launch({ headless: true });
        result.firefox = true;
      } catch (e) {
        logger.warn('Firefox browser check failed', e);
      }
      
      try {
        await webkit.launch({ headless: true });
        result.webkit = true;
      } catch (e) {
        logger.warn('WebKit browser check failed', e);
      }
      
      return result;
    } catch (error) {
      logger.error('Error checking browser installations', error);
      throw error;
    }
  }
}

module.exports = PlaywrightService;