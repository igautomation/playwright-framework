/**
 * Page Object Generators Index
 * 
 * Exports all generator utilities for easy importing
 */
const { generatePageObject } = require('./page-generator');
const { generateSalesforcePageObject } = require('./sf-page-generator');
const { extractStandardElements, extractSalesforceElements } = require('./element-extractor');
const { extractCollections } = require('./domCollections');
const config = require('./config');

module.exports = {
  generatePageObject,
  generateSalesforcePageObject,
  extractStandardElements,
  extractSalesforceElements,
  extractCollections,
  config
};