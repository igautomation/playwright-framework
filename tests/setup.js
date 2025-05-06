/**
 * Jest setup file
 */

// Increase timeout for all tests
jest.setTimeout(60000);

// Mock console.log and console.error to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Mock logger to prevent logging during tests
jest.mock('../src/utils/common/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));