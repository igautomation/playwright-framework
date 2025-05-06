const logger = require('./logger');

/**
 * Enhanced error handler for Playwright operations
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
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;
    const retryCondition = options.retryCondition || (error => true);
    
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
          
          // Wait before retrying
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
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
    return async (...args) => {
      return new Promise(async (resolve, reject) => {
        // Set timeout
        const timeoutId = setTimeout(() => {
          const timeoutError = new Error(`Operation timed out after ${timeoutMs}ms`);
          timeoutError.name = 'TimeoutError';
          timeoutError.timeout = timeoutMs;
          reject(this.handleError(timeoutError, {
            ...context,
            action: context.action || 'custom operation'
          }));
        }, timeoutMs);
        
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
}

module.exports = PlaywrightErrorHandler;