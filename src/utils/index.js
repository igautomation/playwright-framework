/**
 * Utils Index
 * 
 * Exports all utility functions and classes for easy importing
 */

// API Utilities
const { ApiClient } = require('./api/apiUtils');

// Web Utilities
const WebInteractions = require('./web/webInteractions');
const ScreenshotUtils = require('./web/screenshotUtils');
const SelfHealingLocator = require('./web/SelfHealingLocator');

// Common Utilities
const logger = require('./common/logger');
const TestDataFactory = require('./common/testDataFactory');

// Accessibility Utilities
const accessibilityUtils = require('./accessibility/accessibilityUtils');

module.exports = {
  // API
  ApiClient,
  
  // Web
  WebInteractions,
  ScreenshotUtils,
  SelfHealingLocator,
  
  // Common
  logger,
  TestDataFactory,
  
  // Accessibility
  ...accessibilityUtils
};