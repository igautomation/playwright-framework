/**
 * Advanced tests for PlaywrightErrorHandler utility
 * Focuses on improving branch coverage
 */
const { test, expect } = require('@playwright/test');
const PlaywrightErrorHandler = require('../../utils/common/errorHandler');

test.describe('PlaywrightErrorHandler Advanced', () => {
  test('should handle navigation errors', async () => {
    // Create a navigation error
    const navError = new Error('Navigation failed');
    navError.name = 'NavigationError';
    
    // Handle the error with context
    const enhancedError = PlaywrightErrorHandler.handleError(navError, {
      url: 'https://example.com/page'
    });
    
    // Verify enhanced error
    expect(enhancedError.message).toContain('Playwright navigation error');
    expect(enhancedError.message).toContain('https://example.com/page');
    expect(enhancedError.code).toBe('PLAYWRIGHT_NAVIGATION');
  });
  
  test('should handle API errors', async () => {
    // Create an API error
    const apiError = new Error('API request failed');
    apiError.name = 'ApiError';
    
    // Handle the error with context
    const enhancedError = PlaywrightErrorHandler.handleError(apiError, {
      endpoint: '/api/users',
      method: 'POST',
      statusCode: 400,
      api: true
    });
    
    // Verify enhanced error
    expect(enhancedError.message).toContain('API error (400)');
    expect(enhancedError.message).toContain('/api/users');
    expect(enhancedError.code).toBe('API_ERROR');
  });
  
  test('should handle assertion errors', async () => {
    // Create an assertion error
    const assertError = new Error('Expected true to be false');
    assertError.name = 'AssertionError';
    
    // Handle the error with context
    const enhancedError = PlaywrightErrorHandler.handleError(assertError, {
      assertion: true,
      expected: true,
      actual: false
    });
    
    // Verify enhanced error
    expect(enhancedError.message).toContain('Assertion failed');
    expect(enhancedError.code).toBe('ASSERTION_ERROR');
  });
  
  test('should use exponential backoff for retries', async () => {
    // Create a function that fails multiple times
    let attempts = 0;
    const flaky = () => {
      attempts++;
      if (attempts <= 3) {
        throw new Error('Flaky operation failed');
      }
      return 'success';
    };
    
    // Wrap with retry using exponential backoff
    const retryable = PlaywrightErrorHandler.withRetry(flaky, {
      maxRetries: 4,
      retryDelay: 5,
      exponentialBackoff: true
    });
    
    // Execute and verify
    const result = await retryable();
    expect(result).toBe('success');
    expect(attempts).toBe(4);
  });
  
  test('should respect custom retry condition', async () => {
    // Create a function that throws different errors
    let attempts = 0;
    const flaky = () => {
      attempts++;
      if (attempts === 1) {
        const error = new Error('retry me');
        error.code = 'RETRY';
        throw error;
      } else if (attempts === 2) {
        const error = new Error('do not retry');
        error.code = 'NO_RETRY';
        throw error;
      }
      return 'success';
    };
    
    // Custom retry condition
    const retryCondition = (error) => error.message.includes('retry me');
    
    // Wrap with retry
    const retryable = PlaywrightErrorHandler.withRetry(flaky, {
      maxRetries: 3,
      retryDelay: 5,
      retryCondition
    });
    
    // Execute and verify it stops at the second error
    try {
      await retryable();
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('do not retry');
      expect(attempts).toBe(2);
    }
  });
});