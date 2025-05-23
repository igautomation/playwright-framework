/**
 * Enhanced error handler for Playwright operations
 */
const logger = require('./logger');
const config = require('../../config');

/**
 * Error handler for Playwright operations
 */
class PlaywrightErrorHandler {
  /**
   * Handle Playwright errors with detailed context
   * @param {Error} error - The error object
   * @param {Object} context - Additional context information
   * @returns {Error} Enhanced error object
   */
  static handleError(error, context = {}) {
    // Extract useful information from the error
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    };
    
    // Handle specific error types
    if (error.name === 'TimeoutError') {
      logger.error('Playwright timeout error', {
        ...errorInfo,
        timeout: error.timeout,
        action: context.action || 'unknown action'
      });
      
      // Create a more descriptive error
      const enhancedError = new Error(
        `Playwright timeout (${error.timeout}ms) while ${context.action || 'performing operation'}: ${error.message}`
      );
      enhancedError.originalError = error;
      enhancedError.code = 'PLAYWRIGHT_TIMEOUT';
      enhancedError.context = context;
      return enhancedError;
    }
    
    if (error.name === 'SelectorError' || error.message.includes('selector')) {
      logger.error('Playwright selector error', {
        ...errorInfo,
        selector: context.selector || 'unknown selector'
      });
      
      // Create a more descriptive error
      const enhancedError = new Error(
        `Playwright selector error with "${context.selector || 'unknown selector'}": ${error.message}`
      );
      enhancedError.originalError = error;
      enhancedError.code = 'PLAYWRIGHT_SELECTOR';
      enhancedError.context = context;
      return enhancedError;
    }
    
    if (error.name === 'NavigationError' || error.message.includes('navigation')) {
      logger.error('Playwright navigation error', {
        ...errorInfo,
        url: context.url || 'unknown URL'
      });
      
      // Create a more descriptive error
      const enhancedError = new Error(
        `Playwright navigation error to "${context.url || 'unknown URL'}": ${error.message}`
      );
      enhancedError.originalError = error;
      enhancedError.code = 'PLAYWRIGHT_NAVIGATION';
      enhancedError.context = context;
      return enhancedError;
    }
    
    if (error.name === 'ApiError' || context.api) {
      logger.error('API request error', {
        ...errorInfo,
        endpoint: context.endpoint || 'unknown endpoint',
        method: context.method || 'unknown method',
        statusCode: context.statusCode
      });
      
      // Create a more descriptive error
      const enhancedError = new Error(
        `API error ${context.statusCode ? `(${context.statusCode})` : ''} with "${context.endpoint || 'unknown endpoint'}": ${error.message}`
      );
      enhancedError.originalError = error;
      enhancedError.code = 'API_ERROR';
      enhancedError.context = context;
      return enhancedError;
    }
    
    if (error.name === 'AssertionError' || context.assertion) {
      logger.error('Assertion error', {
        ...errorInfo,
        expected: context.expected,
        actual: context.actual
      });
      
      // Create a more descriptive error
      const enhancedError = new Error(
        `Assertion failed: ${error.message}`
      );
      enhancedError.originalError = error;
      enhancedError.code = 'ASSERTION_ERROR';
      enhancedError.context = context;
      return enhancedError;
    }
    
    // Default error handling
    logger.error('Playwright error', errorInfo);
    
    // Create a generic enhanced error
    const enhancedError = new Error(`Playwright error: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.code = 'PLAYWRIGHT_ERROR';
    enhancedError.context = context;
    return enhancedError;
  }
  
  /**
   * Create a retry wrapper for Playwright operations
   * @param {Function} fn - Function to retry
   * @param {Object} options - Retry options
   * @returns {Function} Wrapped function with retry logic
   */
  static withRetry(fn, options = {}) {
    const maxRetries = options.maxRetries || config.retry?.maxRetries || 3;
    const retryDelay = options.retryDelay || config.retry?.retryDelay || 1000;
    const retryCondition = options.retryCondition || (error => true);
    const exponentialBackoff = options.exponentialBackoff || config.retry?.exponentialBackoff || false;
    
    return async (...args) => {
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn(...args);
        } catch (error) {
          lastError = error;
          
          // Check if we should retry this error
          if (!retryCondition(error)) {
            throw this.handleError(error, { 
              ...options.context,
              attempt,
              maxRetries
            });
          }
          
          // Log retry attempt
          logger.warn(`Playwright operation failed, retrying (${attempt}/${maxRetries})`, {
            error: error.message,
            attempt,
            maxRetries
          });
          
          // Wait before retrying with optional exponential backoff
          if (attempt < maxRetries) {
            const delay = exponentialBackoff 
              ? retryDelay * Math.pow(2, attempt - 1) 
              : retryDelay;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If we get here, all retries failed
      throw this.handleError(lastError, {
        ...options.context,
        attempt: maxRetries,
        maxRetries,
        retriesFailed: true
      });
    };
  }
  
  /**
   * Create a timeout wrapper for Playwright operations
   * @param {Function} fn - Function to wrap with timeout
   * @param {number} timeoutMs - Timeout in milliseconds
   * @param {Object} context - Additional context information
   * @returns {Function} Wrapped function with timeout
   */
  static withTimeout(fn, timeoutMs, context = {}) {
    const timeout = timeoutMs || config.timeouts?.default || 30000;
    
    return async (...args) => {
      return new Promise(async (resolve, reject) => {
        // Set timeout
        const timeoutId = setTimeout(() => {
          const timeoutError = new Error(`Operation timed out after ${timeout}ms`);
          timeoutError.name = 'TimeoutError';
          timeoutError.timeout = timeout;
          reject(this.handleError(timeoutError, {
            ...context,
            action: context.action || 'custom operation'
          }));
        }, timeout);
        
        try {
          // Run the function
          const result = await fn(...args);
          clearTimeout(timeoutId);
          resolve(result);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(this.handleError(error, context));
        }
      });
    };
  }
  
  /**
   * Create a graceful degradation wrapper for Playwright operations
   * @param {Function} fn - Function to wrap
   * @param {Function} fallbackFn - Fallback function to call on error
   * @param {Object} context - Additional context information
   * @returns {Function} Wrapped function with graceful degradation
   */
  static withGracefulDegradation(fn, fallbackFn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        // Log the error but continue with fallback
        logger.warn('Playwright operation failed, using fallback', {
          error: error.message,
          ...context
        });
        
        // Call fallback function
        return await fallbackFn(...args, error);
      }
    };
  }
  
  /**
   * Create a self-healing wrapper for Playwright operations
   * @param {Function} fn - Function to wrap
   * @param {Object} options - Self-healing options
   * @returns {Function} Wrapped function with self-healing capability
   */
  static withSelfHealing(fn, options = {}) {
    const alternativeSelectors = options.alternativeSelectors || [];
    const healingStrategies = options.healingStrategies || ['relaxed', 'nearest', 'fuzzy'];
    
    return async (...args) => {
      try {
        // Try with original selector
        return await fn(...args);
      } catch (error) {
        // Only attempt healing for selector errors
        if (error.name !== 'SelectorError' && !error.message.includes('selector')) {
          throw error;
        }
        
        logger.warn('Selector failed, attempting self-healing', {
          originalSelector: options.selector,
          error: error.message
        });
        
        // Try alternative selectors if provided
        if (alternativeSelectors.length > 0) {
          for (const altSelector of alternativeSelectors) {
            try {
              // Replace the selector in args
              const newArgs = [...args];
              newArgs[0] = altSelector; // Assuming selector is first arg
              
              logger.info(`Trying alternative selector: ${altSelector}`);
              return await fn(...newArgs);
            } catch (altError) {
              // Continue to next alternative
            }
          }
        }
        
        // If we get here, all alternatives failed
        throw this.handleError(error, {
          ...options.context,
          selector: options.selector,
          alternativeSelectors,
          selfHealingFailed: true
        });
      }
    };
  }
  
  /**
   * Create a performance measurement wrapper for Playwright operations
   * @param {Function} fn - Function to wrap
   * @param {string} operationName - Name of the operation
   * @param {Object} options - Options
   * @returns {Function} Wrapped function with performance measurement
   */
  static withPerformanceMeasurement(fn, operationName, options = {}) {
    return async (...args) => {
      const startTime = Date.now();
      let result;
      
      try {
        result = await fn(...args);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        logger.info(`Performance: ${operationName} completed in ${duration}ms`, {
          operation: operationName,
          durationMs: duration,
          ...options
        });
        
        return result;
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        logger.error(`Performance: ${operationName} failed after ${duration}ms`, {
          operation: operationName,
          durationMs: duration,
          error: error.message,
          ...options
        });
        
        throw this.handleError(error, {
          ...options,
          operation: operationName,
          durationMs: duration
        });
      }
    };
  }
}

module.exports = PlaywrightErrorHandler;