/**
 * Localization testing utilities for Playwright
 */
const fs = require('fs');
const path = require('path');
const config = require('../../config');

/**
 * Utilities for localization testing
 */
class LocalizationUtils {
  /**
   * Constructor
   * @param {Object} page - Playwright page object
   * @param {Object} options - Configuration options
   */
  constructor(page, options = {}) {
    this.page = page;
    this.outputDir = options.outputDir || config.localization?.outputDir || path.join(process.cwd(), 'reports', 'localization');
    this.localesDir = options.localesDir || config.localization?.localesDir || path.join(process.cwd(), 'locales');
    this.defaultLocale = options.defaultLocale || config.localization?.defaultLocale || 'en';
    
    // Create directories if they don't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.localesDir)) {
      fs.mkdirSync(this.localesDir, { recursive: true });
    }
  }
  
  /**
   * Set page locale
   * @param {string} locale - Locale code (e.g., 'en-US', 'fr-FR')
   * @param {Object} options - Options
   * @returns {Promise<Object>} Browser context
   */
  async setLocale(locale, options = {}) {
    try {
      // Store the current page and context for proper cleanup
      const oldPage = this.page;
      const oldContext = oldPage.context();
      
      // Create a new browser context with the specified locale
      const context = await oldPage.context().browser().newContext({
        locale,
        ...options
      });
      
      // Create a new page in the context
      const newPage = await context.newPage();
      
      // Navigate to the same URL as the current page
      const url = oldPage.url();
      if (url && url !== 'about:blank') {
        await newPage.goto(url, { 
          waitUntil: options.waitUntil || 'networkidle'
        });
      }
      
      // Replace the current page with the new one
      this.page = newPage;
      
      // Close the old page if it's still open
      try {
        if (oldPage && !oldPage.isClosed()) {
          await oldPage.close();
        }
      } catch (e) {
        // Ignore errors when closing the old page
        console.warn(`Error closing old page: ${e.message}`);
      }
      
      console.log(`Set locale to ${locale}`);
      return context; // Return the new context for proper management
    } catch (error) {
      console.error(`Error setting locale to ${locale}:`, error);
      throw error;
    }
  }
  
  /**
   * Extract text content from page
   * @param {Object} options - Options
   * @returns {Promise<Object>} Extracted text
   */
  async extractText(options = {}) {
    try {
      // Extract text from the page
      const textContent = await this.page.evaluate(() => {
        const textNodes = {};
        
        // Helper function to get a simple selector for an element
        function getSelector(element) {
          if (element.id) {
            return `#${element.id}`;
          }
          
          let selector = element.tagName.toLowerCase();
          
          if (element.className && typeof element.className === 'string') {
            const classes = element.className.trim().split(/\s+/);
            if (classes.length > 0 && classes[0]) {
              selector += `.${classes[0]}`;
            }
          }
          
          // Add position if needed
          const siblings = element.parentNode ? Array.from(element.parentNode.children).filter(child => 
            child.tagName === element.tagName
          ) : [];
          
          if (siblings.length > 1) {
            const index = siblings.indexOf(element) + 1;
            selector += `:nth-child(${index})`;
          }
          
          return selector;
        }
        
        // Helper function to extract text from an element
        function extractTextFromElement(element, parentSelector = '') {
          // Skip script and style elements
          if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
            return;
          }
          
          const selector = parentSelector ? 
            `${parentSelector} > ${getSelector(element)}` : 
            getSelector(element);
          
          // Get direct text content (excluding child elements)
          let text = '';
          for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
              const trimmedText = node.textContent.trim();
              if (trimmedText) {
                text += trimmedText + ' ';
              }
            }
          }
          
          text = text.trim();
          
          // Store text if not empty
          if (text) {
            textNodes[selector] = text;
          }
          
          // Process child elements
          for (const child of element.children) {
            extractTextFromElement(child, selector);
          }
        }
        
        // Start extraction from body
        extractTextFromElement(document.body);
        
        return textNodes;
      });
      
      // Get current locale
      const locale = await this.page.evaluate(() => {
        return document.documentElement.lang || navigator.language || 'unknown';
      });
      
      const result = {
        url: this.page.url(),
        locale,
        timestamp: new Date().toISOString(),
        textContent
      };
      
      // Save results if path provided
      if (options.outputPath) {
        // Ensure directory exists
        const outputDir = path.dirname(options.outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(options.outputPath, JSON.stringify(result, null, 2));
      }
      
      return result;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  }
  
  /**
   * Compare text content between locales
   * @param {string} url - URL to test
   * @param {Array} locales - List of locales to test
   * @param {Object} options - Options
   * @returns {Promise<Object>} Comparison results
   */
  async compareLocales(url, locales, options = {}) {
    try {
      const results = {};
      const comparisonResults = {};
      
      // Extract text for each locale
      for (const locale of locales) {
        console.log(`Testing locale: ${locale}`);
        
        // Create a new browser context with the specified locale
        const context = await this.page.context().browser().newContext({
          locale,
          ...options.contextOptions
        });
        
        // Create a new page in the context
        const page = await context.newPage();
        
        // Navigate to the URL
        await page.goto(url, { 
          waitUntil: options.waitUntil || 'networkidle'
        });
        
        // Wait for selector if provided
        if (options.waitForSelector) {
          await page.waitForSelector(options.waitForSelector, { 
            state: 'visible',
            timeout: options.selectorTimeout || 10000
          });
        }
        
        // Extract text
        const textContent = await page.evaluate(() => {
          const textNodes = {};
          
          // Helper function to get a simple selector for an element
          function getSelector(element) {
            if (element.id) {
              return `#${element.id}`;
            }
            
            let selector = element.tagName.toLowerCase();
            
            if (element.className && typeof element.className === 'string') {
              const classes = element.className.trim().split(/\s+/);
              if (classes.length > 0 && classes[0]) {
                selector += `.${classes[0]}`;
              }
            }
            
            // Add position if needed
            const siblings = element.parentNode ? Array.from(element.parentNode.children).filter(child => 
              child.tagName === element.tagName
            ) : [];
            
            if (siblings.length > 1) {
              const index = siblings.indexOf(element) + 1;
              selector += `:nth-child(${index})`;
            }
            
            return selector;
          }
          
          // Helper function to extract text from an element
          function extractTextFromElement(element, parentSelector = '') {
            // Skip script and style elements
            if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
              return;
            }
            
            const selector = parentSelector ? 
              `${parentSelector} > ${getSelector(element)}` : 
              getSelector(element);
            
            // Get direct text content (excluding child elements)
            let text = '';
            for (const node of element.childNodes) {
              if (node.nodeType === Node.TEXT_NODE) {
                const trimmedText = node.textContent.trim();
                if (trimmedText) {
                  text += trimmedText + ' ';
                }
              }
            }
            
            text = text.trim();
            
            // Store text if not empty
            if (text) {
              textNodes[selector] = text;
            }
            
            // Process child elements
            for (const child of element.children) {
              extractTextFromElement(child, selector);
            }
          }
          
          // Start extraction from body
          extractTextFromElement(document.body);
          
          return textNodes;
        });
        
        // Take screenshot if enabled
        let screenshotPath = null;
        if (options.screenshot) {
          screenshotPath = path.join(
            this.outputDir,
            'screenshots',
            `${locale}-${Date.now()}.png`
          );
          
          // Ensure directory exists
          const screenshotDir = path.dirname(screenshotPath);
          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }
          
          await page.screenshot({ path: screenshotPath, fullPage: true });
        }
        
        // Store results
        results[locale] = {
          textContent,
          screenshotPath
        };
        
        // Close the page and context
        await page.close();
        await context.close();
      }
      
      // Compare locales
      const defaultLocale = options.defaultLocale || this.defaultLocale;
      const defaultText = results[defaultLocale]?.textContent || {};
      
      for (const locale of locales) {
        if (locale === defaultLocale) continue;
        
        const localeText = results[locale]?.textContent || {};
        const comparison = {
          missingTranslations: [],
          potentialIssues: []
        };
        
        // Check for missing translations (same as default locale)
        for (const [selector, text] of Object.entries(localeText)) {
          const defaultValue = defaultText[selector];
          
          if (defaultValue && text === defaultValue) {
            comparison.missingTranslations.push({
              selector,
              text,
              defaultText: defaultValue
            });
          }
          
          // Check for potential issues (numbers, dates, etc.)
          if (text.match(/\d+[.,]\d+/) && defaultValue && defaultValue.match(/\d+[.,]\d+/)) {
            // Check if number format might be incorrect
            const localeNumber = text.match(/\d+[.,]\d+/)[0];
            const defaultNumber = defaultValue.match(/\d+[.,]\d+/)[0];
            
            if (localeNumber === defaultNumber) {
              comparison.potentialIssues.push({
                selector,
                issue: 'number-format',
                text,
                defaultText: defaultValue
              });
            }
          }
        }
        
        comparisonResults[locale] = comparison;
      }
      
      const finalResult = {
        url,
        timestamp: new Date().toISOString(),
        locales,
        defaultLocale,
        results,
        comparisonResults
      };
      
      // Generate report if enabled
      if (options.generateReport) {
        const reportPath = options.reportPath || path.join(
          this.outputDir,
          `localization-report-${Date.now()}.html`
        );
        
        await this.generateReport(finalResult, reportPath);
        finalResult.reportPath = reportPath;
      }
      
      // Save results if path provided
      if (options.outputPath) {
        // Ensure directory exists
        const outputDir = path.dirname(options.outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(options.outputPath, JSON.stringify(finalResult, null, 2));
      }
      
      return finalResult;
    } catch (error) {
      console.error('Error comparing locales:', error);
      throw error;
    }
  }
  
  /**
   * Generate a localization test report
   * @param {Object} result - Test result
   * @param {string} outputPath - Path to save the report
   * @returns {Promise<string>} Path to the report
   */
  async generateReport(result, outputPath) {
    try {
      // Generate report path if not provided
      const reportPath = outputPath || path.join(this.outputDir, `localization-report-${Date.now()}.html`);
      
      // Ensure directory exists
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Calculate statistics
      const stats = {};
      for (const locale of result.locales) {
        if (locale === result.defaultLocale) continue;
        
        const comparison = result.comparisonResults[locale];
        stats[locale] = {
          missingTranslations: comparison.missingTranslations.length,
          potentialIssues: comparison.potentialIssues.length,
          totalTexts: Object.keys(result.results[locale].textContent).length
        };
      }
      
      // Generate HTML report
      const html = this._generateReportHtml(result, stats);
      
      // Write report to file
      fs.writeFileSync(reportPath, html);
      
      return reportPath;
    } catch (error) {
      console.error('Error generating localization report:', error);
      throw error;
    }
  }
  
  /**
   * Generate HTML report content
   * @param {Object} result - Test result
   * @param {Object} stats - Statistics
   * @returns {string} HTML content
   * @private
   */
  _generateReportHtml(result, stats) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Localization Test Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .locale-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
          }
          .locale-stat {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            flex: 1;
            min-width: 200px;
          }
          .locale-stat h3 {
            margin-top: 0;
            color: #2c3e50;
          }
          .progress-bar {
            height: 20px;
            background-color: #ecf0f1;
            border-radius: 10px;
            margin-top: 10px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background-color: #3498db;
            border-radius: 10px;
          }
          .locale-section {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .locale-section h3 {
            margin-top: 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .issue-list {
            margin-top: 15px;
          }
          .issue {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 10px;
          }
          .issue-missing {
            border-left: 5px solid #e74c3c;
          }
          .issue-potential {
            border-left: 5px solid #f39c12;
          }
          .selector {
            font-family: monospace;
            background-color: #f1f1f1;
            padding: 5px;
            border-radius: 3px;
          }
          .text-comparison {
            display: flex;
            margin-top: 10px;
            gap: 10px;
          }
          .text-box {
            flex: 1;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
          }
          .screenshots {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
          }
          .screenshot {
            max-width: 45%;
          }
          .screenshot img {
            max-width: 100%;
            border: 1px solid #ddd;
          }
          .screenshot-label {
            font-weight: bold;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <h1>Localization Test Report</h1>
        <div class="summary">
          <p><strong>URL:</strong> ${result.url}</p>
          <p><strong>Generated:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
          <p><strong>Default Locale:</strong> ${result.defaultLocale}</p>
          <p><strong>Tested Locales:</strong> ${result.locales.join(', ')}</p>
        </div>
        
        <h2>Localization Statistics</h2>
        <div class="locale-stats">
          ${Object.entries(stats).map(([locale, stat]) => `
            <div class="locale-stat">
              <h3>${locale}</h3>
              <p><strong>Total Texts:</strong> ${stat.totalTexts}</p>
              <p><strong>Missing Translations:</strong> ${stat.missingTranslations}</p>
              <p><strong>Potential Issues:</strong> ${stat.potentialIssues}</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.max(0, 100 - (stat.missingTranslations / stat.totalTexts * 100))}%"></div>
              </div>
              <p>${Math.max(0, 100 - (stat.missingTranslations / stat.totalTexts * 100)).toFixed(1)}% translated</p>
            </div>
          `).join('')}
        </div>
        
        ${result.locales.filter(locale => locale !== result.defaultLocale).map(locale => `
          <div class="locale-section">
            <h3>${locale}</h3>
            
            ${result.results[locale].screenshotPath && result.results[result.defaultLocale].screenshotPath ? `
              <h4>Screenshots</h4>
              <div class="screenshots">
                <div class="screenshot">
                  <div class="screenshot-label">Default (${result.defaultLocale})</div>
                  <img src="file://${result.results[result.defaultLocale].screenshotPath}" alt="${result.defaultLocale} Screenshot">
                </div>
                <div class="screenshot">
                  <div class="screenshot-label">${locale}</div>
                  <img src="file://${result.results[locale].screenshotPath}" alt="${locale} Screenshot">
                </div>
              </div>
            ` : ''}
            
            <h4>Missing Translations (${result.comparisonResults[locale].missingTranslations.length})</h4>
            <div class="issue-list">
              ${result.comparisonResults[locale].missingTranslations.length > 0 ? 
                result.comparisonResults[locale].missingTranslations.map(issue => `
                  <div class="issue issue-missing">
                    <p><strong>Selector:</strong> <span class="selector">${issue.selector}</span></p>
                    <div class="text-comparison">
                      <div class="text-box">
                        <strong>${result.defaultLocale}:</strong> ${issue.defaultText}
                      </div>
                      <div class="text-box">
                        <strong>${locale}:</strong> ${issue.text}
                      </div>
                    </div>
                  </div>
                `).join('') : 
                '<p>No missing translations found. Great job!</p>'
              }
            </div>
            
            <h4>Potential Issues (${result.comparisonResults[locale].potentialIssues.length})</h4>
            <div class="issue-list">
              ${result.comparisonResults[locale].potentialIssues.length > 0 ? 
                result.comparisonResults[locale].potentialIssues.map(issue => `
                  <div class="issue issue-potential">
                    <p><strong>Issue Type:</strong> ${issue.issue}</p>
                    <p><strong>Selector:</strong> <span class="selector">${issue.selector}</span></p>
                    <div class="text-comparison">
                      <div class="text-box">
                        <strong>${result.defaultLocale}:</strong> ${issue.defaultText}
                      </div>
                      <div class="text-box">
                        <strong>${locale}:</strong> ${issue.text}
                      </div>
                    </div>
                  </div>
                `).join('') : 
                '<p>No potential issues found. Great job!</p>'
              }
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
  }
  
  /**
   * Export translation strings to a locale file
   * @param {Object} textContent - Extracted text content
   * @param {string} locale - Locale code
   * @param {Object} options - Options
   * @returns {Promise<string>} Path to the locale file
   */
  async exportTranslations(textContent, locale, options = {}) {
    try {
      // Generate locale file path
      const localePath = options.outputPath || path.join(this.localesDir, `${locale}.json`);
      
      // Ensure directory exists
      const localeDir = path.dirname(localePath);
      if (!fs.existsSync(localeDir)) {
        fs.mkdirSync(localeDir, { recursive: true });
      }
      
      // Convert text content to translation keys
      const translations = {};
      
      for (const [selector, text] of Object.entries(textContent)) {
        // Generate a key from the selector and text
        const key = options.keyFormat === 'selector' ? 
          selector.replace(/[^a-zA-Z0-9]/g, '_') : 
          text.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        
        translations[key] = text;
      }
      
      // Write translations to file
      fs.writeFileSync(localePath, JSON.stringify(translations, null, 2));
      
      return localePath;
    } catch (error) {
      console.error('Error exporting translations:', error);
      throw error;
    }
  }
  
  /**
   * Check for missing translations in locale files
   * @param {Object} options - Options
   * @returns {Promise<Object>} Missing translations
   */
  async checkMissingTranslations(options = {}) {
    try {
      const defaultLocale = options.defaultLocale || this.defaultLocale;
      const localesDir = options.localesDir || this.localesDir;
      
      // Get all locale files
      const localeFiles = fs.readdirSync(localesDir)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          locale: path.basename(file, '.json'),
          path: path.join(localesDir, file)
        }));
      
      // Find default locale file
      const defaultLocaleFile = localeFiles.find(file => file.locale === defaultLocale);
      if (!defaultLocaleFile) {
        throw new Error(`Default locale file not found: ${defaultLocale}`);
      }
      
      // Load default translations
      const defaultTranslations = JSON.parse(fs.readFileSync(defaultLocaleFile.path, 'utf8'));
      const defaultKeys = Object.keys(defaultTranslations);
      
      // Check each locale file
      const results = {};
      
      for (const localeFile of localeFiles) {
        if (localeFile.locale === defaultLocale) continue;
        
        // Load translations
        const translations = JSON.parse(fs.readFileSync(localeFile.path, 'utf8'));
        const keys = Object.keys(translations);
        
        // Find missing keys
        const missingKeys = defaultKeys.filter(key => !keys.includes(key));
        
        // Find extra keys
        const extraKeys = keys.filter(key => !defaultKeys.includes(key));
        
        results[localeFile.locale] = {
          missingKeys,
          extraKeys,
          missingCount: missingKeys.length,
          extraCount: extraKeys.length,
          totalKeys: keys.length,
          completionPercentage: ((keys.length - missingKeys.length) / defaultKeys.length) * 100
        };
      }
      
      return {
        defaultLocale,
        defaultKeyCount: defaultKeys.length,
        results
      };
    } catch (error) {
      console.error('Error checking missing translations:', error);
      throw error;
    }
  }
}

module.exports = LocalizationUtils;