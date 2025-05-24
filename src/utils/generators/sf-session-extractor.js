#!/usr/bin/env node

/**
 * Salesforce Session-based DOM Extractor
 * Extracts DOM elements from Salesforce using a session ID
 */
const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  orgAlias: process.env.SF_ORG_ALIAS || 'my-org-alias',
  sessionFile: process.env.SF_SESSION_FILE || path.join(process.cwd(), 'session_id.txt'),
  outputFile: process.env.SF_OUTPUT_FILE || path.join(process.cwd(), 'sf_elements.json'),
  targetUrl: process.env.SF_TARGET_URL || null,
  selectors: process.env.SF_SELECTORS?.split(',') || ['lightning-input', 'lightning-button', '.slds-input', '.slds-button']
};

/**
 * Get Salesforce session ID using Salesforce CLI
 */
async function getSessionId() {
  try {
    // Check if session file exists and is not empty
    try {
      const sessionData = await fs.readFile(CONFIG.sessionFile, 'utf8');
      if (sessionData.trim()) {
        console.log('Using existing session ID');
        return sessionData.trim();
      }
    } catch (err) {
      // File doesn't exist or is empty, continue to get new session
    }

    console.log(`Getting session ID for org alias: ${CONFIG.orgAlias}`);
    const result = execSync(`sf org display -o ${CONFIG.orgAlias} --json`, { encoding: 'utf8' });
    const data = JSON.parse(result);
    
    if (!data.result || !data.result.accessToken) {
      throw new Error('No access token found in SF CLI response');
    }
    
    const sessionId = data.result.accessToken;
    const instanceUrl = data.result.instanceUrl || '';
    const domain = instanceUrl.replace(/^https?:\/\//, '');
    
    // Save session ID to file
    await fs.writeFile(CONFIG.sessionFile, sessionId);
    console.log('Session ID saved to', CONFIG.sessionFile);
    
    return sessionId;
  } catch (error) {
    console.error('Error getting session ID:', error.message);
    console.log('Try authenticating with: sf org login web -r https://login.salesforce.com -a', CONFIG.orgAlias);
    process.exit(1);
  }
}

/**
 * Extract DOM elements from Salesforce page
 */
async function extractElements(sessionId, targetUrl, selectors) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Get instance URL from SF CLI
    const result = execSync(`sf org display -o ${CONFIG.orgAlias} --json`, { encoding: 'utf8' });
    const data = JSON.parse(result);
    const instanceUrl = data.result.instanceUrl;
    const domain = new URL(instanceUrl).hostname;
    
    // Add session cookie
    await context.addCookies([
      {
        name: 'sid',
        value: sessionId,
        domain: domain,
        path: '/',
        httpOnly: true,
        secure: true
      }
    ]);
    
    // Navigate to target URL
    const url = targetUrl || `${instanceUrl}/lightning/setup/SetupOneHome/home`;
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Check if we're redirected to login page
    if (page.url().includes('login.salesforce.com')) {
      throw new Error('Session invalid or expired. Please re-authenticate.');
    }
    
    // Wait for Salesforce to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Give Lightning components time to render
    
    console.log(`Extracting elements using selectors: ${selectors.join(', ')}`);
    
    // Extract elements
    const elements = await page.evaluate((selectorList) => {
      const results = {};
      
      selectorList.forEach(selector => {
        const elements = Array.from(document.querySelectorAll(selector));
        results[selector] = elements.map(el => {
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
        });
      });
      
      return results;
    }, selectors);
    
    return elements;
  } finally {
    await browser.close();
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Salesforce Session-based DOM Extractor

Usage:
  node sf-session-extractor.js [options]

Options:
  --url, -u <url>       Target Salesforce URL to extract elements from
  --selectors, -s       Comma-separated list of CSS selectors
  --org, -o <alias>     Salesforce org alias (default: ${CONFIG.orgAlias})
  --output, -f <file>   Output file path (default: ${CONFIG.outputFile})
  --help, -h            Show this help message

Environment Variables:
  SF_ORG_ALIAS          Salesforce org alias
  SF_SESSION_FILE       Path to session ID file
  SF_OUTPUT_FILE        Path to output JSON file
  SF_TARGET_URL         Target Salesforce URL
  SF_SELECTORS          Comma-separated list of CSS selectors
      `);
      process.exit(0);
    }
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--url' || args[i] === '-u') {
        CONFIG.targetUrl = args[i + 1];
        i++;
      } else if (args[i] === '--selectors' || args[i] === '-s') {
        CONFIG.selectors = args[i + 1].split(',');
        i++;
      } else if (args[i] === '--org' || args[i] === '-o') {
        CONFIG.orgAlias = args[i + 1];
        i++;
      } else if (args[i] === '--output' || args[i] === '-f') {
        CONFIG.outputFile = args[i + 1];
        i++;
      }
    }
    
    // Get session ID
    const sessionId = await getSessionId();
    
    // Extract elements
    const elements = await extractElements(sessionId, CONFIG.targetUrl, CONFIG.selectors);
    
    // Save results
    await fs.writeFile(CONFIG.outputFile, JSON.stringify(elements, null, 2));
    console.log(`Elements extracted and saved to ${CONFIG.outputFile}`);
    
    // Output summary
    let totalElements = 0;
    Object.keys(elements).forEach(selector => {
      console.log(`- ${selector}: ${elements[selector].length} elements`);
      totalElements += elements[selector].length;
    });
    console.log(`Total: ${totalElements} elements extracted`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();