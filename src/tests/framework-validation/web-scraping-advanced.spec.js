const { test, expect } = require('@playwright/test');
const WebScrapingUtils = require('../../utils/web/webScrapingUtils');
const fs = require('fs');
const path = require('path');
const http = require('http');

test.describe('Advanced Web Scraping Utils @validation', () => {
  test('should extract metadata', async ({ page }) => {
    // Set up test page with metadata
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="description" content="Test description">
        <meta name="keywords" content="test, playwright, scraping">
        <meta property="og:title" content="Open Graph Title">
        <meta property="og:description" content="Open Graph Description">
        <title>Test Page Title</title>
        <link rel="canonical" href="https://example.com/test-page" />
      </head>
      <body>
        <h1>Test Page</h1>
      </body>
      </html>
    `);

    const webScrapingUtils = new WebScrapingUtils(page);
    const metadata = await webScrapingUtils.extractMetadata();

    expect(metadata.title).toBe('Test Page Title');
    expect(metadata.description).toBe('Test description');
    expect(metadata.keywords).toBe('test, playwright, scraping');
    expect(metadata['og:title']).toBe('Open Graph Title');
    expect(metadata['og:description']).toBe('Open Graph Description');
    expect(metadata.canonicalUrl).toBe('https://example.com/test-page');
    expect(metadata.language).toBe('en');
  });

  test('should extract images', async ({ page }) => {
    // Set up test page with images
    await page.setContent(`
      <div>
        <img src="https://example.com/image1.jpg" alt="Image 1" id="img1" class="test-img" width="100" height="100">
        <img src="https://example.com/image2.jpg" alt="Image 2" id="img2" loading="lazy">
      </div>
    `);

    const webScrapingUtils = new WebScrapingUtils(page);
    const images = await webScrapingUtils.extractImages();

    expect(images).toHaveLength(2);
    expect(images[0].src).toContain('image1.jpg');
    expect(images[0].alt).toBe('Image 1');
    expect(images[0].id).toBe('img1');
    expect(images[0].className).toBe('test-img');
    expect(images[0].width).toBe(100);
    expect(images[0].height).toBe(100);
    
    expect(images[1].src).toContain('image2.jpg');
    expect(images[1].alt).toBe('Image 2');
    expect(images[1].id).toBe('img2');
    expect(images[1].loading).toBe('lazy');
  });

  test('should extract form data', async ({ page }) => {
    // Set up test page with a form
    await page.setContent(`
      <form id="test-form" action="https://example.com/submit" method="post" name="testForm">
        <input type="text" name="username" id="username" value="testuser" required>
        <input type="password" name="password" id="password" value="" required>
        <input type="checkbox" name="remember" id="remember" checked>
        <input type="radio" name="gender" id="male" value="male" checked>
        <input type="radio" name="gender" id="female" value="female">
        <select name="country" id="country">
          <option value="us">United States</option>
          <option value="ca" selected>Canada</option>
          <option value="uk">United Kingdom</option>
        </select>
        <textarea name="comments" id="comments">Test comment</textarea>
        <input type="submit" value="Submit">
      </form>
    `);

    const webScrapingUtils = new WebScrapingUtils(page);
    const formData = await webScrapingUtils.extractFormData('#test-form');

    expect(formData.id).toBe('test-form');
    expect(formData.action).toContain('example.com/submit');
    expect(formData.method).toBe('post');
    expect(formData.name).toBe('testForm');
    
    expect(formData.fields).toHaveLength(8);
    
    const username = formData.fields.find(f => f.id === 'username');
    expect(username.name).toBe('username');
    expect(username.type).toBe('text');
    expect(username.value).toBe('testuser');
    expect(username.required).toBe(true);
    
    const remember = formData.fields.find(f => f.id === 'remember');
    expect(remember.type).toBe('checkbox');
    expect(remember.checked).toBe(true);
    
    const country = formData.fields.find(f => f.id === 'country');
    expect(country.type).toBe('select');
    expect(country.options).toHaveLength(3);
    expect(country.options[1].value).toBe('ca');
    expect(country.options[1].selected).toBe(true);
  });

  test('should compare DOM snapshots', async ({ page }) => {
    // Create two similar snapshots
    await page.setContent('<div><h1>Test Page</h1><p>Content 1</p></div>');
    const webScrapingUtils = new WebScrapingUtils(page);
    const snapshot1Path = await webScrapingUtils.saveDOMSnapshot('test-snapshot1');
    
    await page.setContent('<div><h1>Test Page</h1><p>Content 2</p></div>');
    const snapshot2Path = await webScrapingUtils.saveDOMSnapshot('test-snapshot2');
    
    // Compare snapshots
    const comparison = await webScrapingUtils.compareDOMSnapshots(snapshot1Path, snapshot2Path);
    
    expect(comparison.identical).toBe(false);
    expect(comparison.snapshot1Size).toBeGreaterThan(0);
    expect(comparison.snapshot2Size).toBeGreaterThan(0);
    
    // Create identical snapshots
    await page.setContent('<div><h1>Identical</h1></div>');
    const snapshot3Path = await webScrapingUtils.saveDOMSnapshot('test-snapshot3');
    const snapshot4Path = await webScrapingUtils.saveDOMSnapshot('test-snapshot4');
    
    const identicalComparison = await webScrapingUtils.compareDOMSnapshots(snapshot3Path, snapshot4Path);
    expect(identicalComparison.identical).toBe(true);
    
    // Clean up
    fs.unlinkSync(snapshot1Path);
    fs.unlinkSync(snapshot2Path);
    fs.unlinkSync(snapshot3Path);
    fs.unlinkSync(snapshot4Path);
  });

  test('should extract data with JSON path', async ({ page }) => {
    // Set up test page with nested data
    await page.setContent(`
      <div>
        <div id="product">
          <h1 class="product-name">Test Product</h1>
          <span class="product-price">$99.99</span>
          <div class="product-details">
            <span class="sku">SKU123456</span>
            <span class="availability">In Stock</span>
          </div>
        </div>
      </div>
    `);

    const webScrapingUtils = new WebScrapingUtils(page);
    const data = await webScrapingUtils.extractDataWithJsonPath({
      'product.name': '.product-name',
      'product.price': '.product-price',
      'product.details.sku': '.sku',
      'product.details.availability': '.availability'
    });

    expect(data.product.name).toBe('Test Product');
    expect(data.product.price).toBe('$99.99');
    expect(data.product.details.sku).toBe('SKU123456');
    expect(data.product.details.availability).toBe('In Stock');
  });

  test('should save DOM snapshot with options', async ({ page }) => {
    // Set up test page with styles
    await page.setContent(`
      <style>
        body { font-family: Arial; }
        h1 { color: blue; }
      </style>
      <div>
        <h1>Test Page</h1>
        <p>This is a test page</p>
      </div>
    `);

    const webScrapingUtils = new WebScrapingUtils(page);
    
    // Save with styles
    const snapshotWithStyles = await webScrapingUtils.saveDOMSnapshot('test-with-styles', { includeStyles: true });
    const contentWithStyles = fs.readFileSync(snapshotWithStyles, 'utf8');
    expect(contentWithStyles).toContain('<style>');
    
    // Save without styles
    const snapshotWithoutStyles = await webScrapingUtils.saveDOMSnapshot('test-without-styles', { includeStyles: false });
    const contentWithoutStyles = fs.readFileSync(snapshotWithoutStyles, 'utf8');
    expect(contentWithoutStyles).not.toContain('<style>');
    
    // Clean up
    fs.unlinkSync(snapshotWithStyles);
    fs.unlinkSync(snapshotWithoutStyles);
  });
});