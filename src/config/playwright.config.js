<<<<<<< HEAD
// src/config/playwright.config.js

import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv-safe';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import logger from '../utils/common/logger.js';

// Constants for paths and defaults
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');
const ENV_DIR = join(__dirname, 'env');
const ENV_EXAMPLE = join(ROOT_DIR, '.env.example');

const DEFAULTS = {
  NODE_ENV: 'dev',
  TEST_TIMEOUT: 30000,
  EXPECT_TIMEOUT: 10000,
  SCREENSHOT_MAX_DIFF_PIXELS: 50,
  SNAPSHOT_MAX_DIFF_PIXEL_RATIO: 0.05,
  WORKERS: 4,
  MAX_FAILURES: 10,
  SLOWMO: 0,
  HEADLESS: true,
  JAVASCRIPT_ENABLED: true
};

// Load environment variables
const NODE_ENV = process.env.NODE_ENV || DEFAULTS.NODE_ENV;
const envFile = join(ENV_DIR, `${NODE_ENV}.env`);

if (existsSync(envFile)) {
  try {
    loadEnv({
      allowEmptyValues: true,
      example: ENV_EXAMPLE,
      path: envFile
    });
    logger.info(`Loaded environment from ${envFile}`);
  } catch (error) {
    logger.error(`Failed to load environment file: ${error.message}`);
    throw new Error(`Environment file error: ${error.message}`);
  }
} else {
  logger.warn(`No env file found at ${envFile}. Using process.env`);
}

// Validate critical environment variables
const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) {
  logger.error('BASE_URL is not defined in environment variables');
  throw new Error('BASE_URL is required');
}

// Reporter configuration
const getReporters = (isCI) => {
  const commonReporters = [
    ['allure-playwright', { outputFolder: 'reports/allure', suiteTitle: false }]
  ];

  return isCI
    ? [
        ['dot'],
        ['github'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
        ...commonReporters
      ]
    : [
        ['list', { printSteps: true }],
        ['html', { outputFolder: 'reports/html', open: 'on-failure' }],
        ...commonReporters
      ];
};

// Parse and validate environment variables
const parseEnvNumber = (value, defaultValue, name) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    logger.warn(`Invalid ${name}: ${value}. Using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
};

const parseEnvFloat = (value, defaultValue, name) => {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    logger.warn(`Invalid ${name}: ${value}. Using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
};

export default defineConfig({
  testDir: './src/tests',
  testMatch: ['**/*.js'],
  testIgnore: ['**/test-assets/**', '**/*.unit.test.js'], // Avoid confusion with unit tests
  globalSetup: join(__dirname, 'globalSetup.js'),
  globalTeardown: join(__dirname, 'globalTeardown.js'),

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI
    ? parseEnvNumber(process.env.WORKERS, DEFAULTS.WORKERS, 'WORKERS')
    : undefined,
  maxFailures: process.env.CI ? DEFAULTS.MAX_FAILURES : undefined,

  shard: process.env.CI
    ? {
        total: parseEnvNumber(process.env.CI_SHARD_TOTAL, 1, 'CI_SHARD_TOTAL'),
        current: parseEnvNumber(process.env.CI_SHARD_INDEX, 1, 'CI_SHARD_INDEX')
      }
    : undefined,

  timeout: parseEnvNumber(process.env.TEST_TIMEOUT, DEFAULTS.TEST_TIMEOUT, 'TEST_TIMEOUT'),
  expect: {
    timeout: parseEnvNumber(process.env.EXPECT_TIMEOUT, DEFAULTS.EXPECT_TIMEOUT, 'EXPECT_TIMEOUT'),
    toHaveScreenshot: {
      maxDiffPixels: parseEnvNumber(
        process.env.SCREENSHOT_MAX_DIFF_PIXELS,
        DEFAULTS.SCREENSHOT_MAX_DIFF_PIXELS,
        'SCREENSHOT_MAX_DIFF_PIXELS'
      )
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: parseEnvFloat(
        process.env.SNAPSHOT_MAX_DIFF_PIXEL_RATIO,
        DEFAULTS.SNAPSHOT_MAX_DIFF_PIXEL_RATIO,
        'SNAPSHOT_MAX_DIFF_PIXEL_RATIO'
      )
    }
  },

  outputDir: 'test-results',
  reporter: getReporters(!!process.env.CI),

  use: {
    baseURL: BASE_URL,
    storageState: process.env.STORAGE_STATE || 'test-results/storageState.json',
    colorScheme: process.env.COLOR_SCHEME || 'light',
    locale: process.env.LOCALE || 'en-US',
    timezoneId: process.env.TIMEZONE || 'UTC',
    geolocation: (() => {
      const lat = parseFloat(process.env.GEOLOCATION_LATITUDE);
      const lon = parseFloat(process.env.GEOLOCATION_LONGITUDE);
      return lat && lon && !isNaN(lat) && !isNaN(lon)
        ? { latitude: lat, longitude: lon }
        : undefined;
    })(),
    permissions: process.env.GEOLOCATION_LATITUDE ? ['geolocation'] : undefined,
    offline: process.env.OFFLINE === 'true',
    javaScriptEnabled:
      process.env.JAVASCRIPT_ENABLED === 'false' ? false : DEFAULTS.JAVASCRIPT_ENABLED,
    acceptDownloads: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    testIdAttribute: process.env.TEST_ID_ATTRIBUTE || 'data-test-id',
    headless: process.env.HEADLESS === 'false' ? false : DEFAULTS.HEADLESS,
    extraHTTPHeaders: process.env.API_KEY
      ? { Authorization: `Bearer ${process.env.API_KEY}` }
      : undefined,
    launchOptions: {
      slowMo: parseEnvNumber(process.env.SLOWMO, DEFAULTS.SLOWMO, 'SLOWMO')
    },
    actionTimeout: parseEnvNumber(
      process.env.ACTION_TIMEOUT,
      DEFAULTS.EXPECT_TIMEOUT,
      'ACTION_TIMEOUT'
    )
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**global.setup.js'
    },
    {
      name: 'teardown',
      testMatch: '**global.teardown.js'
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.ui.spec.js'
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/*.ui.spec.js'
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/*.ui.spec.js'
    },
    {
      name: 'api',
      use: {}, // No browser for API tests
      testMatch: '**/*.api.spec.js'
    },
    {
      name: 'unit',
      use: {}, // No browser for unit tests
      testMatch: '**/*.unit.spec.js'
    }
  ]
});
=======
const { devices } = require('@playwright/test');
const path = require('path');
require('dotenv-safe').config({
  path: path.resolve(process.cwd(), '.env'),
  example: path.resolve(process.cwd(), '.env.example'),
  allowEmptyValues: true,
  silent: true,
});

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
module.exports = {
  testDir: path.resolve(process.cwd(), 'src/tests'),
  timeout: parseInt(process.env.TIMEOUT) || 30000,
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT) || 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : parseInt(process.env.RETRIES) || 1,
  workers: process.env.CI ? 4 : process.env.WORKERS || '50%',
  reporter: [
    ['list'],
    ['html', { outputFolder: path.resolve(process.cwd(), 'reports/html') }],
    ['allure-playwright', { outputFolder: path.resolve(process.cwd(), 'allure-results') }],
    ['json', { outputFile: path.resolve(process.cwd(), 'reports/test-results.json') }],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: process.env.TRACE_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
    screenshot:
      process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
    headless: process.env.HEADLESS === 'true',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],
  globalSetup: path.resolve(process.cwd(), 'src/utils/setup/globalSetup.js'),
  globalTeardown: path.resolve(process.cwd(), 'src/utils/setup/globalTeardown.js'),
  outputDir: path.resolve(process.cwd(), 'test-results'),
};
>>>>>>> 51948a2 (Main v1.0)
