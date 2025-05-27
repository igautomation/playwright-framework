/**
 * Tests for Logger utility
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const os = require('os');
const logger = require('../../utils/common/logger');

// Create temp directory for test artifacts
const tempDir = path.join(os.tmpdir(), `playwright-logger-tests-${Date.now()}`);
const logDir = path.join(tempDir, 'logs');

// Setup and teardown
test.beforeAll(() => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
});

test.afterAll(() => {
  // Clean up temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test.describe('Logger', () => {
  test('should create log file when file logging is enabled', async () => {
    // Create a custom logger for testing
    const Logger = logger.constructor;
    const testLogger = new Logger({
      logDir,
      console: false,
      file: true,
      level: 'info'
    });
    
    // Create a specific log file for this test
    const testLogFile = path.join(logDir, 'test-file.log');
    testLogger.logFile = testLogFile;
    
    // Log a message
    testLogger.info('Test log message');
    
    // Verify log file was created
    expect(fs.existsSync(testLogFile)).toBeTruthy();
    
    // Verify log content
    const content = fs.readFileSync(testLogFile, 'utf8');
    expect(content).toContain('[INFO] Test log message');
  });
  
  test('should respect log level', async () => {
    // Create a custom logger for testing
    const Logger = logger.constructor;
    const testLogger = new Logger({
      logDir,
      console: false,
      file: true,
      level: 'warn'
    });
    
    // Create unique log file for this test
    const testLogFile = path.join(logDir, 'test-level.log');
    testLogger.logFile = testLogFile;
    
    // Log messages at different levels
    testLogger.debug('Debug message');
    testLogger.info('Info message');
    testLogger.warn('Warning message');
    testLogger.error('Error message');
    
    // Verify log content
    const content = fs.readFileSync(testLogFile, 'utf8');
    expect(content).not.toContain('Debug message');
    expect(content).not.toContain('Info message');
    expect(content).toContain('Warning message');
    expect(content).toContain('Error message');
  });
  
  test('should format log messages correctly', async () => {
    // Create a custom logger for testing
    const Logger = logger.constructor;
    const testLogger = new Logger({
      logDir,
      console: false,
      file: false
    });
    
    // Test format method directly
    const formattedMessage = testLogger.formatMessage('error', 'Test error message');
    
    // Verify format
    expect(formattedMessage).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[ERROR\] Test error message$/);
  });
  
  test('should not create log file when file logging is disabled', async () => {
    // Create a custom logger for testing
    const Logger = logger.constructor;
    
    // Create unique log file path
    const testLogFile = path.join(logDir, 'test-disabled.log');
    
    // Create logger with file logging disabled
    const testLogger = new Logger({
      logDir,
      console: false,
      file: false
    });
    
    // Set log file path
    testLogger.logFile = testLogFile;
    
    // Log a message
    testLogger.info('This should not be logged to file');
    
    // Verify log file was not created
    expect(fs.existsSync(testLogFile)).toBeFalsy();
  });
});