/**
 * Additional Playwright utilities based on the latest Playwright features
 * See: https://playwright.dev/docs/intro
 * See: https://playwright.dev/docs/api/class-playwright
 */
const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const PlaywrightErrorHandler = require('./errorHandler');

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
      const device = require('playwright').devices[deviceName];
      
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
      
      // Use Playwright's page.screenshot to compare images
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      
      // Load comparison script
      await page.setContent(`
        <html>
          <body>
            <h1>Visual Comparison</h1>
            <div style="display: flex;">
              <div>
                <h2>Image 1</h2>
                <img id="img1" src="" alt="Image 1">
              </div>
              <div>
                <h2>Image 2</h2>
                <img id="img2" src="" alt="Image 2">
              </div>
            </div>
            <div>
              <h2>Difference</h2>
              <canvas id="diffCanvas"></canvas>
            </div>
            <script>
              // Function to compare images
              async function compareImages() {
                const img1 = document.getElementById('img1');
                const img2 = document.getElementById('img2');
                const canvas = document.getElementById('diffCanvas');
                const ctx = canvas.getContext('2d');
                
                // Wait for images to load
                await new Promise(resolve => {
                  let loaded = 0;
                  img1.onload = img2.onload = () => {
                    loaded++;
                    if (loaded === 2) resolve();
                  };
                });
                
                // Set canvas dimensions
                canvas.width = Math.max(img1.width, img2.width);
                canvas.height = Math.max(img1.height, img2.height);
                
                // Draw first image
                ctx.drawImage(img1, 0, 0);
                
                // Get image data
                const img1Data = ctx.getImageData(0, 0, img1.width, img1.height);
                
                // Draw second image
                ctx.drawImage(img2, 0, 0);
                
                // Get image data
                const img2Data = ctx.getImageData(0, 0, img2.width, img2.height);
                
                // Compare pixels
                const diff = {
                  width: Math.max(img1.width, img2.width),
                  height: Math.max(img1.height, img2.height),
                  diffPixels: 0,
                  diffPercentage: 0,
                  diffImage: null
                };
                
                // Create diff image data
                const diffImageData = ctx.createImageData(diff.width, diff.height);
                
                // Compare pixels
                for (let y = 0; y < diff.height; y++) {
                  for (let x = 0; x < diff.width; x++) {
                    const i = (y * diff.width + x) * 4;
                    
                    // Check if pixel is within both images
                    const inImg1 = x < img1.width && y < img1.height;
                    const inImg2 = x < img2.width && y < img2.height;
                    
                    if (inImg1 && inImg2) {
                      // Compare pixels
                      const r1 = img1Data.data[i];
                      const g1 = img1Data.data[i + 1];
                      const b1 = img1Data.data[i + 2];
                      const a1 = img1Data.data[i + 3];
                      
                      const r2 = img2Data.data[i];
                      const g2 = img2Data.data[i + 1];
                      const b2 = img2Data.data[i + 2];
                      const a2 = img2Data.data[i + 3];
                      
                      // Calculate difference
                      const rDiff = Math.abs(r1 - r2);
                      const gDiff = Math.abs(g1 - g2);
                      const bDiff = Math.abs(b1 - b2);
                      const aDiff = Math.abs(a1 - a2);
                      
                      // Check if different
                      const threshold = ${options.threshold || 0};
                      if (rDiff > threshold || gDiff > threshold || bDiff > threshold || aDiff > threshold) {
                        diff.diffPixels++;
                        
                        // Highlight difference in red
                        diffImageData.data[i] = 255;
                        diffImageData.data[i + 1] = 0;
                        diffImageData.data[i + 2] = 0;
                        diffImageData.data[i + 3] = 255;
                      } else {
                        // Copy original pixel
                        diffImageData.data[i] = r1;
                        diffImageData.data[i + 1] = g1;
                        diffImageData.data[i + 2] = b1;
                        diffImageData.data[i + 3] = a1;
                      }
                    } else if (inImg1) {
                      // Pixel only in image 1 (highlight in blue)
                      diff.diffPixels++;
                      diffImageData.data[i] = 0;
                      diffImageData.data[i + 1] = 0;
                      diffImageData.data[i + 2] = 255;
                      diffImageData.data[i + 3] = 255;
                    } else if (inImg2) {
                      // Pixel only in image 2 (highlight in green)
                      diff.diffPixels++;
                      diffImageData.data[i] = 0;
                      diffImageData.data[i + 1] = 255;
                      diffImageData.data[i + 2] = 0;
                      diffImageData.data[i + 3] = 255;
                    }
                  }
                }
                
                // Calculate percentage
                diff.diffPercentage = (diff.diffPixels / (diff.width * diff.height)) * 100;
                
                // Draw diff image
                ctx.putImageData(diffImageData, 0, 0);
                
                // Return results
                return diff;
              }
              
              // Export function for Playwright to call
              window.compareImages = compareImages;
            </script>
          </body>
        </html>
      `);
      
      // Read images as base64
      const img1Base64 = fs.readFileSync(screenshotPath1).toString('base64');
      const img2Base64 = fs.readFileSync(screenshotPath2).toString('base64');
      
      // Set image sources
      await page.evaluate((img1, img2) => {
        document.getElementById('img1').src = `data:image/png;base64,${img1}`;
        document.getElementById('img2').src = `data:image/png;base64,${img2}`;
      }, img1Base64, img2Base64);
      
      // Run comparison
      const result = await page.evaluate(() => window.compareImages());
      
      // Save diff image if path provided
      if (options.diffPath) {
        const diffDir = path.dirname(options.diffPath);
        if (!fs.existsSync(diffDir)) {
          fs.mkdirSync(diffDir, { recursive: true });
        }
        
        await page.screenshot({ path: options.diffPath });
        result.diffImagePath = options.diffPath;
      }
      
      await browser.close();
      
      return result;
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
   * Extract data from a page using Playwright
   * @param {string} url - URL to navigate to
   * @param {Object} selectors - Selectors to extract data from
   * @param {Object} options - Options
   * @returns {Promise<Object>} Extracted data
   */
  static async extractData(url, selectors, options = {}) {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: options.headless !== false
      });
      
      const context = await browser.newContext({
        userAgent: options.userAgent,
        viewport: options.viewport
      });
      
      const page = await context.newPage();
      
      // Set request interception if needed
      if (options.headers) {
        await page.setExtraHTTPHeaders(options.headers);
      }
      
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
      
      // Extract data
      const data = {};
      
      for (const [key, selector] of Object.entries(selectors)) {
        try {
          if (typeof selector === 'string') {
            // Simple selector
            const element = await page.$(selector);
            if (element) {
              data[key] = await element.textContent();
            } else {
              data[key] = null;
            }
          } else if (typeof selector === 'object') {
            // Complex selector with options
            const { selector: sel, attribute, multiple, transform } = selector;
            
            if (multiple) {
              // Extract multiple elements
              const elements = await page.$$(sel);
              data[key] = await Promise.all(elements.map(async (element) => {
                let value;
                
                if (attribute) {
                  value = await element.getAttribute(attribute);
                } else {
                  value = await element.textContent();
                }
                
                // Apply transform if provided
                if (transform && typeof transform === 'function') {
                  value = transform(value);
                }
                
                return value;
              }));
            } else {
              // Extract single element
              const element = await page.$(sel);
              if (element) {
                let value;
                
                if (attribute) {
                  value = await element.getAttribute(attribute);
                } else {
                  value = await element.textContent();
                }
                
                // Apply transform if provided
                if (transform && typeof transform === 'function') {
                  value = transform(value);
                }
                
                data[key] = value;
              } else {
                data[key] = null;
              }
            }
          }
        } catch (selectorError) {
          logger.warn(`Failed to extract data for selector "${key}": ${selectorError.message}`);
          data[key] = null;
        }
      }
      
      return data;
    } catch (error) {
      throw PlaywrightErrorHandler.handleError(error, {
        action: 'extracting data',
        url,
        selectors
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Get list of available devices for emulation
   * @returns {Array<string>} List of device names
   */
  static getAvailableDevices() {
    try {
      const devices = require('playwright').devices;
      return Object.keys(devices);
    } catch (error) {
      logger.error('Failed to get available devices', error);
      return [];
    }
  }
}

module.exports = PlaywrightUtils;