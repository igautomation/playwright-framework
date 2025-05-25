/**
 * Common Utilities Index
 * 
 * Exports all common utilities for easy importing
 */
const logger = require('./logger');
const PlaywrightService = require('./playwrightService');
const PlaywrightUtils = require('./playwrightUtils');
const PlaywrightErrorHandler = require('./errorHandler');
const RetryWithBackoff = require('./retryWithBackoff');
const dataUtils = require('./dataUtils');
const dataOrchestrator = require('./dataOrchestrator');
const TestDataFactory = require('./testDataFactory');

module.exports = {
  logger,
  PlaywrightService,
  PlaywrightUtils,
  PlaywrightErrorHandler,
  RetryWithBackoff,
  dataUtils,
  dataOrchestrator,
  TestDataFactory
};