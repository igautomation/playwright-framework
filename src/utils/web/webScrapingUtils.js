const logger = require('../common/logger');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

/**
 * Web Scraping Utilities for Playwright
 */
class WebScrapingUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   * @param {Object} options - Configuration options
   * @param {string} options.downloadDir - Directory to save downloaded files
   * @param {string} options.snapshotDir - Directory to save DOM snapshots
   */
  constructor(page, options = {}) {
    this.page = page;
    this.downloadDir = options.downloadDir || path.resolve(process.cwd(), 'data/extracted/downloads');
    this.snapshotDir = options.snapshotDir || path.resolve(process.cwd(), 'snapshots');
    
    // Create directories if they don't exist
    this._ensureDirectoryExists(this.downloadDir);
    this._ensureDirectoryExists(this.snapshotDir);
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
   * Extract data from a table
   * @param {string} tableSelector - Table selector
   * @returns {Promise<Array<Object>>} Extracted data
   */
  async extractTableData(tableSelector) {
    try {
      logger.info(`Extracting data from table: ${tableSelector}`);

      return await this.page.evaluate((selector) => {
        const table = document.querySelector(selector);
        if (!table) return [];

        const headers = Array.from(table.querySelectorAll('th')).map((th) =>
          th.textContent.trim()
        );
        const rows = Array.from(table.querySelectorAll('tbody tr'));

        return rows.map((row) => {
          const cells = Array.from(row.querySelectorAll('td')).map((td) =>
            td.textContent.trim()
          );
          return headers.reduce((obj, header, index) => {
            obj[header] = cells[index];
            return obj;
          }, {});
        });
      }, tableSelector);
    } catch (error) {
      logger.error(
        `Failed to extract table data from: ${tableSelector}`,
        error
      );
      throw error;
    }
  }

  /**
   * Extract links from a page
   * @param {string} selector - Links selector
   * @returns {Promise<Array<Object>>} Extracted links
   */
  async extractLinks(selector = 'a') {
    try {
      logger.info(`Extracting links with selector: ${selector}`);

      return await this.page.evaluate((sel) => {
        const links = Array.from(document.querySelectorAll(sel));
        return links.map((link) => ({
          text: link.textContent.trim(),
          href: link.href,
          id: link.id,
          className: link.className,
        }));
      }, selector);
    } catch (error) {
      logger.error(`Failed to extract links with selector: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Extract text content from elements
   * @param {string} selector - Elements selector
   * @returns {Promise<Array<string>>} Extracted text
   */
  async extractText(selector) {
    try {
      logger.info(`Extracting text from elements: ${selector}`);

      return await this.page.evaluate((sel) => {
        const elements = Array.from(document.querySelectorAll(sel));
        return elements.map((el) => el.textContent.trim());
      }, selector);
    } catch (error) {
      logger.error(`Failed to extract text from elements: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Extract structured data from a page
   * @param {Object} selectors - Map of field names to selectors
   * @returns {Promise<Object>} Extracted data
   */
  async extractStructuredData(selectors) {
    try {
      logger.info('Extracting structured data');

      const result = {};

      for (const [field, selector] of Object.entries(selectors)) {
        result[field] = await this.page.evaluate((sel) => {
          const element = document.querySelector(sel);
          return element ? element.textContent.trim() : null;
        }, selector);
      }

      return result;
    } catch (error) {
      logger.error('Failed to extract structured data', error);
      throw error;
    }
  }

  /**
   * Save DOM snapshot
   * @param {string} name - Snapshot name
   * @param {Object} options - Options for snapshot
   * @param {boolean} options.includeStyles - Whether to include styles in the snapshot
   * @param {boolean} options.minify - Whether to minify the HTML
   * @returns {Promise<string>} Path to the snapshot
   */
  async saveDOMSnapshot(name, options = { includeStyles: true, minify: false }) {
    try {
      logger.info(`Saving DOM snapshot: ${name}`);

      // Get HTML content
      let html = await this.page.content();
      
      // Process HTML based on options
      if (!options.includeStyles) {
        html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      }
      
      if (options.minify) {
        html = html.replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .replace(/\s+>/g, '>')
          .replace(/<\s+/g, '<');
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}-${timestamp}.html`;
      const filepath = path.join(this.snapshotDir, filename);

      // Save snapshot
      fs.writeFileSync(filepath, html);

      logger.info(`DOM snapshot saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to save DOM snapshot: ${name}`, error);
      throw error;
    }
  }

  /**
   * Extract metadata from page
   * @returns {Promise<Object>} Page metadata
   */
  async extractMetadata() {
    try {
      logger.info('Extracting page metadata');

      return await this.page.evaluate(() => {
        const metadata = {};
        
        // Extract meta tags
        const metaTags = Array.from(document.querySelectorAll('meta'));
        metaTags.forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (name && content) {
            metadata[name] = content;
          }
        });
        
        // Extract title
        metadata.title = document.title;
        
        // Extract canonical URL
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          metadata.canonicalUrl = canonical.getAttribute('href');
        }
        
        // Extract language
        metadata.language = document.documentElement.lang;
        
        return metadata;
      });
    } catch (error) {
      logger.error('Failed to extract page metadata', error);
      throw error;
    }
  }

  /**
   * Extract images from page
   * @param {string} selector - Image selector
   * @returns {Promise<Array<Object>>} Extracted images
   */
  async extractImages(selector = 'img') {
    try {
      logger.info(`Extracting images with selector: ${selector}`);

      return await this.page.evaluate((sel) => {
        const images = Array.from(document.querySelectorAll(sel));
        return images.map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          id: img.id,
          className: img.className,
          loading: img.loading,
          complete: img.complete
        }));
      }, selector);
    } catch (error) {
      logger.error(`Failed to extract images with selector: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Download file from URL
   * @param {string} url - URL to download
   * @param {string} filename - Optional filename (if not provided, will be extracted from URL)
   * @returns {Promise<string>} Path to downloaded file
   */
  async downloadFile(url, filename) {
    try {
      logger.info(`Downloading file from: ${url}`);
      
      return new Promise((resolve, reject) => {
        // Determine protocol
        const httpClient = url.startsWith('https') ? https : http;
        
        // Generate filename if not provided
        if (!filename) {
          const urlObj = new URL(url);
          filename = path.basename(urlObj.pathname) || 
                    `download-${crypto.randomBytes(8).toString('hex')}`;
        }
        
        const filepath = path.join(this.downloadDir, filename);
        const fileStream = fs.createWriteStream(filepath);
        
        httpClient.get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download file: ${response.statusCode}`));
            return;
          }
          
          response.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            logger.info(`File downloaded to: ${filepath}`);
            resolve(filepath);
          });
        }).on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      });
    } catch (error) {
      logger.error(`Failed to download file from: ${url}`, error);
      throw error;
    }
  }

  /**
   * Extract form data
   * @param {string} formSelector - Form selector
   * @returns {Promise<Object>} Form data
   */
  async extractFormData(formSelector) {
    try {
      logger.info(`Extracting form data from: ${formSelector}`);

      return await this.page.evaluate((selector) => {
        const form = document.querySelector(selector);
        if (!form) return null;
        
        const formData = {
          action: form.action,
          method: form.method,
          id: form.id,
          name: form.name,
          fields: []
        };
        
        // Extract form fields
        const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
        formData.fields = inputs.map(input => {
          const field = {
            name: input.name,
            id: input.id,
            type: input.type || input.tagName.toLowerCase(),
            value: input.value,
            required: input.required,
            disabled: input.disabled
          };
          
          // Handle select elements
          if (input.tagName === 'SELECT') {
            field.type = 'select';
            field.options = Array.from(input.options).map(option => ({
              value: option.value,
              text: option.text,
              selected: option.selected
            }));
          }
          
          // Handle checkboxes and radio buttons
          if (input.type === 'checkbox' || input.type === 'radio') {
            field.checked = input.checked;
          }
          
          return field;
        });
        
        return formData;
      }, formSelector);
    } catch (error) {
      logger.error(`Failed to extract form data from: ${formSelector}`, error);
      throw error;
    }
  }

  /**
   * Compare two DOM snapshots
   * @param {string} snapshot1Path - Path to first snapshot
   * @param {string} snapshot2Path - Path to second snapshot
   * @param {Object} options - Comparison options
   * @param {boolean} options.ignoreWhitespace - Whether to ignore whitespace
   * @param {boolean} options.ignoreComments - Whether to ignore comments
   * @returns {Promise<Object>} Comparison result
   */
  async compareDOMSnapshots(snapshot1Path, snapshot2Path, options = { ignoreWhitespace: true, ignoreComments: true }) {
    try {
      logger.info(`Comparing DOM snapshots: ${snapshot1Path} and ${snapshot2Path}`);
      
      // Read snapshots
      let html1 = fs.readFileSync(snapshot1Path, 'utf8');
      let html2 = fs.readFileSync(snapshot2Path, 'utf8');
      
      // Process HTML based on options
      if (options.ignoreWhitespace) {
        html1 = html1.replace(/\s+/g, ' ').trim();
        html2 = html2.replace(/\s+/g, ' ').trim();
      }
      
      if (options.ignoreComments) {
        html1 = html1.replace(/<!--[\s\S]*?-->/g, '');
        html2 = html2.replace(/<!--[\s\S]*?-->/g, '');
      }
      
      // Compare snapshots
      const identical = html1 === html2;
      
      // Calculate difference size
      let diffSize = 0;
      if (!identical) {
        const diffChars = html1.length > html2.length ? 
          html1.length - html2.length : 
          html2.length - html1.length;
        
        diffSize = Math.round((diffChars / Math.max(html1.length, html2.length)) * 100);
      }
      
      return {
        identical,
        diffSize: `${diffSize}%`,
        snapshot1Size: html1.length,
        snapshot2Size: html2.length
      };
    } catch (error) {
      logger.error(`Failed to compare DOM snapshots`, error);
      throw error;
    }
  }

  /**
   * Extract data using CSS selectors with JSON paths
   * @param {Object} selectorMap - Map of JSON paths to CSS selectors
   * @returns {Promise<Object>} Extracted data
   */
  async extractDataWithJsonPath(selectorMap) {
    try {
      logger.info('Extracting data with JSON path selectors');

      const result = {};
      
      for (const [jsonPath, selector] of Object.entries(selectorMap)) {
        // Split the JSON path
        const pathParts = jsonPath.split('.');
        
        // Get the value using the selector
        const value = await this.page.evaluate((sel) => {
          const element = document.querySelector(sel);
          return element ? element.textContent.trim() : null;
        }, selector);
        
        // Build the nested object structure
        let current = result;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        // Set the value at the final path
        current[pathParts[pathParts.length - 1]] = value;
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to extract data with JSON path selectors', error);
      throw error;
    }
  }
}

module.exports = WebScrapingUtils;