/**
 * Playwright Framework Entry Point
 * 
 * This file serves as the main entry point for the framework.
 * It exports all the necessary modules for external use.
 */

// Load environment variables
require('dotenv').config();

// Export core modules
module.exports = {
  // Page objects
  BasePage: require('./src/pages/BasePage'),
  
  // Utilities
  WebInteractions: require('./src/utils/web/webInteractions'),
  ApiUtils: require('./src/utils/api/apiUtils').ApiUtils,
  ApiClient: require('./src/utils/api/apiUtils').ApiClient,
  VisualComparisonUtils: require('./src/utils/visual/visualComparisonUtils'),
  AccessibilityUtils: require('./src/utils/accessibility/accessibilityUtils'),
  
  // Configuration
  config: require('./src/config'),
  
  // Test fixtures
  fixtures: require('./src/fixtures'),
  
  // Version information
  version: require('./package.json').version,
};