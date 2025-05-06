/**
 * Tests for PlaywrightErrorHandler
 */
const { PlaywrightErrorHandler } = require('../../../src/utils/common');

describe('PlaywrightErrorHandler', () => {
  describe('handleError', () => {
    it('should enhance error with context information', () => {
      const originalError = new Error('Original error message');
      const context = { action: 'test action', selector: '#test' };
      
      const enhancedError = PlaywrightErrorHandler.handleError(originalError, context);
      
      expect(enhancedError.message).toContain('Playwright error');
      expect(enhancedError.originalError).toBe(originalError);
      expect(enhancedError.context).toEqual(context);
      expect(enhancedError.code).toBe('PLAYWRIGHT_ERROR');
    });
    
    it('should handle timeout errors specifically', () => {
      const timeoutError = new Error('Timeout of 5000ms exceeded');
      timeoutError.name = 'TimeoutError';
      timeoutError.timeout = 5000;
      
      const context = { action: 'waiting for element', selector: '#test' };
      
      const enhancedError = PlaywrightErrorHandler.handleError(timeoutError, context);
      
      expect(enhancedError.message).toContain('Playwright timeout');
      expect(enhancedError.message).toContain('5000ms');
      expect(enhancedError.message).toContain('waiting for element');
      expect(enhancedError.code).toBe('PLAYWRIGHT_TIMEOUT');
    });
    
    it('should handle selector errors specifically', () => {
      const selectorError = new Error('Error: failed to find element matching selector "#missing"');
      const context = { selector: '#missing' };
      
      const enhancedError = PlaywrightErrorHandler.handleError(selectorError, context);
      
      expect(enhancedError.message).toContain('Playwright selector error');
      expect(enhancedError.message).toContain('#missing');
      expect(enhancedError.code).toBe('PLAYWRIGHT_SELECTOR');
    });
  });
  
  describe('withRetry', () => {
    it('should retry a failing function until success', async () => {
      let attempts = 0;
      const flakeyFunction = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Intentional failure');
        }
        return 'success';
      });
      
      const retryableFunction = PlaywrightErrorHandler.withRetry(flakeyFunction, {
        maxRetries: 3,
        retryDelay: 10 // Short delay for tests
      });
      
      const result = await retryableFunction();
      
      expect(result).toBe('success');
      expect(flakeyFunction).toHaveBeenCalledTimes(3);
    });
    
    it('should throw after max retries', async () => {
      const failingFunction = jest.fn().mockImplementation(() => {
        throw new Error('Always fails');
      });
      
      const retryableFunction = PlaywrightErrorHandler.withRetry(failingFunction, {
        maxRetries: 2,
        retryDelay: 10
      });
      
      await expect(retryableFunction()).rejects.toThrow();
      expect(failingFunction).toHaveBeenCalledTimes(2);
    });
    
    it('should respect retry condition', async () => {
      const mixedFunction = jest.fn().mockImplementation(() => {
        throw { name: 'TestError', retryable: false };
      });
      
      const retryableFunction = PlaywrightErrorHandler.withRetry(mixedFunction, {
        maxRetries: 3,
        retryDelay: 10,
        retryCondition: error => error.retryable !== false
      });
      
      await expect(retryableFunction()).rejects.toThrow();
      expect(mixedFunction).toHaveBeenCalledTimes(1); // No retries due to condition
    });
  });
  
  describe('withTimeout', () => {
    it('should resolve if function completes within timeout', async () => {
      const fastFunction = jest.fn().mockResolvedValue('quick result');
      
      const timeoutFunction = PlaywrightErrorHandler.withTimeout(fastFunction, 1000);
      const result = await timeoutFunction();
      
      expect(result).toBe('quick result');
      expect(fastFunction).toHaveBeenCalledTimes(1);
    });
    
    it('should reject if function exceeds timeout', async () => {
      const slowFunction = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve('slow result'), 500);
        });
      });
      
      const timeoutFunction = PlaywrightErrorHandler.withTimeout(slowFunction, 100, {
        action: 'slow operation'
      });
      
      await expect(timeoutFunction()).rejects.toThrow(/timed out/);
      expect(slowFunction).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('withGracefulDegradation', () => {
    it('should use primary function when it succeeds', async () => {
      const primaryFunction = jest.fn().mockResolvedValue('primary result');
      const fallbackFunction = jest.fn().mockResolvedValue('fallback result');
      
      const gracefulFunction = PlaywrightErrorHandler.withGracefulDegradation(
        primaryFunction,
        fallbackFunction
      );
      
      const result = await gracefulFunction('arg1', 'arg2');
      
      expect(result).toBe('primary result');
      expect(primaryFunction).toHaveBeenCalledWith('arg1', 'arg2');
      expect(fallbackFunction).not.toHaveBeenCalled();
    });
    
    it('should use fallback function when primary fails', async () => {
      const primaryFunction = jest.fn().mockRejectedValue(new Error('primary failed'));
      const fallbackFunction = jest.fn().mockResolvedValue('fallback result');
      
      const gracefulFunction = PlaywrightErrorHandler.withGracefulDegradation(
        primaryFunction,
        fallbackFunction
      );
      
      const result = await gracefulFunction('arg1', 'arg2');
      
      expect(result).toBe('fallback result');
      expect(primaryFunction).toHaveBeenCalledWith('arg1', 'arg2');
      expect(fallbackFunction).toHaveBeenCalled();
      // The fallback should receive the original args plus the error
      expect(fallbackFunction.mock.calls[0][0]).toBe('arg1');
      expect(fallbackFunction.mock.calls[0][1]).toBe('arg2');
      expect(fallbackFunction.mock.calls[0][2].message).toBe('primary failed');
    });
  });
});