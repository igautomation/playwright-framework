/**
 * Tests for PlaywrightErrorHandler
 */
const PlaywrightErrorHandler = require('../../../src/utils/common/errorHandler');

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
    
    it('should handle API errors specifically', () => {
      const apiError = new Error('API request failed with status 404');
      const context = { api: true, endpoint: '/users', method: 'GET', statusCode: 404 };
      
      const enhancedError = PlaywrightErrorHandler.handleError(apiError, context);
      
      expect(enhancedError.message).toContain('API error');
      expect(enhancedError.message).toContain('404');
      expect(enhancedError.message).toContain('/users');
      expect(enhancedError.code).toBe('API_ERROR');
    });
    
    it('should handle assertion errors specifically', () => {
      const assertionError = new Error('Expected value to equal received value');
      const context = { assertion: true, expected: 'foo', actual: 'bar' };
      
      const enhancedError = PlaywrightErrorHandler.handleError(assertionError, context);
      
      expect(enhancedError.message).toContain('Assertion failed');
      expect(enhancedError.code).toBe('ASSERTION_ERROR');
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
    
    it('should support exponential backoff', async () => {
      jest.useFakeTimers();
      
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
        retryDelay: 100,
        exponentialBackoff: true
      });
      
      const promise = retryableFunction();
      
      // First attempt fails immediately
      expect(flakeyFunction).toHaveBeenCalledTimes(1);
      
      // First retry should happen after 100ms
      jest.advanceTimersByTime(100);
      expect(flakeyFunction).toHaveBeenCalledTimes(2);
      
      // Second retry should happen after 200ms (exponential)
      jest.advanceTimersByTime(200);
      expect(flakeyFunction).toHaveBeenCalledTimes(3);
      
      const result = await promise;
      expect(result).toBe('success');
      
      jest.useRealTimers();
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
      jest.useFakeTimers();
      
      const slowFunction = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve('slow result'), 500);
        });
      });
      
      const timeoutFunction = PlaywrightErrorHandler.withTimeout(slowFunction, 100, {
        action: 'slow operation'
      });
      
      const promise = timeoutFunction();
      
      jest.advanceTimersByTime(101);
      
      await expect(promise).rejects.toThrow(/timed out/);
      expect(slowFunction).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
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
  
  describe('withSelfHealing', () => {
    it('should try alternative selectors when primary selector fails', async () => {
      const primaryFunction = jest.fn()
        .mockImplementationOnce(() => { throw new Error('selector error'); })
        .mockImplementationOnce(() => 'success');
      
      const healingFunction = PlaywrightErrorHandler.withSelfHealing(primaryFunction, {
        selector: '#primary',
        alternativeSelectors: ['#alternative1', '#alternative2']
      });
      
      const result = await healingFunction('#primary');
      
      expect(result).toBe('success');
      expect(primaryFunction).toHaveBeenCalledTimes(2);
      expect(primaryFunction.mock.calls[0][0]).toBe('#primary');
      expect(primaryFunction.mock.calls[1][0]).toBe('#alternative1');
    });
    
    it('should throw if all selectors fail', async () => {
      const primaryFunction = jest.fn().mockImplementation(() => {
        throw new Error('selector error');
      });
      
      const healingFunction = PlaywrightErrorHandler.withSelfHealing(primaryFunction, {
        selector: '#primary',
        alternativeSelectors: ['#alternative1', '#alternative2']
      });
      
      await expect(healingFunction('#primary')).rejects.toThrow();
      expect(primaryFunction).toHaveBeenCalledTimes(3);
    });
    
    it('should only attempt healing for selector errors', async () => {
      const primaryFunction = jest.fn().mockImplementation(() => {
        throw new Error('non-selector error');
      });
      
      const healingFunction = PlaywrightErrorHandler.withSelfHealing(primaryFunction, {
        selector: '#primary',
        alternativeSelectors: ['#alternative1']
      });
      
      await expect(healingFunction('#primary')).rejects.toThrow();
      expect(primaryFunction).toHaveBeenCalledTimes(1); // No healing attempted
    });
  });
  
  describe('withPerformanceMeasurement', () => {
    it('should measure function execution time', async () => {
      jest.spyOn(console, 'info').mockImplementation(() => {});
      
      const testFunction = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'result';
      });
      
      const measuredFunction = PlaywrightErrorHandler.withPerformanceMeasurement(
        testFunction,
        'Test Operation'
      );
      
      const result = await measuredFunction('arg1');
      
      expect(result).toBe('result');
      expect(testFunction).toHaveBeenCalledWith('arg1');
      expect(console.info).toHaveBeenCalled();
      
      // Check that the log contains the operation name
      const logCall = console.info.mock.calls[0][0];
      expect(logCall).toContain('Test Operation');
      
      console.info.mockRestore();
    });
    
    it('should log errors with timing information', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const testFunction = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Operation failed');
      });
      
      const measuredFunction = PlaywrightErrorHandler.withPerformanceMeasurement(
        testFunction,
        'Failed Operation'
      );
      
      await expect(measuredFunction()).rejects.toThrow();
      
      expect(console.error).toHaveBeenCalled();
      
      // Check that the log contains the operation name and error
      const logCall = console.error.mock.calls[0][0];
      expect(logCall).toContain('Failed Operation');
      expect(logCall).toContain('failed');
      
      console.error.mockRestore();
    });
  });
});