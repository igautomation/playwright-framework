/**
 * Optimized Page Object Generator
 * Consolidated generator for both standard and Salesforce pages
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { extractStandardElements, extractSalesforceElements, handleSalesforceAuth } = require('./element-extractor');
const { extractCollections, enhancePageObjectWithCollections } = require('./domCollections');
const config = require('./config');

/**
 * Generate a page object from a URL
 * @param {Object} options Generation options
 * @returns {Promise<Object>} Generation result
 */
async function generatePageObject(options) {
  const {
    url,
    name,
    outputPath = config.output.pagesDir,
    headless = true,
    auth = null,
    isSalesforce = false,
    includeCollections = config.extraction.extractCollections,
    generateTests = false
  } = options;

  console.log('Starting page object generation...');
  console.log(`Mode: ${isSalesforce ? 'Salesforce' : 'Standard Web'}`);
  
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Determine if this is a Salesforce page
    const isSalesforcePage = isSalesforce || url.includes('force.com') || url.includes('salesforce.com');
    
    // Handle authentication if needed
    if (auth && isSalesforcePage) {
      await handleSalesforceAuth(page, auth);
    }

    // Navigate to target page
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
      console.log('Page load timeout - continuing anyway');
    });
    
    // Extract elements based on page type
    console.log('Extracting page elements...');
    const elements = isSalesforcePage 
      ? await extractSalesforceElements(page)
      : await extractStandardElements(page);
    
    // Extract collections if enabled
    let collections = {};
    if (includeCollections) {
      console.log('Extracting DOM collections...');
      collections = await extractCollections(page);
    }
    
    // Generate page class
    const className = name.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `${className}.js`;
    const filePath = path.join(outputPath, fileName);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // Generate base page class
    let classContent = generatePageClass(className, url, elements, isSalesforcePage);

    // Enhance with collection methods if enabled
    if (includeCollections && Object.values(collections).some(arr => arr.length > 0)) {
      classContent = enhancePageObjectWithCollections(classContent, collections);
    }

    // Write to file
    fs.writeFileSync(filePath, classContent);
    
    const elementCount = Object.values(elements)
      .reduce((sum, arr) => sum + arr.length, 0);
      
    const collectionCount = Object.values(collections)
      .reduce((sum, arr) => sum + arr.length, 0);
      
    console.log(`Generated ${className} with ${elementCount} elements and ${collectionCount} collections`);
    
    // Generate test class if requested
    let testFilePath = null;
    if (generateTests) {
      console.log('Generating test class...');
      const testContent = generateTestClass(className, url, elements, collections, isSalesforcePage);
      const testDir = config.output.testsDir;
      
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      testFilePath = path.join(testDir, `${className}.spec.js`);
      fs.writeFileSync(testFilePath, testContent);
      console.log(`Generated test class at ${testFilePath}`);
    }
    
    return { 
      className, 
      filePath, 
      elementCount, 
      collectionCount,
      testFilePath
    };
  } catch (error) {
    console.error('Error generating page object:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Generate page class content
 * @param {string} className Class name
 * @param {string} url Page URL
 * @param {Object} elements Extracted elements
 * @param {boolean} isSalesforce Whether this is a Salesforce page
 * @returns {string} Generated class content
 */
function generatePageClass(className, url, elements, isSalesforce) {
  // Add modal selectors if we found modals
  let modalSelectors = '';
  if (elements.modals && elements.modals.length > 0) {
    modalSelectors = `
    // Modal/Dialog selectors
    this.modalContainer = ${isSalesforce ? "'.slds-modal'" : "'.modal-container'"};
    this.modalHeader = ${isSalesforce ? "'.slds-modal__header'" : "'.modal-header'"};
    this.modalContent = ${isSalesforce ? "'.slds-modal__content'" : "'.modal-content'"};
    this.modalFooter = ${isSalesforce ? "'.slds-modal__footer'" : "'.modal-footer'"};
    this.modalCloseButton = ${isSalesforce ? "'.slds-modal__close'" : "'.modal-close'"};
    this.modalTitle = ${isSalesforce ? "'.slds-modal__header h2'" : "'.modal-header h2'"};
    this.modalBackdrop = ${isSalesforce ? "'.slds-backdrop'" : "'.modal-backdrop'"};`;
  }

  // Add modal methods if we found modals
  let modalMethods = '';
  if (elements.modals && elements.modals.length > 0) {
    modalMethods = `
  /**
   * Wait for a modal dialog to appear
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} - Whether the modal appeared
   */
  async waitForModal(timeout = 10000) {
    return await this.page.locator(this.modalContainer).waitFor({ 
      state: 'visible', 
      timeout 
    }).then(() => true).catch(() => false);
  }

  /**
   * Get the title of the current modal
   * @returns {Promise<string>} - Modal title text
   */
  async getModalTitle() {
    return await this.page.locator(this.modalTitle).textContent();
  }

  /**
   * Close the current modal by clicking the close button
   */
  async closeModal() {
    await this.click(this.modalCloseButton);
    await this.page.locator(this.modalContainer).waitFor({ state: 'hidden' })
      .catch(() => {});
  }

  /**
   * Click a button in the modal footer by text
   * @param {string} buttonText - Text of the button to click
   */
  async clickModalButton(buttonText) {
    await this.page.locator(\`\${this.modalFooter} button\`)
      .filter({ hasText: buttonText })
      .click();
  }
  
  /**
   * Fill an input field in a modal by label
   * @param {string} label - Label text of the field
   * @param {string} value - Value to fill
   */
  async fillModalInput(label, value) {
    await this.page.locator(\`\${this.modalContent} label\`)
      .filter({ hasText: label })
      .locator('xpath=..//input, ../textarea')
      .fill(value);
  }
  
  /**
   * Check if a modal is visible
   * @returns {Promise<boolean>} - Whether the modal is visible
   */
  async isModalVisible() {
    return await this.page.locator(this.modalContainer).isVisible();
  }
  
  /**
   * Get text content from the modal
   * @returns {Promise<string>} - Text content of the modal
   */
  async getModalContent() {
    return await this.page.locator(this.modalContent).textContent();
  }`;
  }

  return `/**
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
    ${Object.entries(elements).map(([type, items]) => {
      if (type === 'modals') return ''; // Skip modals, we handle them separately
      return items.length > 0 ? `// ${type.charAt(0).toUpperCase() + type.slice(1)}\n    ` + 
      items.map(item => `this.${item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()} = '${item.selector}';`).join('\n    ')
      : ''
    }).filter(Boolean).join('\n\n    ')}${modalSelectors}
  }

  /**
   * Navigate to the page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    ${isSalesforce 
      ? "await this.page.waitForSelector('force-record-layout-section', { timeout: 30000 }).catch(() => {});"
      : "// Wait for main content to be available\n    await this.page.waitForSelector('body', { timeout: 30000 });"}
  }

  ${Object.entries(elements).map(([type, items]) => {
    if (type === 'modals') return ''; // Skip modals, we handle them separately
    return items.map(item => {
      const methodName = item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const capitalizedMethodName = methodName.charAt(0).toUpperCase() + methodName.slice(1);
      
      switch(type) {
        case 'buttons':
          return `/**
   * Click ${item.name} button
   */
  async click${capitalizedMethodName}() {
    await this.click(this.${methodName});
  }`;
        case 'inputs':
        case 'textareas':
          return `/**
   * Fill ${item.name}
   * @param {string} value
   */
  async fill${capitalizedMethodName}(value) {
    await this.fill(this.${methodName}, value);
  }`;
        case 'selects':
        case 'comboboxes':
          return `/**
   * Select ${item.name} option
   * @param {string} value
   */
  async select${capitalizedMethodName}(value) {
    await this.selectOption(this.${methodName}, value);
  }`;
        case 'links':
          return `/**
   * Click ${item.name} link
   */
  async click${capitalizedMethodName}() {
    await this.click(this.${methodName});
  }`;
        case 'forms':
          return `/**
   * Submit ${item.name} form
   */
  async submit${capitalizedMethodName}() {
    await this.page.evaluate(selector => {
      document.querySelector(selector).submit();
    }, this.${methodName});
  }`;
        default:
          return '';
      }
    }).filter(Boolean).join('\n\n  ')
  }).filter(Boolean).join('\n\n  ')}${modalMethods}
}

module.exports = ${className};`;
}

/**
 * Generate test class content
 * @param {string} className Page class name
 * @param {string} url Page URL
 * @param {Object} elements Extracted elements
 * @param {Object} collections Extracted collections
 * @param {boolean} isSalesforce Whether this is a Salesforce page
 * @returns {string} Generated test class content
 */
function generateTestClass(className, url, elements, collections, isSalesforce) {
  const instanceName = className.charAt(0).toLowerCase() + className.slice(1);
  
  // Find important elements for test cases
  const hasForm = elements.forms && elements.forms.length > 0;
  const hasInputs = elements.inputs && elements.inputs.length > 0;
  const hasButtons = elements.buttons && elements.buttons.length > 0;
  const hasLinks = elements.links && elements.links.length > 0;
  const hasTables = collections.tables && collections.tables.length > 0;
  const hasLists = collections.lists && collections.lists.length > 0;
  const hasModals = elements.modals && elements.modals.length > 0;
  
  // Add modal test if we found modals
  let modalTest = '';
  if (hasModals) {
    modalTest = `
  test('should handle modal dialogs', async () => {
    // Trigger a modal (you may need to adjust this based on your application)
    ${hasButtons ? `await ${instanceName}.click${elements.buttons[0].name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().charAt(0).toUpperCase() + elements.buttons[0].name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(1)}();` : '// Trigger modal here'}
    
    // Wait for modal to appear
    const modalVisible = await ${instanceName}.waitForModal();
    expect(modalVisible).toBeTruthy();
    
    // Get modal title
    const modalTitle = await ${instanceName}.getModalTitle();
    expect(modalTitle).toBeTruthy();
    
    // Close modal
    await ${instanceName}.closeModal();
    
    // Verify modal is closed
    const isStillVisible = await ${instanceName}.isModalVisible();
    expect(isStillVisible).toBeFalsy();
  });`;
  }
  
  return `/**
 * ${className} Tests
 * Generated from ${url}
 * @generated
 */
const { test, expect } = require('@playwright/test');
const ${className} = require('../src/pages/${className}');

test.describe('${className} Tests', () => {
  let page;
  let ${instanceName};

  test.beforeEach(async ({ browser }) => {
    ${isSalesforce ? `// Create a new context with storage state (logged in session)
    const context = await browser.newContext({
      storageState: './auth/salesforce-storage-state.json'
    });
    
    page = await context.newPage();` : 'page = await browser.newPage();'}
    ${instanceName} = new ${className}(page);
    
    // Navigate to the page
    await ${instanceName}.goto();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load the page successfully', async () => {
    // Verify page loaded
    await expect(page).toHaveURL(new RegExp(${JSON.stringify(url.replace(/https?:\/\/[^/]+/, ''))}));
    ${hasForm ? `await expect(page.locator('form')).toBeVisible();` : ''}
  });
  ${hasInputs ? `
  test('should interact with form elements', async () => {
    ${elements.inputs.slice(0, 3).map(input => {
      const methodName = input.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const capitalizedMethodName = methodName.charAt(0).toUpperCase() + methodName.slice(1);
      return `// Fill ${input.name} field
    await ${instanceName}.fill${capitalizedMethodName}('Test value');`;
    }).join('\n    ')}
    ${hasButtons ? `
    // Submit form
    ${elements.buttons.slice(0, 1).map(button => {
      const methodName = button.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const capitalizedMethodName = methodName.charAt(0).toUpperCase() + methodName.slice(1);
      return `await ${instanceName}.click${capitalizedMethodName}();`;
    }).join('\n    ')}` : ''}
  });` : ''}
  ${hasLinks ? `
  test('should navigate using links', async () => {
    ${elements.links.slice(0, 1).map(link => {
      const methodName = link.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const capitalizedMethodName = methodName.charAt(0).toUpperCase() + methodName.slice(1);
      return `// Click ${link.name} link
    const navigationPromise = page.waitForNavigation();
    await ${instanceName}.click${capitalizedMethodName}();
    await navigationPromise;`;
    }).join('\n    ')}
  });` : ''}
  ${hasTables ? `
  test('should interact with tables', async () => {
    ${collections.tables.slice(0, 1).map(table => {
      const safeName = table.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const capitalizedName = safeName.charAt(0).toUpperCase() + safeName.slice(1);
      return `// Get table rows
    const rows = await ${instanceName}.get${capitalizedName}Rows();
    expect(rows.length).toBeGreaterThan(0);`;
    }).join('\n    ')}
  });` : ''}
  ${hasLists ? `
  test('should interact with lists', async () => {
    ${collections.lists.slice(0, 1).map(list => {
      const safeName = list.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const capitalizedName = safeName.charAt(0).toUpperCase() + safeName.slice(1);
      return `// Get list items
    const items = await ${instanceName}.get${capitalizedName}Items();
    expect(items.length).toBeGreaterThan(0);`;
    }).join('\n    ')}
  });` : ''}${modalTest}
});`;
}

module.exports = { generatePageObject };