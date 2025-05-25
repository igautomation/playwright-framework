/**
 * Web Scraping Utilities for Playwright
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const logger = require('../common/logger');

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
   * @param {Object} options - Options for extraction
   * @returns {Promise<Array<Object>>} Extracted data
   */
  async extractTableData(tableSelector, options = {}) {
    try {
      logger.info(`Extracting data from table: ${tableSelector}`);

      return await this.page.evaluate((selector, opts) => {
        const table = document.querySelector(selector);
        if (!table) return [];

        // Get headers from th elements or first row if specified
        let headers;
        if (opts.headerRow === 'first') {
          const firstRow = table.querySelector('tr');
          headers = Array.from(firstRow.querySelectorAll('td, th')).map(cell => 
            cell.textContent.trim());
        } else {
          headers = Array.from(table.querySelectorAll('th')).map(th => 
            th.textContent.trim());
        }
        
        // If no headers found and createHeaders is true, generate them
        if (headers.length === 0 && opts.createHeaders) {
          const firstRow = table.querySelector('tr');
          const cellCount = firstRow ? firstRow.querySelectorAll('td, th').length : 0;
          headers = Array(cellCount).fill(0).map((_, i) => `column${i + 1}`);
        }

        // Get rows (skip header row if needed)
        const rows = Array.from(table.querySelectorAll('tbody tr, tr')).filter((row, index) => {
          if (opts.headerRow === 'first' && index === 0) return false;
          return true;
        });

        return rows.map((row) => {
          const cells = Array.from(row.querySelectorAll('td, th')).map(cell => {
            // Extract cell content based on options
            if (opts.extractHtml) {
              return cell.innerHTML;
            } else if (opts.extractLinks && cell.querySelector('a')) {
              const link = cell.querySelector('a');
              return {
                text: link.textContent.trim(),
                href: link.href
              };
            } else {
              return cell.textContent.trim();
            }
          });
          
          // Create object from headers and cells
          return headers.reduce((obj, header, index) => {
            obj[header] = cells[index] !== undefined ? cells[index] : null;
            return obj;
          }, {});
        });
      }, tableSelector, options);
    } catch (error) {
      logger.error(`Failed to extract table data from: ${tableSelector}`, error);
      throw error;
    }
  }

  /**
   * Extract links from a page
   * @param {string} selector - Links selector
   * @param {Object} options - Options for extraction
   * @returns {Promise<Array<Object>>} Extracted links
   */
  async extractLinks(selector = 'a', options = {}) {
    try {
      logger.info(`Extracting links with selector: ${selector}`);

      return await this.page.evaluate((sel, opts) => {
        const links = Array.from(document.querySelectorAll(sel));
        return links.map((link) => {
          const result = {
            text: link.textContent.trim(),
            href: link.href
          };
          
          // Add additional properties if requested
          if (opts.includeAttributes) {
            result.id = link.id;
            result.className = link.className;
            result.target = link.target;
            result.rel = link.rel;
            result.title = link.title;
          }
          
          // Add data attributes if requested
          if (opts.includeDataAttributes) {
            result.dataAttributes = {};
            Array.from(link.attributes)
              .filter(attr => attr.name.startsWith('data-'))
              .forEach(attr => {
                result.dataAttributes[attr.name] = attr.value;
              });
          }
          
          return result;
        });
      }, selector, options);
    } catch (error) {
      logger.error(`Failed to extract links with selector: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Extract text content from elements
   * @param {string} selector - Elements selector
   * @param {Object} options - Options for extraction
   * @returns {Promise<Array<string>>} Extracted text
   */
  async extractText(selector, options = {}) {
    try {
      logger.info(`Extracting text from elements: ${selector}`);

      return await this.page.evaluate((sel, opts) => {
        const elements = Array.from(document.querySelectorAll(sel));
        
        if (opts.asObject) {
          return elements.map((el, index) => ({
            index,
            text: el.textContent.trim(),
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: el.className
          }));
        }
        
        return elements.map((el) => el.textContent.trim());
      }, selector, options);
    } catch (error) {
      logger.error(`Failed to extract text from elements: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Extract structured data from a page
   * @param {Object} selectors - Map of field names to selectors
   * @param {Object} options - Options for extraction
   * @returns {Promise<Object>} Extracted data
   */
  async extractStructuredData(selectors, options = {}) {
    try {
      logger.info('Extracting structured data');

      const result = {};

      for (const [field, selector] of Object.entries(selectors)) {
        result[field] = await this.page.evaluate((sel, opts) => {
          const element = document.querySelector(sel);
          if (!element) return null;
          
          if (opts.extractHtml) {
            return element.innerHTML;
          }
          
          if (opts.extractAttribute) {
            return element.getAttribute(opts.extractAttribute);
          }
          
          return element.textContent.trim();
        }, selector, options);
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
   * @returns {Promise<string>} Path to the snapshot
   */
  async saveDOMSnapshot(name, options = {}) {
    try {
      logger.info(`Saving DOM snapshot: ${name}`);

      // Get HTML content
      let html = await this.page.content();
      
      // Process HTML based on options
      if (options.removeStyles) {
        html = html.replace(/<style[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      }
      
      if (options.removeScripts) {
        html = html.replace(/<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
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
   * @param {Object} options - Options for extraction
   * @returns {Promise<Object>} Page metadata
   */
  async extractMetadata(options = {}) {
    try {
      logger.info('Extracting page metadata');

      return await this.page.evaluate((opts) => {
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
        
        // Extract structured data if requested
        if (opts.extractStructuredData) {
          const structuredDataElements = Array.from(
            document.querySelectorAll('script[type="application/ld+json"]')
          );
          
          if (structuredDataElements.length > 0) {
            metadata.structuredData = structuredDataElements.map(el => {
              try {
                return JSON.parse(el.textContent);
              } catch (e) {
                return null;
              }
            }).filter(Boolean);
          }
        }
        
        // Extract Open Graph data if requested
        if (opts.extractOpenGraph) {
          metadata.openGraph = {};
          const ogTags = Array.from(
            document.querySelectorAll('meta[property^="og:"]')
          );
          
          ogTags.forEach(tag => {
            const property = tag.getAttribute('property');
            const content = tag.getAttribute('content');
            if (property && content) {
              metadata.openGraph[property.replace('og:', '')] = content;
            }
          });
        }
        
        return metadata;
      }, options);
    } catch (error) {
      logger.error('Failed to extract page metadata', error);
      throw error;
    }
  }

  /**
   * Extract images from page
   * @param {string} selector - Image selector
   * @param {Object} options - Options for extraction
   * @returns {Promise<Array<Object>>} Extracted images
   */
  async extractImages(selector = 'img', options = {}) {
    try {
      logger.info(`Extracting images with selector: ${selector}`);

      return await this.page.evaluate((sel, opts) => {
        const images = Array.from(document.querySelectorAll(sel));
        return images.map(img => {
          const result = {
            src: img.src,
            alt: img.alt || '',
            width: img.width,
            height: img.height
          };
          
          // Add additional properties if requested
          if (opts.includeNaturalDimensions) {
            result.naturalWidth = img.naturalWidth;
            result.naturalHeight = img.naturalHeight;
          }
          
          if (opts.includeAttributes) {
            result.id = img.id;
            result.className = img.className;
            result.loading = img.loading;
            result.complete = img.complete;
          }
          
          // Add data attributes if requested
          if (opts.includeDataAttributes) {
            result.dataAttributes = {};
            Array.from(img.attributes)
              .filter(attr => attr.name.startsWith('data-'))
              .forEach(attr => {
                result.dataAttributes[attr.name] = attr.value;
              });
          }
          
          return result;
        });
      }, selector, options);
    } catch (error) {
      logger.error(`Failed to extract images with selector: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Download file from URL
   * @param {string} url - URL to download
   * @param {string} filename - Optional filename (if not provided, will be extracted from URL)
   * @param {Object} options - Download options
   * @returns {Promise<string>} Path to downloaded file
   */
  async downloadFile(url, filename, options = {}) {
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
        
        // Set request options
        const requestOptions = {};
        
        // Add headers if provided
        if (options.headers) {
          requestOptions.headers = options.headers;
        }
        
        // Add timeout if provided
        if (options.timeout) {
          requestOptions.timeout = options.timeout;
        }
        
        httpClient.get(url, requestOptions, (response) => {
          // Handle redirects if enabled
          if (options.followRedirects && (response.statusCode === 301 || response.statusCode === 302)) {
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              fileStream.close();
              this.downloadFile(redirectUrl, filename, options)
                .then(resolve)
                .catch(reject);
              return;
            }
          }
          
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
   * @param {Object} options - Options for extraction
   * @returns {Promise<Object>} Form data
   */
  async extractFormData(formSelector, options = {}) {
    try {
      logger.info(`Extracting form data from: ${formSelector}`);

      return await this.page.evaluate((selector, opts) => {
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
            required: input.required,
            disabled: input.disabled
          };
          
          // Include value if requested
          if (!opts.excludeValues) {
            field.value = input.value;
          }
          
          // Handle select elements
          if (input.tagName === 'SELECT') {
            field.type = 'select';
            field.options = Array.from(input.options).map(option => {
              const optionData = {
                value: option.value,
                text: option.text
              };
              
              if (!opts.excludeValues) {
                optionData.selected = option.selected;
              }
              
              return optionData;
            });
          }
          
          // Handle checkboxes and radio buttons
          if (input.type === 'checkbox' || input.type === 'radio') {
            if (!opts.excludeValues) {
              field.checked = input.checked;
            }
          }
          
          // Include labels if requested
          if (opts.includeLabels) {
            const labelElement = input.id ? 
              document.querySelector(`label[for="${input.id}"]`) : null;
            
            if (labelElement) {
              field.label = labelElement.textContent.trim();
            }
          }
          
          return field;
        });
        
        return formData;
      }, formSelector, options);
    } catch (error) {
      logger.error(`Failed to extract form data from: ${formSelector}`, error);
      throw error;
    }
  }

  /**
   * Extract data using CSS selectors with JSON paths
   * @param {Object} selectorMap - Map of JSON paths to CSS selectors
   * @param {Object} options - Options for extraction
   * @returns {Promise<Object>} Extracted data
   */
  async extractDataWithJsonPath(selectorMap, options = {}) {
    try {
      logger.info('Extracting data with JSON path selectors');

      const result = {};
      
      for (const [jsonPath, selector] of Object.entries(selectorMap)) {
        // Split the JSON path
        const pathParts = jsonPath.split('.');
        
        // Get the value using the selector
        const value = await this.page.evaluate((sel, opts) => {
          const element = document.querySelector(sel);
          if (!element) return null;
          
          if (opts.extractHtml) {
            return element.innerHTML;
          }
          
          if (opts.extractAttribute) {
            return element.getAttribute(opts.extractAttribute);
          }
          
          return element.textContent.trim();
        }, selector, options);
        
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
  
  /**
   * Extract data from a list
   * @param {string} listSelector - List selector (ul, ol, dl)
   * @param {Object} options - Options for extraction
   * @returns {Promise<Array<string|Object>>} Extracted list items
   */
  async extractList(listSelector, options = {}) {
    try {
      logger.info(`Extracting list data from: ${listSelector}`);

      return await this.page.evaluate((selector, opts) => {
        const list = document.querySelector(selector);
        if (!list) return [];
        
        // Handle definition lists differently
        if (list.tagName === 'DL') {
          const items = [];
          const terms = Array.from(list.querySelectorAll('dt'));
          
          terms.forEach(term => {
            let description = '';
            let descriptionEl = term.nextElementSibling;
            
            if (descriptionEl && descriptionEl.tagName === 'DD') {
              description = descriptionEl.textContent.trim();
            }
            
            if (opts.asObject) {
              items.push({
                term: term.textContent.trim(),
                description
              });
            } else {
              items.push(`${term.textContent.trim()}: ${description}`);
            }
          });
          
          return items;
        }
        
        // Handle regular lists (ul, ol)
        const items = Array.from(list.querySelectorAll('li'));
        
        return items.map((item, index) => {
          if (opts.asObject) {
            const result = {
              index,
              text: item.textContent.trim()
            };
            
            // Extract links if present
            const links = Array.from(item.querySelectorAll('a'));
            if (links.length > 0) {
              result.links = links.map(link => ({
                text: link.textContent.trim(),
                href: link.href
              }));
            }
            
            return result;
          }
          
          return item.textContent.trim();
        });
      }, listSelector, options);
    } catch (error) {
      logger.error(`Failed to extract list data from: ${listSelector}`, error);
      throw error;
    }
  }
}

module.exports = WebScrapingUtils;