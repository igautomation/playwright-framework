const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function handleSalesforceAuth(page, auth) {
  if (!auth?.username || !auth?.password) return;

  console.log('Authenticating with Salesforce...');
  
  // Go to login page first
  await page.goto('https://login.salesforce.com');
  
  // Handle login
  await page.fill('#username', auth.username);
  await page.fill('#password', auth.password);
  await page.click('#Login');
  
  // Wait for Salesforce to load
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('one-app-nav-bar', { timeout: 30000 }).catch(() => {});
  
  console.log('Authentication successful');
}

async function extractStandardElements(page) {
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  
  return await page.evaluate(() => {
    const result = {
      buttons: [],
      inputs: [],
      selects: [],
      textareas: [],
      links: [],
      forms: []
    };

    // Helper function to get best selector
    function getBestSelector(element) {
      // Try data attributes first
      const dataTestId = element.getAttribute('data-testid');
      if (dataTestId) return `[data-testid="${dataTestId}"]`;
      
      const dataTest = element.getAttribute('data-test');
      if (dataTest) return `[data-test="${dataTest}"]`;
      
      const dataQa = element.getAttribute('data-qa');
      if (dataQa) return `[data-qa="${dataQa}"]`;
      
      // Try ARIA attributes
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return `[aria-label="${ariaLabel}"]`;
      
      // Try ID
      const id = element.id;
      if (id) return `#${id}`;
      
      // Try name
      const name = element.getAttribute('name');
      if (name) return `[name="${name}"]`;
      
      // Fallback to tag + attributes
      const tag = element.tagName.toLowerCase();
      const type = element.getAttribute('type');
      return type ? `${tag}[type="${type}"]` : tag;
    }

    // Extract forms
    document.querySelectorAll('form').forEach(form => {
      const selector = getBestSelector(form);
      result.forms.push({
        name: form.id || form.getAttribute('name') || 'form',
        selector,
        type: 'form'
      });
    });

    // Extract inputs
    document.querySelectorAll('input:not([type="hidden"])').forEach(input => {
      const selector = getBestSelector(input);
      const type = input.getAttribute('type') || 'text';
      const label = input.labels?.[0]?.textContent || input.getAttribute('placeholder') || input.name || type;
      result.inputs.push({
        name: label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        selector,
        type
      });
    });

    // Extract buttons
    document.querySelectorAll('button, input[type="submit"], input[type="button"]').forEach(btn => {
      const selector = getBestSelector(btn);
      const text = btn.textContent || btn.value || btn.getAttribute('aria-label') || 'button';
      result.buttons.push({
        name: text.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        selector,
        type: 'button'
      });
    });

    // Extract selects
    document.querySelectorAll('select').forEach(select => {
      const selector = getBestSelector(select);
      const label = select.labels?.[0]?.textContent || select.name || 'select';
      result.selects.push({
        name: label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        selector,
        type: 'select'
      });
    });

    // Extract textareas
    document.querySelectorAll('textarea').forEach(textarea => {
      const selector = getBestSelector(textarea);
      const label = textarea.labels?.[0]?.textContent || textarea.getAttribute('placeholder') || textarea.name || 'textarea';
      result.textareas.push({
        name: label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        selector,
        type: 'textarea'
      });
    });

    // Extract links
    document.querySelectorAll('a[href]').forEach(link => {
      const selector = getBestSelector(link);
      const text = link.textContent || link.getAttribute('aria-label') || 'link';
      result.links.push({
        name: text.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        selector,
        type: 'link'
      });
    });

    return result;
  });
}

async function extractSalesforceElements(page) {
  // Wait for Salesforce page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('force-record-layout-section', { timeout: 30000 });
  
  return await page.evaluate(() => {
    const result = {
      buttons: [],
      inputs: [],
      comboboxes: [],
      textareas: [],
      sections: []
    };

    // Helper function to get best selector
    function getBestSelector(element) {
      const label = element.getAttribute('label') || element.getAttribute('data-label');
      const fieldApiName = element.getAttribute('data-field-name') || element.getAttribute('field-name');
      
      if (label && fieldApiName) {
        return `lightning-input[label="${label}"][data-field-name="${fieldApiName}"]`;
      }
      if (label) {
        return `lightning-input[label="${label}"]`;
      }
      if (fieldApiName) {
        return `lightning-input[data-field-name="${fieldApiName}"]`;
      }
      return element.tagName.toLowerCase();
    }

    // Extract Lightning inputs
    document.querySelectorAll('lightning-input').forEach(input => {
      const selector = getBestSelector(input);
      result.inputs.push({
        name: input.getAttribute('label') || input.getAttribute('data-field-name') || 'input',
        selector,
        type: input.getAttribute('type') || 'text'
      });
    });

    // Extract Lightning comboboxes
    document.querySelectorAll('lightning-combobox').forEach(combo => {
      const selector = getBestSelector(combo);
      result.comboboxes.push({
        name: combo.getAttribute('label') || combo.getAttribute('data-field-name') || 'combobox',
        selector,
        type: 'combobox'
      });
    });

    // Extract Lightning textareas
    document.querySelectorAll('lightning-textarea').forEach(textarea => {
      const selector = getBestSelector(textarea);
      result.textareas.push({
        name: textarea.getAttribute('label') || textarea.getAttribute('data-field-name') || 'textarea',
        selector,
        type: 'textarea'
      });
    });

    // Extract buttons
    document.querySelectorAll('lightning-button, button[title="Save"], button[name="SaveEdit"]').forEach(btn => {
      const selector = btn.title ? `button[title="${btn.title}"]` : 
                      btn.name ? `button[name="${btn.name}"]` : 
                      'button:has-text("Save")';
      result.buttons.push({
        name: btn.title || btn.name || 'Save',
        selector,
        type: 'button'
      });
    });

    // Extract sections
    document.querySelectorAll('force-record-layout-section').forEach(section => {
      const heading = section.querySelector('h3');
      result.sections.push({
        name: heading?.textContent || 'Section',
        selector: 'force-record-layout-section',
        type: 'section'
      });
    });

    return result;
  });
}

async function generatePageObject({ url, name, outputPath = './src/pages', headless = true, auth }) {
  console.log('Starting page object generation...');
  
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Handle Salesforce authentication first
    if (auth && (url.includes('force.com') || url.includes('salesforce.com'))) {
      await handleSalesforceAuth(page, auth);
    }

    // Navigate to target page
    console.log('Navigating to target page...');
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    
    console.log('Extracting elements...');
    const elements = url.includes('salesforce.com') || url.includes('force.com') 
      ? await extractSalesforceElements(page)
      : await extractStandardElements(page);
    
    const className = name.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `${className}.js`;
    const filePath = path.join(outputPath, fileName);
    
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // Generate page class
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
    
    // Selectors
    ${Object.entries(elements).map(([type, items]) => 
      items.length > 0 ? `// ${type.charAt(0).toUpperCase() + type.slice(1)}\n    ` + 
      items.map(item => `this.${item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()} = '${item.selector}';`).join('\n    ')
      : ''
    ).filter(Boolean).join('\n\n    ')}
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    ${url.includes('salesforce.com') || url.includes('force.com') 
      ? "await this.page.waitForSelector('force-record-layout-section', { timeout: 30000 });"
      : "// Wait for main content to be available\n    await this.page.waitForSelector('body', { timeout: 30000 });"}
  }

  ${Object.entries(elements).map(([type, items]) => 
    items.map(item => {
      const methodName = item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      switch(type) {
        case 'buttons':
          return `/**
   * Click ${item.name} button
   */
  async click${methodName}() {
    await this.click(this.${methodName});
  }`;
        case 'inputs':
        case 'textareas':
          return `/**
   * Fill ${item.name}
   * @param {string} value
   */
  async fill${methodName}(value) {
    await this.fill(this.${methodName}, value);
  }`;
        case 'selects':
          return `/**
   * Select ${item.name} option
   * @param {string} value
   */
  async select${methodName}(value) {
    await this.selectOption(this.${methodName}, value);
  }`;
        case 'links':
          return `/**
   * Click ${item.name} link
   */
  async click${methodName}() {
    await this.click(this.${methodName});
  }`;
        case 'forms':
          return `/**
   * Submit ${item.name} form
   */
  async submit${methodName}() {
    await this.page.evaluate(selector => {
      document.querySelector(selector).submit();
    }, this.${methodName});
  }`;
        default:
          return '';
      }
    }).filter(Boolean).join('\n\n  ')
  ).filter(Boolean).join('\n\n  ')}
}

module.exports = ${className};`;

    fs.writeFileSync(filePath, classContent);
    
    const elementCount = Object.values(elements)
      .reduce((sum, arr) => sum + arr.length, 0);
      
    console.log(`Generated ${className} with ${elementCount} elements`);
    
    return { className, filePath, elementCount };
  } finally {
    await browser.close();
  }
}

module.exports = { generatePageObject };