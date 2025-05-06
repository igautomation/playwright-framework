/**
 * Environment configuration module
 * Loads environment variables and provides defaults
 */
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
let envConfig = {};

// Try to load environment-specific configuration
try {
  envConfig = require(`./environments/${env}`);
} catch (error) {
  console.log(`No specific configuration found for environment: ${env}, using defaults`);
  envConfig = {};
}

module.exports = {
  // Base configuration with defaults
  baseUrl: process.env.BASE_URL || envConfig.baseUrl || 'https://example.com',
  apiUrl: process.env.API_URL || envConfig.apiUrl || 'https://api.example.com',
  
  // Authentication
  credentials: {
    username: process.env.TEST_USERNAME || envConfig.username || 'testuser',
    password: process.env.TEST_PASSWORD || envConfig.password || 'password123',
    apiKey: process.env.API_KEY || envConfig.apiKey || '',
    authToken: process.env.AUTH_TOKEN || envConfig.authToken || '',
  },
  
  // Timeouts
  timeouts: {
    default: parseInt(process.env.DEFAULT_TIMEOUT || envConfig.defaultTimeout || '30000'),
    short: parseInt(process.env.SHORT_TIMEOUT || envConfig.shortTimeout || '10000'),
    long: parseInt(process.env.LONG_TIMEOUT || envConfig.longTimeout || '60000'),
    pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || envConfig.pageLoadTimeout || '30000'),
    animation: parseInt(process.env.ANIMATION_TIMEOUT || envConfig.animationTimeout || '5000'),
  },
  
  // Test data
  testData: {
    dataPath: process.env.TEST_DATA_PATH || envConfig.testDataPath || 'src/data',
  },
  
  // Visual testing
  visual: {
    baselineDir: process.env.VISUAL_BASELINE_DIR || envConfig.visualBaselineDir || 'visual-baselines',
    diffDir: process.env.VISUAL_DIFF_DIR || envConfig.visualDiffDir || 'visual-diffs',
    threshold: parseFloat(process.env.VISUAL_THRESHOLD || envConfig.visualThreshold || '0.1'),
  },
  
  // Browser configuration
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO || envConfig.slowMo || '0'),
    defaultBrowser: process.env.DEFAULT_BROWSER || envConfig.defaultBrowser || 'chromium',
  },
  
  // Reporting
  reporting: {
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
    videoOnFailure: process.env.VIDEO_ON_FAILURE !== 'false',
    allureResultsDir: process.env.ALLURE_RESULTS_DIR || envConfig.allureResultsDir || 'allure-results',
  },
  
  // Feature flags
  features: {
    selfHealing: process.env.SELF_HEALING !== 'false',
    retryOnFailure: process.env.RETRY_ON_FAILURE !== 'false',
    parallelExecution: process.env.PARALLEL_EXECUTION !== 'false',
  }
};