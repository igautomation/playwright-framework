const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

/**
 * DOM Comparison Utilities for Playwright
 *
 * This utility compares DOM snapshots and updates locators automatically.
 * It helps maintain tests when the application UI changes.
 */
class DOMComparisonUtils {
  /**
   * Constructor
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    this.snapshotDir = path.resolve(process.cwd(), 'snapshots');
    this.locatorsDir = path.resolve(process.cwd(), 'data/locators');

    // Create directories if they don't exist
    [this.snapshotDir, this.locatorsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Capture current DOM
   * @param {string} pageName - Page name
   * @returns {Promise<string>} Path to the snapshot
   */
  async captureDom(pageName) {
    try {
      logger.info(`Capturing DOM for page: ${pageName}`);

      // Get HTML content
      const html = await this.page.content();

      // Generate filename
      const filename = `${pageName}-current.html`;
      const filepath = path.join(this.snapshotDir, filename);

      // Save snapshot
      fs.writeFileSync(filepath, html);

      logger.info(`DOM snapshot saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to capture DOM for page: ${pageName}`, error);
      throw error;
    }
  }

  /**
   * Extract locators from DOM
   * @returns {Promise<Object>} Extracted locators
   */
  async extractLocators() {
    try {
      logger.info('Extracting locators from DOM');

      // Use page.evaluate to extract locators
      return await this.page.evaluate(() => {
        const locators = {};

        // Extract elements with ID
        const elementsWithId = document.querySelectorAll('[id]');
        elementsWithId.forEach((element) => {
          const id = element.id;
          if (id) {
            locators[`${element.tagName.toLowerCase()}-${id}`] = `#${id}`;
          }
        });

        // Extract elements with data-testid
        const elementsWithTestId = document.querySelectorAll('[data-testid]');
        elementsWithTestId.forEach((element) => {
          const testId = element.getAttribute('data-testid');
          if (testId) {
            locators[`${element.tagName.toLowerCase()}-${testId}`] =
              `[data-testid="${testId}"]`;
          }
        });

        // Extract elements with name
        const elementsWithName = document.querySelectorAll('[name]');
        elementsWithName.forEach((element) => {
          const name = element.getAttribute('name');
          if (name) {
            locators[`${element.tagName.toLowerCase()}-${name}`] =
              `[name="${name}"]`;
          }
        });

        // Extract elements with class
        const elementsWithClass = document.querySelectorAll('[class]');
        elementsWithClass.forEach((element) => {
          const className = element.className;
          if (className && typeof className === 'string' && className.trim()) {
            // Use the first class name only
            const firstClass = className.split(' ')[0];
            if (firstClass) {
              const key = `${element.tagName.toLowerCase()}-class-${firstClass}`;
              if (!locators[key]) {
                locators[key] = `.${firstClass}`;
              }
            }
          }
        });

        // Extract elements with specific attributes
        const attributesToExtract = [
          'role',
          'aria-label',
          'title',
          'placeholder',
        ];
        attributesToExtract.forEach((attr) => {
          const elements = document.querySelectorAll(`[${attr}]`);
          elements.forEach((element) => {
            const value = element.getAttribute(attr);
            if (value) {
              const key = `${element.tagName.toLowerCase()}-${attr}-${value.replace(/\s+/g, '-')}`;
              if (!locators[key]) {
                locators[key] = `[${attr}="${value}"]`;
              }
            }
          });
        });

        return locators;
      });
    } catch (error) {
      logger.error('Failed to extract locators from DOM', error);
      throw error;
    }
  }

  /**
   * Compare DOM snapshots and update locators
   * @param {string} pageName - Page name
   * @returns {Promise<Object>} Updated locators
   */
  async compareAndUpdateLocators(pageName) {
    try {
      logger.info(`Comparing DOM snapshots for page: ${pageName}`);

      // Capture current DOM
      const currentSnapshotPath = await this.captureDom(pageName);

      // Extract locators from current DOM
      const currentLocators = await this.extractLocators();

      // Check if previous snapshot exists
      const previousSnapshotPath = path.join(
        this.snapshotDir,
        `${pageName}-previous.html`
      );
      if (!fs.existsSync(previousSnapshotPath)) {
        // No previous snapshot, save current as previous
        fs.copyFileSync(currentSnapshotPath, previousSnapshotPath);

        // Save locators
        this.saveLocators(pageName, currentLocators);

        return currentLocators;
      }

      // Load previous locators
      const previousLocators = this.loadLocators(pageName);

      // Compare locators
      const updatedLocators = {};
      const changedLocators = {};
      const removedLocators = {};
      const addedLocators = {};

      // Find changed and removed locators
      Object.entries(previousLocators).forEach(([key, value]) => {
        if (!currentLocators[key]) {
          // Locator no longer exists
          removedLocators[key] = value;
        } else if (currentLocators[key] !== value) {
          // Locator changed
          changedLocators[key] = {
            previous: value,
            current: currentLocators[key],
          };
          updatedLocators[key] = currentLocators[key];
        } else {
          // Locator unchanged
          updatedLocators[key] = value;
        }
      });

      // Find added locators
      Object.entries(currentLocators).forEach(([key, value]) => {
        if (!previousLocators[key]) {
          // New locator
          addedLocators[key] = value;
          updatedLocators[key] = value;
        }
      });

      // Log changes
      if (Object.keys(changedLocators).length > 0) {
        logger.info(
          `Found ${Object.keys(changedLocators).length} changed locators`
        );
        logger.debug('Changed locators:', changedLocators);
      }

      if (Object.keys(removedLocators).length > 0) {
        logger.info(
          `Found ${Object.keys(removedLocators).length} removed locators`
        );
        logger.debug('Removed locators:', removedLocators);
      }

      if (Object.keys(addedLocators).length > 0) {
        logger.info(`Found ${Object.keys(addedLocators).length} new locators`);
        logger.debug('Added locators:', addedLocators);
      }

      // Save updated locators
      this.saveLocators(pageName, updatedLocators);

      // Update previous snapshot
      fs.copyFileSync(currentSnapshotPath, previousSnapshotPath);

      return updatedLocators;
    } catch (error) {
      logger.error(
        `Failed to compare DOM snapshots for page: ${pageName}`,
        error
      );
      throw error;
    }
  }

  /**
   * Save locators to file
   * @param {string} pageName - Page name
   * @param {Object} locators - Locators to save
   */
  saveLocators(pageName, locators) {
    try {
      logger.info(`Saving locators for page: ${pageName}`);

      const locatorsPath = path.join(this.locatorsDir, `${pageName}.json`);
      fs.writeFileSync(locatorsPath, JSON.stringify(locators, null, 2));

      logger.info(`Locators saved to: ${locatorsPath}`);
    } catch (error) {
      logger.error(`Failed to save locators for page: ${pageName}`, error);
      throw error;
    }
  }

  /**
   * Load locators from file
   * @param {string} pageName - Page name
   * @returns {Object} Loaded locators
   */
  loadLocators(pageName) {
    try {
      logger.info(`Loading locators for page: ${pageName}`);

      const locatorsPath = path.join(this.locatorsDir, `${pageName}.json`);

      if (!fs.existsSync(locatorsPath)) {
        logger.warn(`No locators file found for page: ${pageName}`);
        return {};
      }

      const locators = JSON.parse(fs.readFileSync(locatorsPath, 'utf8'));

      logger.info(
        `Loaded ${Object.keys(locators).length} locators for page: ${pageName}`
      );
      return locators;
    } catch (error) {
      logger.error(`Failed to load locators for page: ${pageName}`, error);
      throw error;
    }
  }

  /**
   * Find alternative locators for an element
   * @param {string} selector - Original selector
   * @returns {Promise<Array<string>>} Alternative selectors
   */
  async findAlternativeLocators(selector) {
    try {
      logger.info(`Finding alternative locators for: ${selector}`);

      // Try to find the element with the original selector
      const element = this.page.locator(selector);
      const count = await element.count();

      if (count === 0) {
        logger.warn(`Element not found with selector: ${selector}`);
        return [];
      }

      // Get alternative locators
      return await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return [];

        const alternatives = [];

        // Try ID
        if (element.id) {
          alternatives.push(`#${element.id}`);
        }

        // Try data-testid
        const testId = element.getAttribute('data-testid');
        if (testId) {
          alternatives.push(`[data-testid="${testId}"]`);
        }

        // Try name
        const name = element.getAttribute('name');
        if (name) {
          alternatives.push(`[name="${name}"]`);
        }

        // Try class
        if (
          element.className &&
          typeof element.className === 'string' &&
          element.className.trim()
        ) {
          const classes = element.className.split(' ');
          if (classes.length > 0) {
            alternatives.push(`.${classes[0]}`);
          }
        }

        // Try tag and text content
        const text = element.textContent.trim();
        if (text) {
          alternatives.push(
            `${element.tagName.toLowerCase()}:has-text("${text}")`
          );
        }

        // Try role
        const role = element.getAttribute('role');
        if (role) {
          alternatives.push(`[role="${role}"]`);
        }

        // Try aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) {
          alternatives.push(`[aria-label="${ariaLabel}"]`);
        }

        return alternatives;
      }, selector);
    } catch (error) {
      logger.error(
        `Failed to find alternative locators for: ${selector}`,
        error
      );
      return [];
    }
  }
}

module.exports = DOMComparisonUtils;
