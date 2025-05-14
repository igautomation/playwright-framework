const { test, expect } = require('@playwright/test');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

test.describe('CLI Scraper @validation', () => {
  const cliPath = path.resolve(process.cwd(), 'src/cli/scrape.js');
  const testDataDir = path.resolve(process.cwd(), 'data/extracted/test-cli');
  const testSnapshotDir = path.resolve(process.cwd(), 'snapshots/test-cli');
  
  // Ensure directories exist
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  if (!fs.existsSync(path.join(testDataDir, 'json'))) {
    fs.mkdirSync(path.join(testDataDir, 'json'), { recursive: true });
  }
  if (!fs.existsSync(testSnapshotDir)) {
    fs.mkdirSync(testSnapshotDir, { recursive: true });
  }
  
  // Create test server for consistent testing
  let server;
  let baseUrl;
  
  test.beforeAll(async () => {
    // Create a simple HTTP server for testing
    const http = require('http');
    server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      
      if (req.url === '/table') {
        res.end(`
          <html>
            <head>
              <title>Test Table Page</title>
              <meta name="description" content="Test description">
            </head>
            <body>
              <table id="test-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Item 1</td>
                    <td>100</td>
                  </tr>
                  <tr>
                    <td>Item 2</td>
                    <td>200</td>
                  </tr>
                </tbody>
              </table>
            </body>
          </html>
        `);
      } else if (req.url === '/links') {
        res.end(`
          <html>
            <head>
              <title>Test Links Page</title>
            </head>
            <body>
              <a href="/page1" id="link1">Link 1</a>
              <a href="/page2" id="link2">Link 2</a>
            </body>
          </html>
        `);
      } else if (req.url === '/form') {
        res.end(`
          <html>
            <head>
              <title>Test Form Page</title>
            </head>
            <body>
              <form id="test-form" action="/submit" method="post">
                <input type="text" name="username" value="testuser">
                <input type="password" name="password">
                <select name="country">
                  <option value="us">USA</option>
                  <option value="ca" selected>Canada</option>
                </select>
                <button type="submit">Submit</button>
              </form>
            </body>
          </html>
        `);
      } else {
        res.end(`
          <html>
            <head>
              <title>Test Page</title>
              <meta name="description" content="Test description">
              <meta property="og:title" content="OG Title">
            </head>
            <body>
              <h1>Test Heading</h1>
              <p class="content">Paragraph 1</p>
              <p class="content">Paragraph 2</p>
              <img src="/image1.jpg" alt="Image 1">
              <img src="/image2.jpg" alt="Image 2">
            </body>
          </html>
        `);
      }
    });
    
    await new Promise(resolve => {
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });
  
  test.afterAll(async () => {
    // Close the server
    await new Promise(resolve => server.close(resolve));
    
    // Clean up test directories
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    if (fs.existsSync(testSnapshotDir)) {
      fs.rmSync(testSnapshotDir, { recursive: true, force: true });
    }
  });
  
  test.beforeEach(() => {
    // Clean up test directories before each test
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    if (fs.existsSync(testSnapshotDir)) {
      fs.rmSync(testSnapshotDir, { recursive: true, force: true });
    }
  });
  
  test('should extract table data', async () => {
    const outputFile = path.join(testDataDir, 'json', 'test-table.json');
    
    const { stdout, stderr } = await execPromise(
      `node ${cliPath} table ${baseUrl}/table "#test-table" -o test-table.json --data-dir ${testDataDir}`
    );
    
    expect(stderr).not.toContain('Error');
    expect(stdout).toContain('Extracted 2 rows from table');
    
    expect(fs.existsSync(outputFile)).toBeTruthy();
    
    const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    expect(data).toHaveLength(2);
    expect(data[0].Name).toBe('Item 1');
    expect(data[1].Value).toBe('200');
  });
  
  test('should extract links', async () => {
    const outputFile = path.join(testDataDir, 'json', 'test-links.json');
    
    const { stdout, stderr } = await execPromise(
      `node ${cliPath} links ${baseUrl}/links -o test-links.json --data-dir ${testDataDir}`
    );
    
    expect(stderr).not.toContain('Error');
    expect(stdout).toContain('Extracted 2 links');
    
    expect(fs.existsSync(outputFile)).toBeTruthy();
    
    const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    expect(data).toHaveLength(2);
    expect(data[0].text).toBe('Link 1');
    expect(data[1].id).toBe('link2');
  });
  
  test('should extract text content', async () => {
    const outputFile = path.join(testDataDir, 'json', 'test-text.json');
    
    const { stdout, stderr } = await execPromise(
      `node ${cliPath} text ${baseUrl} "p.content" -o test-text.json --data-dir ${testDataDir}`
    );
    
    expect(stderr).not.toContain('Error');
    expect(stdout).toContain('Extracted 2 text elements');
    
    expect(fs.existsSync(outputFile)).toBeTruthy();
    
    const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    expect(data).toHaveLength(2);
    expect(data[0]).toBe('Paragraph 1');
    expect(data[1]).toBe('Paragraph 2');
  });
  
  test('should extract metadata', async () => {
    const outputFile = path.join(testDataDir, 'json', 'test-metadata.json');
    
    const { stdout, stderr } = await execPromise(
      `node ${cliPath} metadata ${baseUrl} -o test-metadata.json --data-dir ${testDataDir}`
    );
    
    expect(stderr).not.toContain('Error');
    expect(stdout).toContain('Extracted metadata');
    
    expect(fs.existsSync(outputFile)).toBeTruthy();
    
    const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    expect(data.title).toBe('Test Page');
    expect(data.description).toBe('Test description');
    expect(data['og:title']).toBe('OG Title');
  });
  
  test('should extract images', async () => {
    const outputFile = path.join(testDataDir, 'json', 'test-images.json');
    
    const { stdout, stderr } = await execPromise(
      `node ${cliPath} images ${baseUrl} -o test-images.json --data-dir ${testDataDir}`
    );
    
    expect(stderr).not.toContain('Error');
    expect(stdout).toContain('Extracted 2 images');
    
    expect(fs.existsSync(outputFile)).toBeTruthy();
    
    const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    expect(data).toHaveLength(2);
    expect(data[0].alt).toBe('Image 1');
    expect(data[1].alt).toBe('Image 2');
  });
  
  test('should save DOM snapshot', async () => {
    const { stdout, stderr } = await execPromise(
      `node ${cliPath} snapshot ${baseUrl} test-snapshot --snapshot-dir ${testSnapshotDir}`
    );
    
    expect(stderr).not.toContain('Error');
    expect(stdout).toContain('Snapshot saved to');
    
    // Check if a snapshot file was created
    const files = fs.readdirSync(testSnapshotDir);
    expect(files.length).toBe(1);
    expect(files[0]).toContain('test-snapshot-');
    expect(files[0]).toContain('.html');
    
    // Check snapshot content
    const snapshotContent = fs.readFileSync(path.join(testSnapshotDir, files[0]), 'utf8');
    expect(snapshotContent).toContain('<title>Test Page</title>');
    expect(snapshotContent).toContain('<h1>Test Heading</h1>');
  });
  
  test('should extract form data', async () => {
    const outputFile = path.join(testDataDir, 'json', 'test-form.json');
    
    const { stdout, stderr } = await execPromise(
      `node ${cliPath} form ${baseUrl}/form "#test-form" -o test-form.json --data-dir ${testDataDir}`
    );
    
    expect(stderr).not.toContain('Error');
    expect(stdout).toContain('Extracted form data');
    
    expect(fs.existsSync(outputFile)).toBeTruthy();
    
    const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    expect(data.id).toBe('test-form');
    expect(data.method).toBe('post');
    expect(data.fields).toHaveLength(3); // Updated to match actual fields (username, password, country)
    
    const username = data.fields.find(f => f.name === 'username');
    expect(username.value).toBe('testuser');
    
    const country = data.fields.find(f => f.name === 'country');
    expect(country.options).toHaveLength(2);
    expect(country.options[1].value).toBe('ca');
    expect(country.options[1].selected).toBe(true);
  });
  
  test('should extract structured data', async () => {
    const outputFile = path.join(testDataDir, 'json', 'test-structured.json');
    
    const { stdout, stderr } = await execPromise(
      `node ${cliPath} structured ${baseUrl} '{"heading":"h1","paragraphs":"p.content"}' -o test-structured.json --data-dir ${testDataDir}`
    );
    
    expect(stderr).not.toContain('Error');
    expect(stdout).toContain('Extracted structured data');
    
    expect(fs.existsSync(outputFile)).toBeTruthy();
    
    const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    expect(data.heading).toBe('Test Heading');
    expect(data.paragraphs).toBe('Paragraph 1');
  });
});