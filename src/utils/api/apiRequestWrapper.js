/**
 * API Request Wrapper
 * 
 * Wraps API requests to ensure headers are consistently applied
 */

const { getApiHeaders } = require('./apiHeaderProvider');

/**
 * Wraps the Playwright request context to ensure headers are applied
 * @param {import('@playwright/test').APIRequestContext} request - Playwright request context
 * @returns {import('@playwright/test').APIRequestContext} - Wrapped request context
 */
function wrapRequest(request) {
  const headers = getApiHeaders();
  
  // Create a proxy to intercept all method calls
  return new Proxy(request, {
    get(target, prop) {
      // If the property is a method we want to wrap (HTTP methods)
      if (['get', 'post', 'put', 'delete', 'patch', 'head', 'fetch'].includes(prop)) {
        return function(...args) {
          // Get the original method
          const originalMethod = target[prop];
          
          // For HTTP methods, ensure we add our headers
          if (typeof args[1] === 'object') {
            // If options object exists, add our headers
            args[1] = {
              ...args[1],
              headers: {
                ...headers,
                ...(args[1].headers || {})
              }
            };
          } else if (args.length === 1) {
            // If only URL is provided, add options with our headers
            args.push({ headers });
          }
          
          // Call the original method with our modified arguments
          return originalMethod.apply(target, args);
        };
      }
      
      // For other properties, return as is
      return target[prop];
    }
  });
}

module.exports = {
  wrapRequest
};