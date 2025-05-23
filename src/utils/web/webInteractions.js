/**
 * Web Interactions
 * 
 * Provides helper functions for web interactions
 */
const config = require('../../config');

/**
 * Web Interactions class for common web actions
 */
class WebInteractions {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Options for web interactions
   */
  constructor(page, options = {}) {
    this.page = page;
    this.options = options;
    this.defaultTimeout = options.timeout || parseInt(process.env.ACTION_TIMEOUT) || config.timeouts?.action || 15000;
  }
  
  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @param {Object} options - Navigation options
   */
  async goto(url, options = {}) {
    await this.page.goto(url, {
      waitUntil: options.waitUntil || 'networkidle',
      timeout: options.timeout || this.defaultTimeout,
      ...options
    });
  }
  
  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = this.defaultTimeout) {
    await this.page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    });
  }
  
  /**
   * Click an element
   * @param {string} selector - Element selector
   * @param {Object} options - Click options
   */
  async click(selector, options = {}) {
    await this.waitForElement(selector, options.timeout);
    await this.page.click(selector, {
      delay: options.delay,
      button: options.button || 'left',
      clickCount: options.clickCount || 1,
      ...options
    });
  }
  
  /**
   * Fill an input field
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   * @param {Object} options - Fill options
   */
  async fill(selector, value, options = {}) {
    await this.waitForElement(selector, options.timeout);
    await this.page.fill(selector, value, options);
  }
  
  /**
   * Fill multiple form fields
   * @param {Object} formData - Object with selectors as keys and values to fill
   * @param {Object} options - Fill options
   */
  async fillForm(formData, options = {}) {
    for (const [selector, value] of Object.entries(formData)) {
      await this.fill(selector, value, options);
    }
  }
  
  /**
   * Login with username and password
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {Object} options - Login options
   */
  async login(username, password, options = {}) {
    const usernameSelector = process.env.USERNAME_INPUT || options.usernameSelector || 'input[name="username"]';
    const passwordSelector = process.env.PASSWORD_INPUT || options.passwordSelector || 'input[name="password"]';
    const loginButtonSelector = process.env.LOGIN_BUTTON || options.loginButtonSelector || 'button[type="submit"]';
    
    await this.fillForm({
      [usernameSelector]: username,
      [passwordSelector]: password
    });
    
    await this.click(loginButtonSelector);
  }
  
  /**
   * Check a checkbox
   * @param {string} selector - Checkbox selector
   * @param {Object} options - Check options
   */
  async check(selector, options = {}) {
    await this.waitForElement(selector, options.timeout);
    await this.page.check(selector, options);
  }
  
  /**
   * Get text content of an element
   * @param {string} selector - Element selector
   * @param {Object} options - Options
   * @returns {Promise<string>} Element text content
   */
  async getText(selector, options = {}) {
    await this.waitForElement(selector, options.timeout);
    return await this.page.textContent(selector, options);
  }
  
  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if element is visible
   */
  async isVisible(selector, timeout = 1000) {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'visible', 
        timeout 
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Select option from dropdown
   * @param {string} selector - Select element selector
   * @param {string|Array<string>} value - Option value(s) to select
   * @param {Object} options - Select options
   */
  async selectOption(selector, value, options = {}) {
    await this.waitForElement(selector, options.timeout);
    await this.page.selectOption(selector, value, options);
  }
  
  /**
   * Hover over an element
   * @param {string} selector - Element selector
   * @param {Object} options - Hover options
   */
  async hover(selector, options = {}) {
    await this.waitForElement(selector, options.timeout);
    await this.page.hover(selector, options);
  }
  
  /**
   * Press a key
   * @param {string} selector - Element selector
   * @param {string} key - Key to press
   * @param {Object} options - Press options
   */
  async pressKey(selector, key, options = {}) {
    await this.waitForElement(selector, options.timeout);
    await this.page.press(selector, key, options);
  }
  
  /**
   * Take a screenshot
   * @param {string} path - Screenshot path
   * @param {Object} options - Screenshot options
   */
  async takeScreenshot(path, options = {}) {
    await this.page.screenshot({ 
      path,
      fullPage: options.fullPage || false,
      ...options
    });
  }
  
  /**
   * Wait for page to load
   * @param {string} state - Load state to wait for
   * @param {Object} options - Options
   */
  async waitForLoadState(state = 'networkidle', options = {}) {
    await this.page.waitForLoadState(state, {
      timeout: options.timeout || this.defaultTimeout
    });
  }
  
  /**
   * Execute JavaScript in the page context
   * @param {string|Function} script - Script to execute
   * @param {Array} args - Arguments to pass to the script
   * @returns {Promise<any>} Result of the script execution
   */
  async evaluate(script, ...args) {
    return await this.page.evaluate(script, ...args);
  }
  
  /**
   * Wait for a specific condition to be true
   * @param {Function} conditionFn - Function that returns a boolean
   * @param {Object} options - Options
   * @returns {Promise<void>}
   */
  async waitForCondition(conditionFn, options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const pollInterval = options.pollInterval || 100;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.evaluate(conditionFn);
        if (result) {
          return;
        }
      } catch (error) {
        // Ignore errors in condition function
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Timed out waiting for condition after ${timeout}ms`);
  }
  
  /**
   * Upload a file
   * @param {string} selector - File input selector
   * @param {string|Array<string>} filePaths - Path(s) to file(s) to upload
   * @param {Object} options - Upload options
   */
  async uploadFile(selector, filePaths, options = {}) {
    await this.waitForElement(selector, options.timeout);
    await this.page.setInputFiles(selector, filePaths, options);
  }
  
  /**
   * Handle an alert dialog
   * @param {string} action - Action to take: 'accept', 'dismiss', or 'fill'
   * @param {string} promptText - Text to enter for prompt dialogs
   * @param {Object} options - Dialog options
   */
  async handleAlert(action = 'accept', promptText = '', options = {}) {
    // Set up dialog handler
    await this.page.once('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept(promptText);
      } else if (action === 'dismiss') {
        await dialog.dismiss();
      } else if (action === 'fill' && promptText) {
        await dialog.accept(promptText);
      }
    });
  }
  
  /**
   * Switch to an iframe
   * @param {string} selector - Iframe selector
   * @param {Object} options - Options
   * @returns {Promise<import('@playwright/test').Frame>} Frame object
   */
  async switchToFrame(selector, options = {}) {
    await this.waitForElement(selector, options.timeout);
    const frameElement = await this.page.$(selector);
    const frame = await frameElement.contentFrame();
    return frame;
  }
  
  /**
   * Verify text exists on the page
   * @param {string} text - Text to verify
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if text exists
   */
  async verifyText(text, options = {}) {
    const locator = this.page.getByText(text, options);
    return await locator.isVisible({ timeout: options.timeout || this.defaultTimeout });
  }
  
  /**
   * Handle autocomplete by typing and selecting an option
   * @param {string} inputSelector - Input field selector
   * @param {string} text - Text to type
   * @param {string} optionSelector - Option selector to click after typing
   * @param {Object} options - Options
   */
  async handleAutocomplete(inputSelector, text, optionSelector, options = {}) {
    await this.fill(inputSelector, text, options);
    
    // Wait for autocomplete options to appear
    const delay = options.delay || 500;
    await this.page.waitForTimeout(delay);
    
    // Click the option
    await this.click(optionSelector, options);
  }
}

module.exports = WebInteractions;