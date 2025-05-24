#!/usr/bin/env node

/**
 * Salesforce Page Object Generator
 * Generates page objects from extracted DOM elements
 */
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  inputFile: process.env.SF_INPUT_FILE || 'sf_contact_elements.json',
  outputDir: process.env.SF_OUTPUT_DIR || path.join(process.cwd(), 'src/pages'),
  testOutputDir: process.env.SF_TEST_OUTPUT_DIR || path.join(process.cwd(), 'tests/pages'),
  pageName: process.env.SF_PAGE_NAME || 'ContactPage',
  pageUrl: process.env.SF_PAGE_URL || '/lightning/o/Contact/new'
};

/**
 * Generate a page class from extracted elements
 */
async function generatePageClass(elements, pageName, pageUrl) {
  // Extract useful elements for page object
  const inputElements = findElementsByType(elements, ['lightning-input', '.slds-input', 'input[type']);
  const buttonElements = findElementsByType(elements, ['lightning-button', '.slds-button', 'button']);
  const selectElements = findElementsByType(elements, ['lightning-combobox', '.slds-combobox', 'select']);
  const checkboxElements = findElementsByType(elements, ['lightning-checkbox', '.slds-checkbox', 'input[type=\'checkbox\']']);
  
  // Generate selectors
  const selectors = {};
  
  // Process input fields
  inputElements.forEach(el => {
    const name = getElementName(el);
    if (name) {
      selectors[`${name}Input`] = getElementSelector(el);
    }
  });
  
  // Process buttons
  buttonElements.forEach(el => {
    const name = getElementName(el);
    if (name) {
      selectors[`${name}Button`] = getElementSelector(el);
    }
  });
  
  // Process select/combobox fields
  selectElements.forEach(el => {
    const name = getElementName(el);
    if (name) {
      selectors[`${name}Select`] = getElementSelector(el);
    }
  });
  
  // Process checkboxes
  checkboxElements.forEach(el => {
    const name = getElementName(el);
    if (name) {
      selectors[`${name}Checkbox`] = getElementSelector(el);
    }
  });
  
  // Generate page class
  const pageClass = `/**
 * ${pageName} - Page Object
 * Generated from DOM extraction
 */
const { BasePage } = require('./BasePage');

class ${pageName} extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    
    // Page URL
    this.url = '${pageUrl}';
    
    // Selectors
${Object.entries(selectors)
  .map(([name, selector]) => `    this.${name} = '${selector}';`)
  .join('\n')}
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

${Object.entries(selectors)
  .filter(([name]) => name.endsWith('Input'))
  .map(([name]) => {
    const methodName = name.replace(/Input$/, '');
    return `  /**
   * Fill ${methodName} field
   * @param {string} value
   */
  async fill${methodName}(value) {
    await this.fill(this.${name}, value);
  }`;
  })
  .join('\n\n')}

${Object.entries(selectors)
  .filter(([name]) => name.endsWith('Button'))
  .map(([name]) => {
    const methodName = name.replace(/Button$/, '');
    return `  /**
   * Click ${methodName} button
   */
  async click${methodName}() {
    await this.click(this.${name});
  }`;
  })
  .join('\n\n')}

${Object.entries(selectors)
  .filter(([name]) => name.endsWith('Select'))
  .map(([name]) => {
    const methodName = name.replace(/Select$/, '');
    return `  /**
   * Select option in ${methodName} dropdown
   * @param {string} value
   */
  async select${methodName}(value) {
    await this.selectOption(this.${name}, value);
  }`;
  })
  .join('\n\n')}

${Object.entries(selectors)
  .filter(([name]) => name.endsWith('Checkbox'))
  .map(([name]) => {
    const methodName = name.replace(/Checkbox$/, '');
    return `  /**
   * Set ${methodName} checkbox
   * @param {boolean} checked
   */
  async set${methodName}(checked) {
    await this.setCheckbox(this.${name}, checked);
  }`;
  })
  .join('\n\n')}
}

module.exports = ${pageName};`;

  return pageClass;
}

/**
 * Generate a test class for the page
 */
async function generateTestClass(pageName) {
  const testClass = `/**
 * ${pageName} - Test Suite
 * Generated from page object
 */
const { test, expect } = require('@playwright/test');
const { ${pageName} } = require('../src/pages/${pageName}');

test.describe('${pageName} Tests', () => {
  let page;
  let ${pageName.charAt(0).toLowerCase() + pageName.slice(1)};

  test.beforeEach(async ({ browser }) => {
    // Create a new context with storage state (logged in session)
    const context = await browser.newContext({
      storageState: './auth/salesforce-storage-state.json'
    });
    
    page = await context.newPage();
    ${pageName.charAt(0).toLowerCase() + pageName.slice(1)} = new ${pageName}(page);
    
    // Navigate to the page
    await ${pageName.charAt(0).toLowerCase() + pageName.slice(1)}.goto();
  });

  test('should create a new record with valid data', async () => {
    // Fill in form fields
    await ${pageName.charAt(0).toLowerCase() + pageName.slice(1)}.fillFirstName('Test');
    await ${pageName.charAt(0).toLowerCase() + pageName.slice(1)}.fillLastName('User');
    await ${pageName.charAt(0).toLowerCase() + pageName.slice(1)}.fillEmail('test@example.com');
    
    // Submit the form
    await ${pageName.charAt(0).toLowerCase() + pageName.slice(1)}.clickSave();
    
    // Verify success
    await expect(page.locator('.toastMessage')).toContainText('created');
  });

  test('should show validation errors for required fields', async () => {
    // Submit without filling required fields
    await ${pageName.charAt(0).toLowerCase() + pageName.slice(1)}.clickSave();
    
    // Verify validation errors
    await expect(page.locator('.errorMessage')).toBeVisible();
  });

  test('should cancel form submission', async () => {
    // Fill some data
    await ${pageName.charAt(0).toLowerCase() + pageName.slice(1)}.fillFirstName('Test');
    
    // Click cancel
    await ${pageName.charAt(0).toLowerCase() + pageName.slice(1)}.clickCancel();
    
    // Verify we're back to the list view
    await expect(page).toHaveURL(/.*\/lightning\/o\/Contact\/list/);
  });
});`;

  return testClass;
}

/**
 * Find elements by type from extracted elements
 */
function findElementsByType(elements, typePatterns) {
  const result = [];
  
  // Check each selector and its elements
  Object.entries(elements).forEach(([selector, selectorElements]) => {
    // Check if this selector matches any of our patterns
    const matchesPattern = typePatterns.some(pattern => selector.includes(pattern));
    
    if (matchesPattern) {
      // Add all elements from this selector
      selectorElements.forEach(element => {
        if (element.visible) {
          result.push({
            ...element,
            originalSelector: selector
          });
        }
      });
    }
  });
  
  return result;
}

/**
 * Get a good name for an element
 */
function getElementName(element) {
  // Try to get name from label attribute
  if (element.attributes && element.attributes.label) {
    return formatName(element.attributes.label);
  }
  
  // Try to get name from aria-label
  if (element.attributes && element.attributes['aria-label']) {
    return formatName(element.attributes['aria-label']);
  }
  
  // Try to get name from placeholder
  if (element.attributes && element.attributes.placeholder) {
    return formatName(element.attributes.placeholder);
  }
  
  // Try to get name from text content
  if (element.text) {
    return formatName(element.text);
  }
  
  // Try to get name from field-name attribute (Salesforce specific)
  if (element.attributes && element.attributes['field-name']) {
    return formatName(element.attributes['field-name']);
  }
  
  // Try to get name from data-field-name attribute (Salesforce specific)
  if (element.attributes && element.attributes['data-field-name']) {
    return formatName(element.attributes['data-field-name']);
  }
  
  // Try to get name from id
  if (element.id) {
    return formatName(element.id);
  }
  
  // Try to get name from class
  if (element.className) {
    const classes = element.className.split(' ');
    for (const cls of classes) {
      if (!cls.startsWith('slds-') && cls.length > 3) {
        return formatName(cls);
      }
    }
  }
  
  return null;
}

/**
 * Format a string as a camelCase name
 */
function formatName(str) {
  if (!str) return null;
  
  // Remove special characters and trim
  let name = str.replace(/[^\w\s]/g, ' ').trim();
  
  // Limit to first few words
  name = name.split(' ').slice(0, 3).join(' ');
  
  // Convert to camelCase
  name = name.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  }).replace(/\s+/g, '');
  
  return name;
}

/**
 * Get the best selector for an element
 */
function getElementSelector(element) {
  // If it has a data-testid, use that
  if (element.attributes && element.attributes['data-testid']) {
    return `[data-testid="${element.attributes['data-testid']}"]`;
  }
  
  // If it has an id, use that
  if (element.id) {
    return `#${element.id}`;
  }
  
  // If it's a Lightning component with a label
  if (element.tagName && element.tagName.startsWith('lightning-') && element.attributes && element.attributes.label) {
    return `${element.tagName}[label="${element.attributes.label}"]`;
  }
  
  // If it has a name attribute
  if (element.attributes && element.attributes.name) {
    return `[name="${element.attributes.name}"]`;
  }
  
  // If it has field-name (Salesforce specific)
  if (element.attributes && element.attributes['field-name']) {
    return `[field-name="${element.attributes['field-name']}"]`;
  }
  
  // If it has data-field-name (Salesforce specific)
  if (element.attributes && element.attributes['data-field-name']) {
    return `[data-field-name="${element.attributes['data-field-name']}"]`;
  }
  
  // If it has an aria-label
  if (element.attributes && element.attributes['aria-label']) {
    return `[aria-label="${element.attributes['aria-label']}"]`;
  }
  
  // If it has text content and is a button
  if (element.text && (element.tagName === 'button' || element.attributes && element.attributes.role === 'button')) {
    return `button:has-text("${element.text}")`;
  }
  
  // Fall back to the original selector
  return element.originalSelector || element.tagName;
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
Salesforce Page Object Generator

Usage:
  node sf-page-generator.js [options]

Options:
  --input, -i <file>     Input JSON file with extracted elements (default: ${CONFIG.inputFile})
  --output, -o <dir>     Output directory for page classes (default: ${CONFIG.outputDir})
  --test-output, -t <dir> Output directory for test classes (default: ${CONFIG.testOutputDir})
  --name, -n <name>      Page class name (default: ${CONFIG.pageName})
  --url, -u <url>        Page URL (default: ${CONFIG.pageUrl})
  --help, -h             Show this help message
      `);
      process.exit(0);
    }
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--input' || args[i] === '-i') {
        CONFIG.inputFile = args[i + 1];
        i++;
      } else if (args[i] === '--output' || args[i] === '-o') {
        CONFIG.outputDir = args[i + 1];
        i++;
      } else if (args[i] === '--test-output' || args[i] === '-t') {
        CONFIG.testOutputDir = args[i + 1];
        i++;
      } else if (args[i] === '--name' || args[i] === '-n') {
        CONFIG.pageName = args[i + 1];
        i++;
      } else if (args[i] === '--url' || args[i] === '-u') {
        CONFIG.pageUrl = args[i + 1];
        i++;
      }
    }
    
    // Read input file
    console.log(`Reading elements from ${CONFIG.inputFile}...`);
    const elementsData = await fs.readFile(CONFIG.inputFile, 'utf8');
    const elements = JSON.parse(elementsData);
    
    // Generate page class
    console.log(`Generating page class ${CONFIG.pageName}...`);
    const pageClass = await generatePageClass(elements, CONFIG.pageName, CONFIG.pageUrl);
    
    // Create output directory if it doesn't exist
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    // Write page class to file
    const pageClassPath = path.join(CONFIG.outputDir, `${CONFIG.pageName}.js`);
    await fs.writeFile(pageClassPath, pageClass);
    console.log(`Page class written to ${pageClassPath}`);
    
    // Generate test class
    console.log(`Generating test class for ${CONFIG.pageName}...`);
    const testClass = await generateTestClass(CONFIG.pageName);
    
    // Create test output directory if it doesn't exist
    await fs.mkdir(CONFIG.testOutputDir, { recursive: true });
    
    // Write test class to file
    const testClassPath = path.join(CONFIG.testOutputDir, `${CONFIG.pageName}.spec.js`);
    await fs.writeFile(testClassPath, testClass);
    console.log(`Test class written to ${testClassPath}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
} else {
  module.exports = {
    generatePageClass,
    generateTestClass
  };
}