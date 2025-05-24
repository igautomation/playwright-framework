#!/usr/bin/env node
const { chromium } = require('@playwright/test');

async function extractElements(selector) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://login.salesforce.com');
    await page.fill('#username', 'altimetrikuser001@wise-koala-a44c19.com');
    await page.fill('#password', 'Dubai@2025');
    await page.click('#Login');
    await page.waitForLoadState('networkidle');

    // Navigate to the target page
    const targetUrl = 'https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new';
    await page.goto(targetUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector(selector, { timeout: 30000 });

    const elements = await page.evaluate((sel) => {
      return Array.from(document.querySelectorAll(sel)).map(el => ({
        text: el.textContent.trim(),
        html: el.outerHTML
      }));
    }, selector);

    console.log(JSON.stringify(elements, null, 2));
  } finally {
    await browser.close();
  }
}

// Use the selector from command line or default to force-record-layout-section
extractElements(process.argv[2] || 'force-record-layout-section');