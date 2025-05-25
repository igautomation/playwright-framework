const { test, expect } = require('@playwright/test');
const WebScrapingUtils = require('./webScrapingUtils');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create temporary directories for tests
const tempDir = path.join(os.tmpdir(), `playwright-test-${Date.now()}`);
const downloadDir = path.join(tempDir, 'downloads');
const snapshotDir = path.join(tempDir, 'snapshots');

// Setup and teardown
test.beforeAll(async () => {
  fs.mkdirSync(downloadDir, { recursive: true });
  fs.mkdirSync(snapshotDir, { recursive: true });
});

test.afterAll(async () => {
  // Clean up temp directories
  fs.rmSync(tempDir, { recursive: true, force: true });
});

// Test extractTableData
test('extractTableData should extract data from a table', async ({ page }) => {
  // Setup test page with a table
  await page.setContent(`
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>30</td>
          <td>john@example.com</td>
        </tr>
        <tr>
          <td>Jane Smith</td>
          <td>25</td>
          <td>jane@example.com</td>
        </tr>
      </tbody>
    </table>
  `);
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  const data = await scraper.extractTableData('table');
  
  expect(data).toHaveLength(2);
  expect(data[0]).toEqual({
    'Name': 'John Doe',
    'Age': '30',
    'Email': 'john@example.com'
  });
  expect(data[1]).toEqual({
    'Name': 'Jane Smith',
    'Age': '25',
    'Email': 'jane@example.com'
  });
});

// Test extractLinks
test('extractLinks should extract links from a page', async ({ page }) => {
  // Setup test page with links
  await page.setContent(`
    <div>
      <a href="https://example.com">Example</a>
      <a href="https://test.com" id="test-link" data-test="value">Test</a>
    </div>
  `);
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  const links = await scraper.extractLinks('a', { includeAttributes: true, includeDataAttributes: true });
  
  expect(links).toHaveLength(2);
  expect(links[0]).toEqual({
    text: 'Example',
    href: 'https://example.com/',
    id: '',
    className: '',
    target: '',
    rel: '',
    title: ''
  });
  expect(links[1].text).toBe('Test');
  expect(links[1].href).toBe('https://test.com/');
  expect(links[1].id).toBe('test-link');
  expect(links[1].dataAttributes).toEqual({ 'data-test': 'value' });
});

// Test extractText
test('extractText should extract text content from elements', async ({ page }) => {
  // Setup test page with text elements
  await page.setContent(`
    <div>
      <p id="p1">Paragraph 1</p>
      <p id="p2" class="test-class">Paragraph 2</p>
    </div>
  `);
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  const textArray = await scraper.extractText('p');
  const textObjects = await scraper.extractText('p', { asObject: true });
  
  expect(textArray).toEqual(['Paragraph 1', 'Paragraph 2']);
  expect(textObjects).toHaveLength(2);
  expect(textObjects[0].text).toBe('Paragraph 1');
  expect(textObjects[0].id).toBe('p1');
  expect(textObjects[1].text).toBe('Paragraph 2');
  expect(textObjects[1].className).toBe('test-class');
});

// Test extractStructuredData
test('extractStructuredData should extract data using selectors', async ({ page }) => {
  // Setup test page with elements
  await page.setContent(`
    <div>
      <h1 id="title">Page Title</h1>
      <p id="description">Page description</p>
      <span id="count">42</span>
    </div>
  `);
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  const data = await scraper.extractStructuredData({
    title: '#title',
    description: '#description',
    count: '#count'
  });
  
  expect(data).toEqual({
    title: 'Page Title',
    description: 'Page description',
    count: '42'
  });
});

// Test saveDOMSnapshot
test('saveDOMSnapshot should save a snapshot of the page', async ({ page }) => {
  // Setup test page
  await page.setContent('<html><body><h1>Test Page</h1></body></html>');
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  const snapshotPath = await scraper.saveDOMSnapshot('test-snapshot');
  
  expect(fs.existsSync(snapshotPath)).toBe(true);
  const content = fs.readFileSync(snapshotPath, 'utf8');
  expect(content).toContain('<h1>Test Page</h1>');
});

// Test extractMetadata
test('extractMetadata should extract page metadata', async ({ page }) => {
  // Setup test page with metadata
  await page.setContent(`
    <html lang="en">
    <head>
      <title>Test Page</title>
      <meta name="description" content="Test description">
      <meta property="og:title" content="OG Title">
      <link rel="canonical" href="https://example.com/canonical">
    </head>
    <body></body>
    </html>
  `);
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  const metadata = await scraper.extractMetadata({ extractOpenGraph: true });
  
  expect(metadata.title).toBe('Test Page');
  expect(metadata.description).toBe('Test description');
  expect(metadata.language).toBe('en');
  expect(metadata.canonicalUrl).toBe('https://example.com/canonical');
  expect(metadata.openGraph).toBeDefined();
  expect(metadata.openGraph.title).toBe('OG Title');
});

// Test extractImages
test('extractImages should extract images from a page', async ({ page }) => {
  // Setup test page with images
  await page.setContent(`
    <div>
      <img src="https://example.com/image1.jpg" alt="Image 1" width="100" height="100">
      <img src="https://example.com/image2.jpg" alt="Image 2" id="img2" data-test="value">
    </div>
  `);
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  const images = await scraper.extractImages('img', { includeAttributes: true, includeDataAttributes: true });
  
  expect(images).toHaveLength(2);
  expect(images[0].src).toContain('image1.jpg');
  expect(images[0].alt).toBe('Image 1');
  expect(images[0].width).toBe(100);
  expect(images[0].height).toBe(100);
  expect(images[1].src).toContain('image2.jpg');
  expect(images[1].id).toBe('img2');
  expect(images[1].dataAttributes).toEqual({ 'data-test': 'value' });
});

// Test extractFormData
test('extractFormData should extract form data', async ({ page }) => {
  // Setup test page with a form
  await page.setContent(`
    <form action="/submit" method="post" id="test-form">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" value="John Doe" required>
      
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" value="john@example.com">
      
      <label for="country">Country:</label>
      <select id="country" name="country">
        <option value="us">United States</option>
        <option value="ca" selected>Canada</option>
        <option value="uk">United Kingdom</option>
      </select>
      
      <input type="checkbox" id="subscribe" name="subscribe" checked>
      <label for="subscribe">Subscribe to newsletter</label>
      
      <input type="submit" value="Submit">
    </form>
  `);
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  const formData = await scraper.extractFormData('form', { includeLabels: true });
  
  expect(formData).toBeDefined();
  expect(formData.action).toContain('/submit');
  expect(formData.method).toBe('post');
  expect(formData.id).toBe('test-form');
  expect(formData.fields).toHaveLength(5);
  
  const nameField = formData.fields.find(f => f.name === 'name');
  expect(nameField).toBeDefined();
  expect(nameField.value).toBe('John Doe');
  expect(nameField.required).toBe(true);
  expect(nameField.label).toBe('Name:');
  
  const countryField = formData.fields.find(f => f.name === 'country');
  expect(countryField).toBeDefined();
  expect(countryField.type).toBe('select');
  expect(countryField.options).toHaveLength(3);
  expect(countryField.options.find(o => o.value === 'ca').selected).toBe(true);
  
  const subscribeField = formData.fields.find(f => f.name === 'subscribe');
  expect(subscribeField).toBeDefined();
  expect(subscribeField.type).toBe('checkbox');
  expect(subscribeField.checked).toBe(true);
});

// Test extractList
test('extractList should extract list items', async ({ page }) => {
  // Setup test page with lists
  await page.setContent(`
    <ul id="simple-list">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
    
    <ul id="complex-list">
      <li>Item with <a href="https://example.com">link</a></li>
      <li>Another item</li>
    </ul>
    
    <dl id="definition-list">
      <dt>Term 1</dt>
      <dd>Definition 1</dd>
      <dt>Term 2</dt>
      <dd>Definition 2</dd>
    </dl>
  `);
  
  const scraper = new WebScrapingUtils(page, { downloadDir, snapshotDir });
  
  // Test simple list
  const simpleList = await scraper.extractList('#simple-list');
  expect(simpleList).toEqual(['Item 1', 'Item 2', 'Item 3']);
  
  // Test complex list with objects
  const complexList = await scraper.extractList('#complex-list', { asObject: true });
  expect(complexList).toHaveLength(2);
  expect(complexList[0].text).toBe('Item with link');
  expect(complexList[0].links).toHaveLength(1);
  expect(complexList[0].links[0].text).toBe('link');
  expect(complexList[0].links[0].href).toContain('example.com');
  
  // Test definition list
  const defList = await scraper.extractList('#definition-list', { asObject: true });
  expect(defList).toHaveLength(2);
  expect(defList[0].term).toBe('Term 1');
  expect(defList[0].description).toBe('Definition 1');
  expect(defList[1].term).toBe('Term 2');
  expect(defList[1].description).toBe('Definition 2');
});