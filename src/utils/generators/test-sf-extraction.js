#!/usr/bin/env node

/**
 * Test script for Salesforce DOM extraction using comprehensive selectors
 */
const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
const selectors = require('./selectors');

// Configuration with provided credentials
const CONFIG = {
  url: "https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new",
  username: "altimetrikuser001@wise-koala-a44c19.com",
  password: "Dubai@2025",
  outputFile: "sf_contact_elements.json"
};

async function extractElements() {
  console.log('Starting Salesforce DOM extraction test with comprehensive selectors...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('Navigating to Salesforce login page...');
    await page.goto('https://login.salesforce.com', { timeout: 60000 });
    
    // Login with provided credentials
    console.log('Logging in with provided credentials...');
    await page.fill('#username', CONFIG.username);
    await page.fill('#password', CONFIG.password);
    await page.click('#Login');
    
    // Wait for login to complete
    console.log('Waiting for login to complete...');
    try {
      await page.waitForNavigation({ timeout: 60000 });
    } catch (e) {
      console.log('Navigation timeout, checking current URL...');
    }
    
    // Check if login was successful
    console.log(`Current URL: ${page.url()}`);
    if (page.url().includes('login.salesforce.com')) {
      const errorText = await page.locator('#error').textContent().catch(() => 'Unknown error');
      throw new Error(`Login failed: ${errorText}`);
    }
    
    // Navigate to the target URL
    console.log(`Navigating to target URL: ${CONFIG.url}`);
    await page.goto(CONFIG.url, { timeout: 60000 });
    
    // Wait for page to load
    console.log('Waiting for page to load...');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    
    // Wait for Lightning components to load
    console.log('Waiting for Lightning components...');
    await page.waitForTimeout(5000);
    
    // Get comprehensive Salesforce selectors
    const salesforceSelectors = selectors.getSelectors({ mode: 'salesforce' });
    console.log(`Using ${salesforceSelectors.length} Salesforce selectors for extraction`);
    
    // Extract elements
    console.log('Extracting DOM elements...');
    const elements = await extractDOMElements(page, salesforceSelectors);
    
    // Save results
    await fs.writeFile(CONFIG.outputFile, JSON.stringify(elements, null, 2));
    console.log(`Elements extracted and saved to ${CONFIG.outputFile}`);
    
    // Output summary
    let totalElements = 0;
    let elementsByType = {};
    
    Object.keys(elements).forEach(selector => {
      const count = elements[selector].length;
      if (count > 0) {
        // Group by selector type
        const selectorType = getSelectorType(selector);
        if (!elementsByType[selectorType]) {
          elementsByType[selectorType] = 0;
        }
        elementsByType[selectorType] += count;
        totalElements += count;
      }
    });
    
    // Print summary by type
    console.log('\nElements found by type:');
    Object.keys(elementsByType).sort().forEach(type => {
      console.log(`- ${type}: ${elementsByType[type]} elements`);
    });
    console.log(`\nTotal: ${totalElements} elements extracted`);
    
    return elements;
  } catch (error) {
    console.error('Error during extraction:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('Error screenshot saved to error-screenshot.png');
    throw error;
  } finally {
    console.log('Pausing for 3 seconds before closing browser...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
  }
}

async function extractDOMElements(page, selectorList) {
  return await page.evaluate((selectors) => {
    const results = {};
    
    selectors.forEach(selector => {
      try {
        const elements = Array.from(document.querySelectorAll(selector));
        results[selector] = elements.map(el => {
          try {
            // Get basic properties
            const rect = el.getBoundingClientRect();
            
            // Get attributes
            const attributes = {};
            Array.from(el.attributes).forEach(attr => {
              attributes[attr.name] = attr.value;
            });
            
            return {
              tagName: el.tagName.toLowerCase(),
              id: el.id || null,
              className: el.className || null,
              text: el.textContent?.trim() || null,
              attributes,
              visible: rect.width > 0 && rect.height > 0,
              position: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
              }
            };
          } catch (err) {
            return { error: `Failed to process element: ${err.message}` };
          }
        });
      } catch (err) {
        results[selector] = [{ error: `Failed to query selector: ${err.message}` }];
      }
    });
    
    return results;
  }, selectorList);
}

// Helper function to categorize selectors
function getSelectorType(selector) {
  if (selector.startsWith('lightning-')) return 'Lightning Component';
  if (selector.startsWith('.slds-')) return 'SLDS Component';
  if (selector.startsWith('[aria-')) return 'ARIA Attribute';
  if (selector.startsWith('[data-')) return 'Data Attribute';
  if (selector.startsWith('[role')) return 'Role Attribute';
  if (selector.startsWith('input')) return 'Input Element';
  if (selector.startsWith('button')) return 'Button Element';
  if (selector.startsWith('a[href]')) return 'Link Element';
  return 'Other Element';
}

// Run the extraction
extractElements().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});