/**
 * DOM Collections Utility
 * Optimized utilities for working with collections of DOM elements
 */

/**
 * Extract collection elements from the page
 * @param {import('@playwright/test').Page} page 
 * @param {Object} options
 * @returns {Promise<Object>}
 */
async function extractCollections(page, options = {}) {
  return await page.evaluate(() => {
    const collections = {
      tables: [],
      lists: [],
      grids: [],
      repeaters: []
    };

    // Helper function to get best selector for a collection
    function getCollectionSelector(element) {
      // Try data attributes first
      const dataTestId = element.getAttribute('data-testid');
      if (dataTestId) return `[data-testid="${dataTestId}"]`;
      
      // Try ID
      const id = element.id;
      if (id) return `#${id}`;
      
      // Try role
      const role = element.getAttribute('role');
      if (role && ['grid', 'table', 'list', 'listbox'].includes(role)) {
        return `[role="${role}"]`;
      }
      
      // Try tag name
      const tag = element.tagName.toLowerCase();
      return tag;
    }

    // Extract tables
    document.querySelectorAll('table, [role="grid"], [role="table"], lightning-datatable').forEach(table => {
      const selector = getCollectionSelector(table);
      const headers = Array.from(table.querySelectorAll('th, [role="columnheader"]'))
        .map(th => th.textContent.trim());
      
      collections.tables.push({
        name: table.getAttribute('aria-label') || 
              table.getAttribute('title') || 
              'table',
        selector,
        headers,
        rowSelector: 'tr, [role="row"]',
        cellSelector: 'td, [role="cell"]',
        type: 'table'
      });
    });

    // Extract lists
    document.querySelectorAll('ul, ol, [role="list"], [role="listbox"]').forEach(list => {
      const selector = getCollectionSelector(list);
      collections.lists.push({
        name: list.getAttribute('aria-label') || 
              list.getAttribute('title') || 
              'list',
        selector,
        itemSelector: 'li, [role="listitem"], [role="option"]',
        type: 'list'
      });
    });

    // Extract grids (div-based tables)
    document.querySelectorAll('.slds-grid, .grid, [class*="grid"]').forEach(grid => {
      const selector = getCollectionSelector(grid);
      collections.grids.push({
        name: grid.getAttribute('aria-label') || 
              grid.getAttribute('title') || 
              'grid',
        selector,
        rowSelector: '.slds-grid__row, .row, [class*="row"]',
        cellSelector: '.slds-grid__cell, .cell, [class*="cell"]',
        type: 'grid'
      });
    });

    // Extract repeaters (repeated elements with similar structure)
    document.querySelectorAll('[ng-repeat], [v-for], [data-repeater], .slds-card, lightning-card').forEach(repeater => {
      const selector = getCollectionSelector(repeater);
      collections.repeaters.push({
        name: repeater.getAttribute('aria-label') || 
              repeater.getAttribute('title') || 
              'repeater',
        selector,
        type: 'repeater'
      });
    });

    return collections;
  });
}

/**
 * Generate collection methods for a page object
 * @param {Object} collections - Collection objects extracted from the page
 * @returns {string} - Generated methods as string
 */
function generateCollectionMethods(collections) {
  let methods = '';
  
  // Generate table methods
  if (collections.tables && collections.tables.length > 0) {
    collections.tables.forEach(table => {
      const safeName = table.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const capitalizedName = safeName.charAt(0).toUpperCase() + safeName.slice(1);
      
      methods += `
  /**
   * Get all rows from ${table.name} table
   * @returns {Promise<Array<Object>>} - Array of row objects with column values
   */
  async get${capitalizedName}Rows() {
    const rows = await this.page.locator('${table.selector} ${table.rowSelector}').all();
    const result = [];
    
    for (const row of rows) {
      const cells = await row.locator('${table.cellSelector}').all();
      const rowData = {};
      
      // If we have headers, use them as keys
      ${table.headers && table.headers.length > 0 ? 
        `const headers = ${JSON.stringify(table.headers)};
      for (let i = 0; i < cells.length && i < headers.length; i++) {
        rowData[headers[i]] = await cells[i].textContent();
      }` : 
        `for (let i = 0; i < cells.length; i++) {
        rowData[i] = await cells[i].textContent();
      }`}
      
      result.push(rowData);
    }
    
    return result;
  }

  /**
   * Get specific row from ${table.name} table by matching criteria
   * @param {Object} criteria - Key-value pairs to match against row data
   * @returns {Promise<Object>} - Row data object
   */
  async get${capitalizedName}Row(criteria) {
    const rows = await this.get${capitalizedName}Rows();
    
    return rows.find(row => {
      return Object.entries(criteria).every(([key, value]) => {
        return row[key] && row[key].includes(value);
      });
    });
  }

  /**
   * Click on a specific cell in ${table.name} table
   * @param {Object} criteria - Key-value pairs to match against row data
   * @param {string|number} columnKey - Column name or index to click
   */
  async clickIn${capitalizedName}(criteria, columnKey) {
    const rows = await this.page.locator('${table.selector} ${table.rowSelector}').all();
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = await row.locator('${table.cellSelector}').all();
      const rowData = {};
      
      ${table.headers && table.headers.length > 0 ? 
        `const headers = ${JSON.stringify(table.headers)};
      for (let j = 0; j < cells.length && j < headers.length; j++) {
        rowData[headers[j]] = await cells[j].textContent();
      }` : 
        `for (let j = 0; j < cells.length; j++) {
        rowData[j] = await cells[j].textContent();
      }`}
      
      const matches = Object.entries(criteria).every(([key, value]) => {
        return rowData[key] && rowData[key].includes(value);
      });
      
      if (matches) {
        ${table.headers && table.headers.length > 0 ? 
          `const columnIndex = typeof columnKey === 'string' ? headers.indexOf(columnKey) : columnKey;
        if (columnIndex !== -1) {
          await cells[columnIndex].click();
          return;
        }` : 
          `if (typeof columnKey === 'number') {
          await cells[columnKey].click();
          return;
        }`}
      }
    }
    
    throw new Error('No matching row found in table');
  }`;
    });
  }
  
  // Generate list methods
  if (collections.lists && collections.lists.length > 0) {
    collections.lists.forEach(list => {
      const safeName = list.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const capitalizedName = safeName.charAt(0).toUpperCase() + safeName.slice(1);
      
      methods += `
  /**
   * Get all items from ${list.name} list
   * @returns {Promise<Array<string>>} - Array of list item text values
   */
  async get${capitalizedName}Items() {
    const items = await this.page.locator('${list.selector} ${list.itemSelector}').all();
    const result = [];
    
    for (const item of items) {
      result.push(await item.textContent());
    }
    
    return result;
  }

  /**
   * Click on a specific item in ${list.name} list
   * @param {string|RegExp} textOrPattern - Text or pattern to match against list item
   */
  async clickIn${capitalizedName}(textOrPattern) {
    await this.page.locator('${list.selector} ${list.itemSelector}')
      .filter({ hasText: textOrPattern })
      .first()
      .click();
  }`;
    });
  }
  
  return methods;
}

/**
 * Enhance page object with collection methods
 * @param {string} pageObjectCode - Original page object code
 * @param {Object} collections - Collection objects extracted from the page
 * @returns {string} - Enhanced page object code
 */
function enhancePageObjectWithCollections(pageObjectCode, collections) {
  const collectionMethods = generateCollectionMethods(collections);
  
  // Find the position to insert the collection methods (before the last closing brace)
  const lastBraceIndex = pageObjectCode.lastIndexOf('}');
  
  if (lastBraceIndex !== -1) {
    return pageObjectCode.slice(0, lastBraceIndex) + 
           (collectionMethods ? '\n' + collectionMethods + '\n' : '') + 
           pageObjectCode.slice(lastBraceIndex);
  }
  
  return pageObjectCode;
}

module.exports = {
  extractCollections,
  generateCollectionMethods,
  enhancePageObjectWithCollections
};