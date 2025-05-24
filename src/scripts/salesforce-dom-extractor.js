#!/usr/bin/env node
const { chromium } = require('@playwright/test');
const fs = require('fs').promises;

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};
for (let i = 0; i < args.length; i += 2) {
  params[args[i].replace('--', '')] = args[i + 1];
}

// Validate required parameters
const required = ['username', 'password', 'url', 'selector'];
for (const param of required) {
  if (!params[param]) {
    console.error(`Error: --${param} is required`);
    process.exit(1);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login to Salesforce
    await page.goto('https://login.salesforce.com');
    await page.fill('#username', params.username);
    await page.fill('#password', params.password);
    await page.click('#Login');
    await page.waitForLoadState('networkidle');

    // Check if login was successful
    if (page.url().includes('login.salesforce.com')) {
      throw new Error('Login failed. Check credentials.');
    }

    // Save session data
    const cookies = await context.cookies();
    await fs.writeFile('sf-session.json', JSON.stringify({ 
      cookies,
      timestamp: new Date().toISOString()
    }, null, 2));

    // Navigate to target URL
    await page.goto(params.url);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector(params.selector, { timeout: 10000 });

    // Extract DOM elements
    const elements = await page.evaluate((selector) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      return nodes.map(node => ({
        text: node.textContent.trim(),
        html: node.outerHTML,
        attributes: Object.fromEntries(
          Array.from(node.attributes).map(attr => [attr.name, attr.value])
        )
      }));
    }, params.selector);

    console.log(JSON.stringify(elements, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();