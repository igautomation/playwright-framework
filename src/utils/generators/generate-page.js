#!/usr/bin/env node

/**
 * Page Object Generator CLI
 * Generates page objects from web pages
 */
const { program } = require('commander');
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const selectors = require('./selectors');

async function generateSalesforcePage(url, name, credentials, outputPath) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // First handle Salesforce login
    await page.goto('https://login.salesforce.com');
    await page.fill('#username', credentials.username);
    await page.fill('#password', credentials.password);
    await page.click('#Login');
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('one-app-nav-bar', { timeout: 30000 }).catch(() => {});

    // Now navigate to the actual page
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.slds-form', { timeout: 30000 }).catch(() => {});
    
    // Wait for any spinners to disappear
    await page.waitForSelector('.slds-spinner', { state: 'hidden' }).catch(() => {});

    // Extract Salesforce elements
    const elements = {
      buttons: [],
      inputs: [],
      selects: [],
      custom: []
    };

    // Extract Lightning form fields
    const formFields = await page.$$('lightning-input-field, lightning-textarea-field, lightning-select-field');
    for (const field of formFields) {
      const label = await field.getAttribute('data-label') || await field.getAttribute('label');
      const fieldName = await field.getAttribute('field-name') || await field.getAttribute('data-field-name');
      if (label && fieldName) {
        elements.inputs.push({
          label,
          name: fieldName,
          selector: `lightning-input-field[field-name="${fieldName}"]`
        });
      }
    }

    // Extract buttons
    const buttons = await page.$$('lightning-button, button.slds-button');
    for (const button of buttons) {
      const label = await button.getAttribute('label') || await button.textContent();
      if (label) {
        elements.buttons.push({
          label,
          name: label.toLowerCase().replace(/[^a-z0-9]/g, ''),
          selector: `lightning-button[label="${label}"], button:has-text("${label}")`
        });
      }
    }

    // Generate the page class
    const className = name.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = className + '.js';
    const filePath = path.join(outputPath, fileName);
    
    const classContent = `/**
 * ${className} Page Object
 * Generated from ${url}
 * @generated
 */
const { BasePage } = require('./BasePage');

class ${className} extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Page URL
    this.url = '${url}';

    // Form Fields
    ${elements.inputs.map(input => `this.${input.name} = '${input.selector}';`).join('\n    ')}

    // Buttons
    ${elements.buttons.map(button => `this.${button.name} = '${button.selector}';`).join('\n    ')}
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('.slds-form', { timeout: 30000 });
    await this.page.waitForSelector('.slds-spinner', { state: 'hidden' }).catch(() => {});
  }

  ${elements.inputs.map(input => `
  /**
   * Fill ${input.label}
   * @param {string} value
   */
  async fill${input.name}(value) {
    await this.page.fill(this.${input.name}, value);
  }`).join('\n')}

  ${elements.buttons.map(button => `
  /**
   * Click ${button.label}
   */
  async click${button.name}() {
    await this.page.click(this.${button.name});
  }`).join('\n')}
}

module.exports = ${className};`;

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    fs.writeFileSync(filePath, classContent);
    
    return {
      className,
      filePath,
      elementCount: elements.inputs.length + elements.buttons.length
    };

  } finally {
    await browser.close();
  }
}

program
  .name('generate-page')
  .description('Generate a page object class from a web page')
  .argument('<url>', 'URL of the web page to analyze')
  .argument('[name]', 'Name for the page class', 'Page')
  .option('-o, --output <path>', 'Output directory', './src/pages')
  .option('-f, --framework <name>', 'Target framework (standard, salesforce)', 'standard')
  .option('--credentials.username <username>', 'Salesforce username')
  .option('--credentials.password <password>', 'Salesforce password')
  .action(async (url, name, options) => {
    try {
      const outputPath = path.resolve(process.cwd(), options.output);
      
      if (options.framework === 'salesforce') {
        if (!options.credentials?.username || !options.credentials?.password) {
          throw new Error('Salesforce credentials required');
        }
        
        const result = await generateSalesforcePage(url, name, options.credentials, outputPath);
        console.log('\nSalesforce page class generated successfully:');
        console.log(`- Class: ${result.className}`);
        console.log(`- File: ${result.filePath}`);
        console.log(`- Elements: ${result.elementCount}`);
      } else {
        // Handle standard page generation
        const result = await generatePageObject({
          url,
          name,
          outputPath,
          headless: true
        });
        console.log('\nStandard page class generated successfully:');
        console.log(`- Class: ${result.className}`);
        console.log(`- File: ${result.filePath}`);
        console.log(`- Elements: ${result.elementCount}`);
      }
    } catch (error) {
      console.error('Error generating page object:', error.message);
      process.exit(1);
    }
  });

program.parse();