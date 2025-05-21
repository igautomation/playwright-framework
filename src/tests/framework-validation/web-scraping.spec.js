const { test, expect } = require('@playwright/test');
const WebScrapingUtils = require('../../utils/web/webScrapingUtils');
const fs = require('fs');
const path = require('path');
const {
  tableFixture,
  linksFixture,
  textContentFixture,
  structuredDataFixture,
  domSnapshotFixture
} = require('../fixtures/web-scraping-fixtures');

test.describe('Web Scraping Utils @validation', () => {
  test('should extract table data', async ({ page }) => {
    // Set up test page with a table using fixture
    await page.setContent(tableFixture);
});

    const webScrapingUtils = new WebScrapingUtils(page);
    const tableData = await webScrapingUtils.extractTableData('table');

    expect(tableData).toHaveLength(2);
    expect(tableData[0]).toEqual({
      Name: 'John Doe',
      Age: '30',
      Email: 'john@example.com',
    });
    expect(tableData[1]).toEqual({
      Name: 'Jane Smith',
      Age: '25',
      Email: 'jane@example.com',
    });
  });

  test('should extract links', async ({ page }) => {
    // Set up test page with links using fixture
    await page.setContent(linksFixture);

    const webScrapingUtils = new WebScrapingUtils(page);
    const links = await webScrapingUtils.extractLinks();

    expect(links).toHaveLength(2);
    expect(links[0].text).toBe('Example Link');
    expect(links[0].id).toBe('link1');
    expect(links[1].text).toBe('Test Link');
    expect(links[1].id).toBe('link2');
  });

  test('should extract text content', async ({ page }) => {
    // Set up test page with text elements using fixture
    await page.setContent(textContentFixture);

    const webScrapingUtils = new WebScrapingUtils(page);
    const texts = await webScrapingUtils.extractText('p');

    expect(texts).toHaveLength(3);
    expect(texts[0]).toBe('First paragraph');
    expect(texts[1]).toBe('Second paragraph');
    expect(texts[2]).toBe('Third paragraph');
  });

  test('should extract structured data', async ({ page }) => {
    // Set up test page with structured data using fixture
    await page.setContent(structuredDataFixture);

    const webScrapingUtils = new WebScrapingUtils(page);
    const data = await webScrapingUtils.extractStructuredData({
      title: '#title',
      description: '#description',
      author: '#author',
    });

    expect(data).toEqual({
      title: 'Page Title',
      description: 'Page description',
      author: 'John Doe',
    });
  });

  test('should save DOM snapshot', async ({ page }) => {
    // Set up test page using fixture
    await page.setContent(domSnapshotFixture);

    const webScrapingUtils = new WebScrapingUtils(page);
    const snapshotPath = await webScrapingUtils.saveDOMSnapshot('test-page');

    // Verify snapshot was saved
    expect(fs.existsSync(snapshotPath)).toBeTruthy();

    // Verify snapshot content
    const snapshotContent = fs.readFileSync(snapshotPath, 'utf8');
    expect(snapshotContent).toContain('<h1>Test Page</h1>');
    expect(snapshotContent).toContain('<p>This is a test page</p>');

    // Clean up
    fs.unlinkSync(snapshotPath);
  });
});
