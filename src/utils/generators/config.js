/**
 * Configuration for page generators
 */
module.exports = {
  // Output paths
  output: {
    pagesDir: './src/pages',
    testsDir: './tests/pages',
    elementsFile: './temp/extracted-elements.json'
  },
  
  // Extraction options
  extraction: {
    // Wait for these selectors to be present before extraction
    waitForSelectors: {
      standard: 'body',
      salesforce: 'force-record-layout-section, lightning-card, .slds-form, .slds-form-element'
    },
    
    // Timeout for waiting for elements (ms)
    timeout: 60000,
    
    // Whether to include hidden elements
    includeHidden: false,
    
    // Whether to extract DOM collections
    extractCollections: true,
    
    // Collection types to extract
    collectionTypes: ['tables', 'lists', 'grids', 'repeaters', 'dataTables']
  },
  
  // Salesforce specific options
  salesforce: {
    // Login URL
    loginUrl: 'https://login.salesforce.com',
    
    // Auth storage path
    authStoragePath: './auth/salesforce-storage-state.json',
    
    // Lightning components to extract
    components: [
      'lightning-input',
      'lightning-combobox',
      'lightning-textarea',
      'lightning-checkbox-group',
      'lightning-radio-group',
      'lightning-button',
      'lightning-datatable',
      'lightning-card',
      'force-record-layout-item',
      'force-record-layout-section',
      'lightning-input-field',
      'lightning-output-field'
    ]
  }
};