/**
 * Element Extractor
 * Consolidated extraction logic for both standard and Salesforce elements
 */
const config = require('./config');
const selectors = require('./selectors');

/**
 * Extract elements from a standard web page
 * @param {import('@playwright/test').Page} page 
 * @returns {Promise<Object>}
 */
async function extractStandardElements(page) {
  // Wait for page to fully load
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {
    console.log('DOM content loaded timeout - continuing anyway');
  });
  
  await page.waitForSelector(config.extraction.waitForSelectors.standard, 
    { timeout: config.extraction.timeout }).catch(() => {});
  
  // Get all selectors for general mode
  const allSelectors = selectors.getSelectors({ mode: 'general' });
  
  // First, get all visible elements on the page
  const visibleElements = await page.evaluate(() => {
    // Get all visible elements
    const allElements = Array.from(document.querySelectorAll('*'));
    return allElements
      .filter(el => {
        // Check if element is visible
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetWidth > 0 && 
               el.offsetHeight > 0;
      })
      .map(el => {
        // Get basic info about the element
        const tagName = el.tagName.toLowerCase();
        const id = el.id;
        const classNames = Array.from(el.classList);
        const type = el.getAttribute('type');
        const name = el.getAttribute('name');
        const placeholder = el.getAttribute('placeholder');
        const ariaLabel = el.getAttribute('aria-label');
        const role = el.getAttribute('role');
        const text = el.textContent?.trim();
        
        return {
          tagName,
          id,
          classNames,
          type,
          name,
          placeholder,
          ariaLabel,
          role,
          text
        };
      });
  });
  
  // Now extract elements based on our selectors
  return await page.evaluate((selectorsAndElements) => {
    const selectorsList = selectorsAndElements.selectors;
    const visibleElementsData = selectorsAndElements.elements;
    
    const result = {
      buttons: [],
      inputs: [],
      selects: [],
      textareas: [],
      links: [],
      forms: [],
      tables: [],
      lists: [],
      containers: [],
      modals: []  // Added modals category
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
      
      // Try placeholder
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) return `[placeholder="${placeholder}"]`;
      
      // Try title
      const title = element.getAttribute('title');
      if (title) return `[title="${title}"]`;
      
      // Fallback to tag + attributes
      const tag = element.tagName.toLowerCase();
      const type = element.getAttribute('type');
      return type ? `${tag}[type="${type}"]` : tag;
    }

    // Helper function to get element name
    function getElementName(element, defaultName = '') {
      // Try various attributes for naming
      const label = element.getAttribute('aria-label') || 
                    element.getAttribute('placeholder') || 
                    element.getAttribute('title') || 
                    element.getAttribute('name') || 
                    element.getAttribute('id');
      
      if (label) {
        return label.trim();
      }
      
      // For buttons and links, use text content
      if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        const text = element.textContent?.trim();
        if (text) return text;
      }
      
      // For inputs, check associated label
      if (element.tagName === 'INPUT' && element.id) {
        const labelElement = document.querySelector(`label[for="${element.id}"]`);
        if (labelElement) {
          const labelText = labelElement.textContent?.trim();
          if (labelText) return labelText;
        }
      }
      
      // Fallback to default name
      return defaultName;
    }

    // Process each selector
    selectorsList.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(element => {
          // Skip hidden elements unless configured to include them
          if (!element.offsetParent && !window.getComputedStyle(element).display.includes('flex')) {
            return;
          }
          
          const tagName = element.tagName.toLowerCase();
          const type = element.getAttribute('type')?.toLowerCase();
          
          // Check for modals/dialogs
          if (element.classList.contains('modal') || 
              element.getAttribute('role') === 'dialog' || 
              element.getAttribute('role') === 'alertdialog' ||
              element.classList.contains('dialog') ||
              element.classList.contains('popup')) {
            const name = getElementName(element, 'modal');
            const selector = getBestSelector(element);
            result.modals.push({
              name,
              selector,
              type: 'modal',
              headerSelector: `${selector} header, ${selector} .header, ${selector} .modal-header`,
              contentSelector: `${selector} .content, ${selector} .modal-content, ${selector} .body`,
              footerSelector: `${selector} footer, ${selector} .footer, ${selector} .modal-footer`
            });
          }
          // Categorize element
          else if (tagName === 'button' || type === 'button' || type === 'submit' || type === 'reset') {
            const name = getElementName(element, 'button');
            const selector = getBestSelector(element);
            result.buttons.push({
              name,
              selector,
              type: 'button'
            });
          } else if (tagName === 'input' && ['text', 'password', 'email', 'tel', 'number', 'url', 'search'].includes(type)) {
            const name = getElementName(element, type);
            const selector = getBestSelector(element);
            result.inputs.push({
              name,
              selector,
              type
            });
          } else if (tagName === 'select') {
            const name = getElementName(element, 'select');
            const selector = getBestSelector(element);
            result.selects.push({
              name,
              selector,
              type: 'select'
            });
          } else if (tagName === 'textarea') {
            const name = getElementName(element, 'textarea');
            const selector = getBestSelector(element);
            result.textareas.push({
              name,
              selector,
              type: 'textarea'
            });
          } else if (tagName === 'a' && element.hasAttribute('href')) {
            const name = getElementName(element, 'link');
            const selector = getBestSelector(element);
            result.links.push({
              name,
              selector,
              type: 'link'
            });
          } else if (tagName === 'form') {
            const name = getElementName(element, 'form');
            const selector = getBestSelector(element);
            result.forms.push({
              name,
              selector,
              type: 'form'
            });
          } else if (tagName === 'table') {
            const name = getElementName(element, 'table');
            const selector = getBestSelector(element);
            const headers = Array.from(element.querySelectorAll('th')).map(th => th.textContent.trim());
            result.tables.push({
              name,
              selector,
              headers,
              rowSelector: 'tr',
              cellSelector: 'td',
              type: 'table'
            });
          } else if (tagName === 'ul' || tagName === 'ol') {
            const name = getElementName(element, 'list');
            const selector = getBestSelector(element);
            result.lists.push({
              name,
              selector,
              itemSelector: 'li',
              type: 'list'
            });
          } else if (['div', 'section', 'article', 'main'].includes(tagName) && 
                     (element.getAttribute('role') || element.className)) {
            const name = getElementName(element, 'container');
            const selector = getBestSelector(element);
            result.containers.push({
              name,
              selector,
              type: 'container'
            });
          }
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });
    
    // Add elements from visible elements data that might have been missed
    visibleElementsData.forEach(elData => {
      if (elData.tagName === 'input' && elData.type && !['hidden', 'submit', 'button'].includes(elData.type)) {
        // Check if we already have this element
        const exists = result.inputs.some(input => 
          input.selector === `#${elData.id}` || 
          input.selector === `[name="${elData.name}"]` ||
          input.selector === `[placeholder="${elData.placeholder}"]`
        );
        
        if (!exists) {
          let selector = '';
          if (elData.id) selector = `#${elData.id}`;
          else if (elData.name) selector = `[name="${elData.name}"]`;
          else if (elData.placeholder) selector = `[placeholder="${elData.placeholder}"]`;
          else selector = `input[type="${elData.type}"]`;
          
          const name = elData.placeholder || elData.name || elData.id || elData.type;
          
          result.inputs.push({
            name,
            selector,
            type: elData.type
          });
        }
      }
      
      // Look for modals/dialogs
      if ((elData.classNames && (elData.classNames.includes('modal') || elData.classNames.includes('dialog') || elData.classNames.includes('popup'))) ||
          elData.role === 'dialog' || elData.role === 'alertdialog') {
        
        const exists = result.modals.some(modal => 
          modal.selector === `#${elData.id}` || 
          (elData.classNames && elData.classNames.some(cls => modal.selector.includes(cls)))
        );
        
        if (!exists) {
          let selector = '';
          if (elData.id) selector = `#${elData.id}`;
          else if (elData.classNames && elData.classNames.length > 0) {
            const modalClass = elData.classNames.find(cls => 
              cls.includes('modal') || cls.includes('dialog') || cls.includes('popup')
            );
            if (modalClass) selector = `.${modalClass}`;
            else selector = `.${elData.classNames[0]}`;
          }
          else if (elData.role) selector = `[role="${elData.role}"]`;
          else selector = elData.tagName;
          
          const name = elData.ariaLabel || 'modal';
          
          result.modals.push({
            name,
            selector,
            type: 'modal',
            headerSelector: `${selector} header, ${selector} .header, ${selector} .modal-header`,
            contentSelector: `${selector} .content, ${selector} .modal-content, ${selector} .body`,
            footerSelector: `${selector} footer, ${selector} .footer, ${selector} .modal-footer`
          });
        }
      }
    });

    // Remove duplicates based on selector
    const uniqueElements = {};
    
    Object.keys(result).forEach(type => {
      const uniqueItems = [];
      const seen = new Set();
      
      result[type].forEach(item => {
        if (!seen.has(item.selector)) {
          seen.add(item.selector);
          uniqueItems.push(item);
        }
      });
      
      result[type] = uniqueItems;
    });

    return result;
  }, { selectors: allSelectors, elements: visibleElements });
}

/**
 * Extract elements from a Salesforce page
 * @param {import('@playwright/test').Page} page 
 * @returns {Promise<Object>}
 */
async function extractSalesforceElements(page) {
  // Wait for Salesforce page to fully load
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {
    console.log('DOM content loaded timeout - continuing anyway');
  });
  
  // Try to wait for Salesforce elements with extended timeout
  const selectorsList = config.extraction.waitForSelectors.salesforce.split(', ');
  let foundElement = false;
  
  for (const selector of selectorsList) {
    const isVisible = await page.locator(selector).isVisible().catch(() => false);
    if (isVisible) {
      foundElement = true;
      console.log(`Found Salesforce element: ${selector}`);
      break;
    }
  }
  
  if (!foundElement) {
    console.log('Could not find any Salesforce elements - extracting available elements');
  }
  
  // Get all selectors for Salesforce mode
  const allSelectors = selectors.getSelectors({ mode: 'salesforce' });
  
  // First, get all visible elements on the page
  const visibleElements = await page.evaluate(() => {
    // Get all visible elements
    const allElements = Array.from(document.querySelectorAll('*'));
    return allElements
      .filter(el => {
        // Check if element is visible
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetWidth > 0 && 
               el.offsetHeight > 0;
      })
      .map(el => {
        // Get basic info about the element
        const tagName = el.tagName.toLowerCase();
        const id = el.id;
        const classNames = Array.from(el.classList);
        const type = el.getAttribute('type');
        const name = el.getAttribute('name');
        const label = el.getAttribute('label');
        const fieldName = el.getAttribute('data-field-name') || el.getAttribute('field-name');
        const ariaLabel = el.getAttribute('aria-label');
        const role = el.getAttribute('role');
        const text = el.textContent?.trim();
        
        return {
          tagName,
          id,
          classNames,
          type,
          name,
          label,
          fieldName,
          ariaLabel,
          role,
          text,
          isSalesforce: tagName.startsWith('lightning-') || 
                        tagName.startsWith('force-') || 
                        classNames.some(c => c.startsWith('slds-'))
        };
      });
  });
  
  // Now extract elements based on our selectors
  return await page.evaluate((selectorsAndElements) => {
    const selectorsList = selectorsAndElements.selectors;
    const visibleElementsData = selectorsAndElements.elements;
    
    const result = {
      buttons: [],
      inputs: [],
      comboboxes: [],
      textareas: [],
      sections: [],
      tables: [],
      lists: [],
      dataTables: [],
      cards: [],
      fields: [],
      modals: []  // Added modals category
    };

    // Helper function to get best selector for Salesforce
    function getBestSelector(element) {
      // Try Salesforce specific attributes
      const fieldApiName = element.getAttribute('data-field-name') || element.getAttribute('field-name');
      const label = element.getAttribute('label') || element.getAttribute('data-label');
      
      if (label && fieldApiName) {
        const tagName = element.tagName.toLowerCase();
        return `${tagName}[label="${label}"][data-field-name="${fieldApiName}"]`;
      }
      
      if (label) {
        const tagName = element.tagName.toLowerCase();
        return `${tagName}[label="${label}"]`;
      }
      
      if (fieldApiName) {
        const tagName = element.tagName.toLowerCase();
        return `${tagName}[data-field-name="${fieldApiName}"]`;
      }
      
      // Try data attributes
      const dataTestId = element.getAttribute('data-testid');
      if (dataTestId) return `[data-testid="${dataTestId}"]`;
      
      const dataAuraId = element.getAttribute('data-aura-id');
      if (dataAuraId) return `[data-aura-id="${dataAuraId}"]`;
      
      const dataAuraRenderedBy = element.getAttribute('data-aura-rendered-by');
      if (dataAuraRenderedBy) return `[data-aura-rendered-by="${dataAuraRenderedBy}"]`;
      
      // Try ARIA attributes
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return `[aria-label="${ariaLabel}"]`;
      
      // Try ID
      const id = element.id;
      if (id) return `#${id}`;
      
      // Fallback to tag name
      return element.tagName.toLowerCase();
    }

    // Helper function to get element name for Salesforce
    function getElementName(element, defaultName = '') {
      // Try Salesforce specific attributes
      const label = element.getAttribute('label') || 
                    element.getAttribute('data-label') || 
                    element.getAttribute('data-field-name') || 
                    element.getAttribute('field-name');
      
      if (label) {
        return label.trim();
      }
      
      // Try standard attributes
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel.trim();
      
      const title = element.getAttribute('title');
      if (title) return title.trim();
      
      // For buttons, use text content
      if (element.tagName.toLowerCase().includes('button') || 
          element.getAttribute('role') === 'button') {
        const text = element.textContent?.trim();
        if (text) return text;
      }
      
      // Fallback to default name
      return defaultName;
    }

    // Process each selector
    selectorsList.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(element => {
          const tagName = element.tagName.toLowerCase();
          
          // Check for Salesforce modals
          if (element.classList.contains('slds-modal') || 
              element.getAttribute('role') === 'dialog' || 
              element.classList.contains('modal-container')) {
            const name = getElementName(element, 'modal');
            const selector = getBestSelector(element);
            result.modals.push({
              name,
              selector,
              type: 'modal',
              headerSelector: '.slds-modal__header',
              contentSelector: '.slds-modal__content',
              footerSelector: '.slds-modal__footer',
              closeSelector: '.slds-modal__close'
            });
          }
          // Categorize Salesforce elements
          else if (tagName.startsWith('lightning-button') || 
              element.classList.contains('slds-button') || 
              element.getAttribute('role') === 'button') {
            const name = getElementName(element, 'button');
            const selector = getBestSelector(element);
            result.buttons.push({
              name,
              selector,
              type: 'button'
            });
          } else if (tagName === 'lightning-input' || 
                     element.classList.contains('slds-input') || 
                     tagName === 'input') {
            const name = getElementName(element, 'input');
            const selector = getBestSelector(element);
            const type = element.getAttribute('type') || 'text';
            result.inputs.push({
              name,
              selector,
              type
            });
          } else if (tagName === 'lightning-combobox' || 
                     element.classList.contains('slds-combobox') || 
                     tagName === 'select') {
            const name = getElementName(element, 'combobox');
            const selector = getBestSelector(element);
            result.comboboxes.push({
              name,
              selector,
              type: 'combobox'
            });
          } else if (tagName === 'lightning-textarea' || 
                     element.classList.contains('slds-textarea') || 
                     tagName === 'textarea') {
            const name = getElementName(element, 'textarea');
            const selector = getBestSelector(element);
            result.textareas.push({
              name,
              selector,
              type: 'textarea'
            });
          } else if (tagName === 'lightning-datatable') {
            const name = getElementName(element, 'datatable');
            const selector = getBestSelector(element);
            result.dataTables.push({
              name,
              selector,
              type: 'datatable'
            });
          } else if (tagName === 'lightning-card' || 
                     element.classList.contains('slds-card')) {
            const name = getElementName(element, 'card');
            const selector = getBestSelector(element);
            result.cards.push({
              name,
              selector,
              type: 'card'
            });
          } else if (tagName === 'force-record-layout-section') {
            const heading = element.querySelector('h3');
            const name = heading?.textContent?.trim() || 'section';
            result.sections.push({
              name,
              selector: 'force-record-layout-section',
              type: 'section'
            });
          } else if (tagName === 'lightning-input-field' || 
                     tagName === 'lightning-output-field') {
            const name = getElementName(element, 'field');
            const selector = getBestSelector(element);
            result.fields.push({
              name,
              selector,
              type: tagName
            });
          } else if (tagName === 'table' || 
                     element.classList.contains('slds-table')) {
            const name = getElementName(element, 'table');
            const selector = getBestSelector(element);
            const headers = Array.from(element.querySelectorAll('th')).map(th => th.textContent.trim());
            result.tables.push({
              name,
              selector,
              headers,
              rowSelector: 'tr',
              cellSelector: 'td',
              type: 'table'
            });
          } else if (tagName === 'ul' || tagName === 'ol' || 
                     element.getAttribute('role') === 'list' || 
                     element.getAttribute('role') === 'listbox') {
            const name = getElementName(element, 'list');
            const selector = getBestSelector(element);
            result.lists.push({
              name,
              selector,
              itemSelector: 'li, [role="listitem"], [role="option"]',
              type: 'list'
            });
          }
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });
    
    // Add elements from visible elements data that might have been missed
    visibleElementsData.forEach(elData => {
      // Look for Salesforce modals
      if ((elData.classNames && (elData.classNames.includes('slds-modal') || elData.classNames.includes('modal-container'))) ||
          elData.role === 'dialog') {
        
        const exists = result.modals.some(modal => 
          modal.selector === `#${elData.id}` || 
          (elData.classNames && elData.classNames.some(cls => modal.selector.includes(cls)))
        );
        
        if (!exists) {
          let selector = '';
          if (elData.id) selector = `#${elData.id}`;
          else if (elData.classNames && elData.classNames.length > 0) {
            const modalClass = elData.classNames.find(cls => 
              cls.includes('slds-modal') || cls.includes('modal-container')
            );
            if (modalClass) selector = `.${modalClass}`;
            else selector = `.${elData.classNames[0]}`;
          }
          else if (elData.role) selector = `[role="${elData.role}"]`;
          else selector = elData.tagName;
          
          const name = elData.ariaLabel || 'modal';
          
          result.modals.push({
            name,
            selector,
            type: 'modal',
            headerSelector: '.slds-modal__header',
            contentSelector: '.slds-modal__content',
            footerSelector: '.slds-modal__footer',
            closeSelector: '.slds-modal__close'
          });
        }
      }
      
      if (elData.isSalesforce) {
        if (elData.tagName.startsWith('lightning-input') || 
            (elData.classNames && elData.classNames.includes('slds-input'))) {
          // Check if we already have this element
          const exists = result.inputs.some(input => 
            input.selector === `#${elData.id}` || 
            (elData.label && input.selector === `${elData.tagName}[label="${elData.label}"]`) ||
            (elData.fieldName && input.selector === `${elData.tagName}[data-field-name="${elData.fieldName}"]`)
          );
          
          if (!exists) {
            let selector = '';
            if (elData.label) selector = `${elData.tagName}[label="${elData.label}"]`;
            else if (elData.fieldName) selector = `${elData.tagName}[data-field-name="${elData.fieldName}"]`;
            else if (elData.id) selector = `#${elData.id}`;
            else selector = elData.tagName;
            
            const name = elData.label || elData.fieldName || elData.ariaLabel || 'input';
            
            result.inputs.push({
              name,
              selector,
              type: elData.type || 'text'
            });
          }
        }
      }
    });

    // Remove duplicates based on selector
    const uniqueElements = {};
    
    Object.keys(result).forEach(type => {
      const uniqueItems = [];
      const seen = new Set();
      
      result[type].forEach(item => {
        if (!seen.has(item.selector)) {
          seen.add(item.selector);
          uniqueItems.push(item);
        }
      });
      
      result[type] = uniqueItems;
    });

    return result;
  }, { selectors: allSelectors, elements: visibleElements });
}

/**
 * Handle Salesforce authentication
 * @param {import('@playwright/test').Page} page 
 * @param {Object} auth 
 */
async function handleSalesforceAuth(page, auth) {
  if (!auth?.username || !auth?.password) return;

  console.log('Authenticating with Salesforce...');
  
  // Go to login page first
  await page.goto(config.salesforce.loginUrl);
  
  // Handle login
  await page.fill('#username', auth.username);
  await page.fill('#password', auth.password);
  await page.click('#Login');
  
  // Wait for Salesforce to load with extended timeout
  const extendedTimeout = 60000; // 60 seconds
  
  try {
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle', { timeout: extendedTimeout });
    
    // Check for verification or additional steps
    const verifyElement = await page.locator('input[id="verificationCode"], #challenge', { timeout: 5000 }).isVisible().catch(() => false);
    
    if (verifyElement) {
      console.log('Verification step detected. Please complete verification manually in the browser window.');
      // Wait for manual verification (up to 2 minutes)
      await page.waitForSelector('one-app-nav-bar, .slds-global-header', { timeout: 120000 }).catch(() => {});
    } else {
      // Normal flow - wait for Salesforce to load
      await page.waitForSelector('one-app-nav-bar, .slds-global-header', { timeout: extendedTimeout }).catch(() => {});
    }
    
    console.log('Authentication successful');
  } catch (error) {
    console.log('Authentication may have encountered issues. Continuing anyway...');
    // Continue anyway - the page might still be usable
  }
}

module.exports = {
  extractStandardElements,
  extractSalesforceElements,
  handleSalesforceAuth
};