#!/usr/bin/env node

const { program } = require('commander');
const { chromium } = require('@playwright/test');
const { WebScrapingUtils, DataProvider } = require('../utils/web');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/common/logger');

// Configure CLI
program
  .name('scrape')
  .description('CLI tool for web scraping using Playwright framework')
  .version('1.0.0');

// Common options
const addCommonOptions = (command) => {
  return command
    .option('-h, --headless', 'Run in headless mode', true)
    .option('-t, --timeout <ms>', 'Navigation timeout in milliseconds', '30000')
    .option('-w, --wait <ms>', 'Wait time after page load in milliseconds', '0')
    .option('-o, --output <path>', 'Output file path')
    .option('-f, --format <format>', 'Output format (json or csv)', 'json')
    .option('--data-dir <path>', 'Data directory for saving results', path.resolve(process.cwd(), 'data/extracted'));
};

// Extract table data
program
  .command('table')
  .description('Extract data from an HTML table')
  .argument('<url>', 'URL to scrape')
  .argument('<selector>', 'CSS selector for the table')
  .action(async (url, selector, options) => {
    await scrapeTable(url, selector, options);
  });

addCommonOptions(program.commands[0]);

// Extract links
program
  .command('links')
  .description('Extract links from a page')
  .argument('<url>', 'URL to scrape')
  .argument('[selector]', 'CSS selector for links (default: "a")', 'a')
  .action(async (url, selector, options) => {
    await scrapeLinks(url, selector, options);
  });

addCommonOptions(program.commands[1]);

// Extract text
program
  .command('text')
  .description('Extract text content from elements')
  .argument('<url>', 'URL to scrape')
  .argument('<selector>', 'CSS selector for elements')
  .action(async (url, selector, options) => {
    await scrapeText(url, selector, options);
  });

addCommonOptions(program.commands[2]);

// Extract structured data
program
  .command('structured')
  .description('Extract structured data using multiple selectors')
  .argument('<url>', 'URL to scrape')
  .argument('<selectors>', 'JSON string of field-selector pairs')
  .action(async (url, selectorsStr, options) => {
    try {
      const selectors = JSON.parse(selectorsStr);
      await scrapeStructured(url, selectors, options);
    } catch (error) {
      logger.error('Invalid JSON for selectors', error);
      process.exit(1);
    }
  });

addCommonOptions(program.commands[3]);

// Extract metadata
program
  .command('metadata')
  .description('Extract metadata from a page')
  .argument('<url>', 'URL to scrape')
  .action(async (url, options) => {
    await scrapeMetadata(url, options);
  });

addCommonOptions(program.commands[4]);

// Extract images
program
  .command('images')
  .description('Extract images from a page')
  .argument('<url>', 'URL to scrape')
  .argument('[selector]', 'CSS selector for images (default: "img")', 'img')
  .option('--download', 'Download the images')
  .option('--download-dir <path>', 'Directory to save downloaded images', path.resolve(process.cwd(), 'data/extracted/downloads'))
  .action(async (url, selector, options) => {
    await scrapeImages(url, selector, options);
  });

addCommonOptions(program.commands[5]);

// Save DOM snapshot
program
  .command('snapshot')
  .description('Save a DOM snapshot of a page')
  .argument('<url>', 'URL to capture')
  .argument('<name>', 'Snapshot name')
  .option('--no-styles', 'Exclude styles from snapshot')
  .option('--minify', 'Minify the HTML output')
  .option('--snapshot-dir <path>', 'Directory to save snapshots', path.resolve(process.cwd(), 'snapshots'))
  .action(async (url, name, options) => {
    await saveSnapshot(url, name, options);
  });

addCommonOptions(program.commands[6]);

// Compare snapshots
program
  .command('compare')
  .description('Compare two DOM snapshots')
  .argument('<snapshot1>', 'Path to first snapshot')
  .argument('<snapshot2>', 'Path to second snapshot')
  .option('--no-ignore-whitespace', 'Don\'t ignore whitespace differences')
  .option('--no-ignore-comments', 'Don\'t ignore comment differences')
  .action(async (snapshot1, snapshot2, options) => {
    await compareSnapshots(snapshot1, snapshot2, options);
  });

// Extract form data
program
  .command('form')
  .description('Extract form data from a page')
  .argument('<url>', 'URL to scrape')
  .argument('<selector>', 'CSS selector for the form')
  .action(async (url, selector, options) => {
    await scrapeForm(url, selector, options);
  });

addCommonOptions(program.commands[8]);

// Parse command line arguments
program.parse();

// Helper function to initialize browser and page
async function initBrowser(options) {
  const browser = await chromium.launch({
    headless: options.headless !== false
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set navigation timeout
  page.setDefaultNavigationTimeout(parseInt(options.timeout, 10));
  
  return { browser, page };
}

// Helper function to save data
function saveData(data, options) {
  const dataProvider = new DataProvider({
    dataDir: options.dataDir
  });
  
  const filename = options.output || `scrape-result-${Date.now()}`;
  let filepath;
  
  if (options.format === 'csv' && Array.isArray(data)) {
    filepath = dataProvider.saveAsCsv(data, filename.replace(/\.csv$/, ''));
  } else {
    filepath = dataProvider.saveAsJson(data, filename.replace(/\.json$/, ''));
  }
  
  logger.info(`Data saved to: ${filepath}`);
  return filepath;
}

// Implementation of scrape commands
async function scrapeTable(url, selector, options) {
  const { browser, page } = await initBrowser(options);
  
  try {
    logger.info(`Navigating to ${url}`);
    await page.goto(url);
    
    if (options.wait > 0) {
      await page.waitForTimeout(parseInt(options.wait, 10));
    }
    
    const scraper = new WebScrapingUtils(page);
    logger.info(`Extracting table data with selector: ${selector}`);
    const data = await scraper.extractTableData(selector);
    
    saveData(data, options);
    
    logger.info(`Extracted ${data.length} rows from table`);
    console.log(data);
  } catch (error) {
    logger.error('Failed to scrape table data', error);
  } finally {
    await browser.close();
  }
}

async function scrapeLinks(url, selector, options) {
  const { browser, page } = await initBrowser(options);
  
  try {
    logger.info(`Navigating to ${url}`);
    await page.goto(url);
    
    if (options.wait > 0) {
      await page.waitForTimeout(parseInt(options.wait, 10));
    }
    
    const scraper = new WebScrapingUtils(page);
    logger.info(`Extracting links with selector: ${selector}`);
    const data = await scraper.extractLinks(selector);
    
    saveData(data, options);
    
    logger.info(`Extracted ${data.length} links`);
    console.log(data);
  } catch (error) {
    logger.error('Failed to scrape links', error);
  } finally {
    await browser.close();
  }
}

async function scrapeText(url, selector, options) {
  const { browser, page } = await initBrowser(options);
  
  try {
    logger.info(`Navigating to ${url}`);
    await page.goto(url);
    
    if (options.wait > 0) {
      await page.waitForTimeout(parseInt(options.wait, 10));
    }
    
    const scraper = new WebScrapingUtils(page);
    logger.info(`Extracting text with selector: ${selector}`);
    const data = await scraper.extractText(selector);
    
    saveData(data, options);
    
    logger.info(`Extracted ${data.length} text elements`);
    console.log(data);
  } catch (error) {
    logger.error('Failed to scrape text', error);
  } finally {
    await browser.close();
  }
}

async function scrapeStructured(url, selectors, options) {
  const { browser, page } = await initBrowser(options);
  
  try {
    logger.info(`Navigating to ${url}`);
    await page.goto(url);
    
    if (options.wait > 0) {
      await page.waitForTimeout(parseInt(options.wait, 10));
    }
    
    const scraper = new WebScrapingUtils(page);
    logger.info(`Extracting structured data with ${Object.keys(selectors).length} selectors`);
    const data = await scraper.extractStructuredData(selectors);
    
    saveData(data, options);
    
    logger.info('Extracted structured data');
    console.log(data);
  } catch (error) {
    logger.error('Failed to scrape structured data', error);
  } finally {
    await browser.close();
  }
}

async function scrapeMetadata(url, options) {
  const { browser, page } = await initBrowser(options);
  
  try {
    logger.info(`Navigating to ${url}`);
    await page.goto(url);
    
    if (options.wait > 0) {
      await page.waitForTimeout(parseInt(options.wait, 10));
    }
    
    const scraper = new WebScrapingUtils(page);
    logger.info('Extracting page metadata');
    const data = await scraper.extractMetadata();
    
    saveData(data, options);
    
    logger.info(`Extracted metadata with ${Object.keys(data).length} properties`);
    console.log(data);
  } catch (error) {
    logger.error('Failed to scrape metadata', error);
  } finally {
    await browser.close();
  }
}

async function scrapeImages(url, selector, options) {
  const { browser, page } = await initBrowser(options);
  
  try {
    logger.info(`Navigating to ${url}`);
    await page.goto(url);
    
    if (options.wait > 0) {
      await page.waitForTimeout(parseInt(options.wait, 10));
    }
    
    const scraper = new WebScrapingUtils(page, {
      downloadDir: options.downloadDir
    });
    
    logger.info(`Extracting images with selector: ${selector}`);
    const data = await scraper.extractImages(selector);
    
    saveData(data, options);
    
    logger.info(`Extracted ${data.length} images`);
    console.log(data);
    
    // Download images if requested
    if (options.download && data.length > 0) {
      logger.info('Downloading images...');
      
      for (let i = 0; i < data.length; i++) {
        const image = data[i];
        if (image.src) {
          try {
            const filename = `image-${i + 1}${path.extname(image.src) || '.jpg'}`;
            const filepath = await scraper.downloadFile(image.src, filename);
            logger.info(`Downloaded image ${i + 1} to ${filepath}`);
          } catch (error) {
            logger.error(`Failed to download image ${i + 1}: ${image.src}`, error);
          }
        }
      }
    }
  } catch (error) {
    logger.error('Failed to scrape images', error);
  } finally {
    await browser.close();
  }
}

async function saveSnapshot(url, name, options) {
  const { browser, page } = await initBrowser(options);
  
  try {
    logger.info(`Navigating to ${url}`);
    await page.goto(url);
    
    if (options.wait > 0) {
      await page.waitForTimeout(parseInt(options.wait, 10));
    }
    
    const scraper = new WebScrapingUtils(page, {
      snapshotDir: options.snapshotDir
    });
    
    logger.info(`Saving DOM snapshot: ${name}`);
    const filepath = await scraper.saveDOMSnapshot(name, {
      includeStyles: options.styles !== false,
      minify: options.minify === true
    });
    
    logger.info(`Snapshot saved to: ${filepath}`);
  } catch (error) {
    logger.error('Failed to save snapshot', error);
  } finally {
    await browser.close();
  }
}

async function compareSnapshots(snapshot1, snapshot2, options) {
  try {
    // Create a temporary page to use the WebScrapingUtils
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const scraper = new WebScrapingUtils(page);
    
    logger.info(`Comparing snapshots: ${snapshot1} and ${snapshot2}`);
    const result = await scraper.compareDOMSnapshots(snapshot1, snapshot2, {
      ignoreWhitespace: options.ignoreWhitespace !== false,
      ignoreComments: options.ignoreComments !== false
    });
    
    logger.info('Comparison result:');
    console.log(result);
    
    await browser.close();
  } catch (error) {
    logger.error('Failed to compare snapshots', error);
  }
}

async function scrapeForm(url, selector, options) {
  const { browser, page } = await initBrowser(options);
  
  try {
    logger.info(`Navigating to ${url}`);
    await page.goto(url);
    
    if (options.wait > 0) {
      await page.waitForTimeout(parseInt(options.wait, 10));
    }
    
    const scraper = new WebScrapingUtils(page);
    logger.info(`Extracting form data with selector: ${selector}`);
    const data = await scraper.extractFormData(selector);
    
    saveData(data, options);
    
    logger.info('Extracted form data');
    console.log(data);
  } catch (error) {
    logger.error('Failed to scrape form data', error);
  } finally {
    await browser.close();
  }
}