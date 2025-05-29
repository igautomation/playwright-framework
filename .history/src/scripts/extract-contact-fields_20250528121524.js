#!/usr/bin/env node
const { chromium } = require('@playwright/test');
const SalesforceContactPage = require('../pages/salesforce/SalesforceContactPage');

async function extractContactFields() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const contactPage = new SalesforceContactPage(page);

  try {
    await contactPage.goto({
      username: 'altimetrikuser001@wise-koala-a44c19.com',
      password: 'Dubai@2025',
    });

    const fields = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input.slds-input, select.slds-select');
      return Array.from(inputs).map(el => ({
        name: el.getAttribute('name'),
        type: el.tagName.toLowerCase(),
        required: el.hasAttribute('required'),
        value: el.value,
      }));
    });

    console.log(JSON.stringify(fields, null, 2));
  } finally {
    await browser.close();
  }
}

extractContactFields();
