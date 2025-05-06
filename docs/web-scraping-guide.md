# Web Scraping Guide

This guide explains how to use the web scraping utilities in the Playwright framework.

## Overview

The framework provides two main classes for web scraping:

1. **WebScrapingUtils**: For extracting data from web pages
2. **DataProvider**: For saving and loading scraped data in various formats

## WebScrapingUtils

### Basic Usage

```javascript
const { test } = require('@playwright/test');
const { WebScrapingUtils } = require('../../utils/web');

test('Extract product data', async ({ page }) => {
  await page.goto('https://example.com/products');
  
  const scraper = new WebScrapingUtils(page);
  
  // Extract data from a table
  const products = await scraper.extractTableData('#products-table');
  console.log(products);
});
```

### Available Methods

#### Table Data Extraction

```javascript
const tableData = await scraper.extractTableData('table.products');
// Returns: [{ Name: 'Product 1', Price: '$99.99' }, ...]
```

#### Link Extraction

```javascript
const links = await scraper.extractLinks('nav a');
// Returns: [{ text: 'Home', href: 'https://example.com', id: 'home-link' }, ...]
```

#### Text Extraction

```javascript
const paragraphs = await scraper.extractText('p.description');
// Returns: ['First paragraph text', 'Second paragraph text', ...]
```

#### Structured Data Extraction

```javascript
const productData = await scraper.extractStructuredData({
  name: '.product-name',
  price: '.product-price',
  sku: '.product-sku'
});
// Returns: { name: 'Product Name', price: '$99.99', sku: 'SKU123' }
```

#### DOM Snapshots

```javascript
// Save a snapshot of the current page
const snapshotPath = await scraper.saveDOMSnapshot('product-page', {
  includeStyles: true,
  minify: false
});

// Compare two snapshots
const comparison = await scraper.compareDOMSnapshots(
  'snapshots/before.html',
  'snapshots/after.html',
  { ignoreWhitespace: true, ignoreComments: true }
);
// Returns: { identical: false, diffSize: '5%', ... }
```

#### Metadata Extraction

```javascript
const metadata = await scraper.extractMetadata();
// Returns: { title: 'Page Title', description: '...', 'og:image': '...', ... }
```

#### Image Extraction

```javascript
const images = await scraper.extractImages('.product-gallery img');
// Returns: [{ src: '...', alt: '...', width: 800, height: 600, ... }, ...]
```

#### Form Data Extraction

```javascript
const formData = await scraper.extractFormData('#checkout-form');
// Returns: { action: '/submit', method: 'post', fields: [...] }
```

#### File Download

```javascript
const filePath = await scraper.downloadFile('https://example.com/document.pdf', 'my-document.pdf');
// Downloads the file and returns the local path
```

#### JSON Path Data Extraction

```javascript
const nestedData = await scraper.extractDataWithJsonPath({
  'product.name': '.product-name',
  'product.price': '.product-price',
  'product.details.sku': '.sku-code',
  'product.details.availability': '.stock-status'
});
// Returns: { product: { name: '...', price: '...', details: { sku: '...', availability: '...' } } }
```

## DataProvider

The DataProvider class helps you save and load scraped data in various formats.

### Basic Usage

```javascript
const { DataProvider } = require('../../utils/web');

// Initialize with custom data directory
const dataProvider = new DataProvider({
  dataDir: './data/my-project'
});

// Save data as JSON
const jsonPath = dataProvider.saveAsJson(productData, 'products');

// Save data as CSV
const csvPath = dataProvider.saveAsCsv(tableData, 'product-table');

// Load data
const loadedData = dataProvider.loadFromJson('products');
```

### Available Methods

#### JSON Operations

```javascript
// Save as JSON with pretty printing
dataProvider.saveAsJson(data, 'filename', { pretty: true });

// Load from JSON
const data = dataProvider.loadFromJson('filename');
```

#### CSV Operations

```javascript
// Save array of objects as CSV
dataProvider.saveAsCsv(arrayOfObjects, 'filename');

// Load CSV as array of objects
const data = dataProvider.loadFromCsv('filename');
```

#### Generic Operations

```javascript
// Save data based on file extension
dataProvider.saveData(data, 'filename.json');
dataProvider.saveData(data, 'filename.csv');

// Load data based on file extension
const data = dataProvider.loadData('filename.json');
```

#### Data Management

```javascript
// Merge multiple data files
dataProvider.mergeDataFiles(
  ['products1.json', 'products2.json'],
  'all-products.json'
);

// List available data files
const allFiles = dataProvider.listDataFiles();
const jsonFiles = dataProvider.listDataFiles('json');
const csvFiles = dataProvider.listDataFiles('csv');
```

## Complete Example

Here's a complete example that shows how to scrape product data and save it:

```javascript
const { test } = require('@playwright/test');
const { WebScrapingUtils, DataProvider } = require('../../utils/web');

test('Scrape and save product data', async ({ page }) => {
  // Initialize utilities
  const scraper = new WebScrapingUtils(page);
  const dataProvider = new DataProvider();
  
  // Navigate to products page
  await page.goto('https://example.com/products');
  
  // Extract product data from table
  const products = await scraper.extractTableData('#products-table');
  
  // Extract additional metadata
  const metadata = await scraper.extractMetadata();
  
  // Save DOM snapshot for reference
  await scraper.saveDOMSnapshot('products-page');
  
  // Save the extracted data
  dataProvider.saveAsJson(products, 'products');
  dataProvider.saveAsJson(metadata, 'page-metadata');
  
  // Save as CSV for spreadsheet import
  dataProvider.saveAsCsv(products, 'products-for-spreadsheet');
  
  // Extract product images
  const images = await scraper.extractImages('.product-image');
  
  // Download the first product image
  if (images.length > 0) {
    await scraper.downloadFile(images[0].src, 'first-product.jpg');
  }
});
```

## Best Practices

1. **Error Handling**: All methods include built-in error handling and logging
2. **Performance**: Be mindful of extracting large amounts of data
3. **Selectors**: Use specific selectors to target exactly what you need
4. **Data Storage**: Use appropriate formats (JSON for complex data, CSV for tabular data)
5. **Snapshots**: Save snapshots for debugging and comparison

## Integration with Test Workflows

- Use extracted data to drive test scenarios
- Compare data between different test runs
- Validate content against expected values
- Generate test reports with extracted data