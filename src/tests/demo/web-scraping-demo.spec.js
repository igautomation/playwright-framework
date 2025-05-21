const { test, expect } = require('@playwright/test');
const WebScrapingUtils = require('../../utils/web/webScrapingUtils');
const fs = require('fs');
const path = require('path');

test.describe('Web Scraping Demo @demo @scraping', () => {
  test('Extract data from a table', async ({ page }) => {
    // Set up test page with a table
    await page.setContent(`
      <table id="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>Admin</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jane Smith</td>
            <td>jane@example.com</td>
            <td>User</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Bob Johnson</td>
            <td>bob@example.com</td>
            <td>Editor</td>
          </tr>
        </tbody>
      </table>
    `);
});

    // Create web scraping utils
    const webScrapingUtils = new WebScrapingUtils(page);

    // Extract table data
    const tableData = await webScrapingUtils.extractTableData('#users-table');

    // Verify extracted data
    expect(tableData).toHaveLength(3);
    expect(tableData[0]).toEqual({
      ID: '1',
      Name: 'John Doe',
      Email: 'john@example.com',
      Role: process.env.USERNAME,
    });

    console.log('Extracted table data:', tableData);

    // Save extracted data to file
    const dataDir = path.resolve(process.cwd(), 'data/extracted');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dataPath = path.join(dataDir, 'users-table.json');
    fs.writeFileSync(dataPath, JSON.stringify(tableData, null, 2));

    console.log(`Table data saved to: ${dataPath}`);
  });

  test('Extract links from a page', async ({ page }) => {
    // Set up test page with links
    await page.setContent(`
      <nav>
        <ul>
          <li><a href="/home" id="home-link">Home</a></li>
          <li><a href="/products" id="products-link">Products</a></li>
          <li><a href="/services" id="services-link">Services</a></li>
          <li><a href="/about" id="about-link">About Us</a></li>
          <li><a href="/contact" id="contact-link">Contact</a></li>
        </ul>
      </nav>
    `);

    // Create web scraping utils
    const webScrapingUtils = new WebScrapingUtils(page);

    // Extract links
    const links = await webScrapingUtils.extractLinks('nav a');

    // Verify extracted links
    expect(links).toHaveLength(5);
    expect(links[0].text).toBe('Home');
    expect(links[0].href).toContain('/home');

    console.log('Extracted links:', links);
  });

  test('Extract structured data from a page', async ({ page }) => {
    // Set up test page with structured data
    await page.setContent(`
      <div class="product-page">
        <h1 class="product-title">Smartphone X</h1>
        <div class="product-price">$999.99</div>
        <div class="product-rating">4.5/5</div>
        <div class="product-description">
          The latest smartphone with amazing features.
        </div>
        <div class="product-specs">
          <ul>
            <li>6.7" OLED Display</li>
            <li>128GB Storage</li>
            <li>12MP Camera</li>
            <li>5G Connectivity</li>
          </ul>
        </div>
      </div>
    `);

    // Create web scraping utils
    const webScrapingUtils = new WebScrapingUtils(page);

    // Extract structured data
    const productData = await webScrapingUtils.extractStructuredData({
      title: '.product-title',
      price: '.product-price',
      rating: '.product-rating',
      description: '.product-description',
    });

    // Verify extracted data
    expect(productData.title).toBe('Smartphone X');
    expect(productData.price).toBe('$999.99');
    expect(productData.rating).toBe('4.5/5');
    expect(productData.description).toContain('amazing features');

    console.log('Extracted product data:', productData);

    // Extract specs as list
    const specs = await webScrapingUtils.extractText('.product-specs li');
    expect(specs).toHaveLength(4);
    expect(specs[0]).toBe('6.7" OLED Display');

    console.log('Extracted specs:', specs);
  });

  test('Save and analyze DOM snapshot', async ({ page }) => {
    // Set up test page
    await page.setContent(`
      <div class="app">
        <header>
          <h1>My Application</h1>
          <nav>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/settings">Settings</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <section class="content">
            <h2>Welcome to the Application</h2>
            <p>This is a sample application for testing DOM snapshots.</p>
            <button id="login-button">Login</button>
          </section>
        </main>
        <footer>
          <p>&copy; 2023 My Company</p>
        </footer>
      </div>
    `);

    // Create web scraping utils
    const webScrapingUtils = new WebScrapingUtils(page);

    // Save DOM snapshot
    const snapshotPath = await webScrapingUtils.saveDOMSnapshot('sample-app');

    // Verify snapshot was saved
    expect(fs.existsSync(snapshotPath)).toBeTruthy();

    console.log(`DOM snapshot saved to: ${snapshotPath}`);

    // Read snapshot content
    const snapshotContent = fs.readFileSync(snapshotPath, 'utf8');

    // Verify snapshot contains expected elements
    expect(snapshotContent).toContain('<h1>My Application</h1>');
    expect(snapshotContent).toContain('id="login-button"');

    // Analyze DOM structure
    const headerLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header nav a'));
      return links.map((link) => ({
        text: link.textContent,
        href: link.getAttribute('href'),
      }));
    });

    expect(headerLinks).toHaveLength(3);
    console.log('Header links:', headerLinks);
  });
});
