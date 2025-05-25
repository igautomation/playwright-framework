const WebScrapingUtils = require('./webScrapingUtils');
const DataProvider = require('./dataProvider');
const SelfHealingLocator = require('./SelfHealingLocator');
const AccessibilityUtils = require('./accessibilityUtils');
const DomComparisonUtils = require('./domComparisonUtils');
const FlakyLocatorDetector = require('./flakyLocatorDetector');
const NetworkUtils = require('./networkUtils');
const PerformanceUtils = require('./performanceUtils');
const ScreenshotUtils = require('./screenshotUtils');
const WebInteractions = require('./webInteractions');

module.exports = {
  WebScrapingUtils,
  DataProvider,
  SelfHealingLocator,
  AccessibilityUtils,
  DomComparisonUtils,
  FlakyLocatorDetector,
  NetworkUtils,
  PerformanceUtils,
  ScreenshotUtils,
  WebInteractions
};