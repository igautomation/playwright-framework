/**
 * Example demonstrating how to use PlaywrightErrorHandler for robust error handling
 */
const path = require('path');
const { PlaywrightService, PlaywrightErrorHandler } = require('../../src/utils/common');

// Create output directory for examples
const outputDir = path.join(__dirname, 'output');

async function runErrorHandlingExamples() {
  console.log('Running Playwright error handling examples...');
  
  // Initialize PlaywrightService
  const playwrightService = new PlaywrightService({
    outputDir
  });
  
  // Example 1: Basic error handling
  console.log('\nExample 1: Basic error handling');
  try {
    await playwrightService.captureScreenshot(
      'https://non-existent-website-12345.com',
      { timeout: 5000 }
    );
  } catch (error) {
    console.log('Caught error:', error.message);
    
    // Use PlaywrightErrorHandler to enhance the error
    const enhancedError = PlaywrightErrorHandler.handleError(error, {
      action: 'capturing screenshot',
      url: 'https://non-existent-website-12345.com'
    });
    
    console.log('Enhanced error:', enhancedError.message);
    console.log('Error code:', enhancedError.code);
  }
  
  // Example 2: Retry mechanism
  console.log('\nExample 2: Retry mechanism');
  
  // Create a function that fails the first two times
  let attempts = 0;
  const flakeyFunction = async () => {
    attempts++;
    if (attempts < 3) {
      console.log(`Attempt ${attempts}: Failing intentionally...`);
      throw new Error('Intentional failure');
    }
    console.log(`Attempt ${attempts}: Success!`);
    return 'Operation succeeded on attempt ' + attempts;
  };
  
  // Wrap with retry logic
  const retryableFunction = PlaywrightErrorHandler.withRetry(flakeyFunction, {
    maxRetries: 3,
    retryDelay: 1000,
    context: { operation: 'flakeyFunction' }
  });
  
  try {
    const result = await retryableFunction();
    console.log('Result:', result);
  } catch (error) {
    console.log('All retries failed:', error.message);
  }
  
  // Example 3: Timeout wrapper
  console.log('\nExample 3: Timeout wrapper');
  
  // Create a function that takes too long
  const slowFunction = async () => {
    console.log('Starting slow operation...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    return 'Slow operation completed';
  };
  
  // Wrap with timeout
  const timeoutFunction = PlaywrightErrorHandler.withTimeout(slowFunction, 2000, {
    action: 'slow operation'
  });
  
  try {
    const result = await timeoutFunction();
    console.log('Result:', result);
  } catch (error) {
    console.log('Operation timed out:', error.message);
    console.log('Error code:', error.code);
  }
  
  // Example 4: Graceful degradation
  console.log('\nExample 4: Graceful degradation');
  
  // Create a function that will fail
  const unreliableFunction = async () => {
    console.log('Attempting unreliable operation...');
    throw new Error('Unreliable operation failed');
  };
  
  // Create a fallback function
  const fallbackFunction = async (originalArgs, error) => {
    console.log('Using fallback due to error:', error.message);
    return 'Fallback result';
  };
  
  // Wrap with graceful degradation
  const gracefulFunction = PlaywrightErrorHandler.withGracefulDegradation(
    unreliableFunction,
    fallbackFunction,
    { operation: 'unreliable operation' }
  );
  
  try {
    const result = await gracefulFunction();
    console.log('Result:', result);
  } catch (error) {
    console.log('Both main and fallback failed:', error.message);
  }
  
  // Example 5: Real-world Playwright example with error handling
  console.log('\nExample 5: Real-world Playwright example with error handling');
  
  // Create a function that attempts to capture a screenshot with error handling
  const captureScreenshotSafely = async (url, selector) => {
    // Use withRetry for the entire operation
    const retryableCapture = PlaywrightErrorHandler.withRetry(
      async () => {
        const browser = await playwrightService.launchBrowser();
        
        try {
          const page = await browser.newPage();
          
          // Navigate with timeout handling
          await PlaywrightErrorHandler.withTimeout(
            async () => await page.goto(url, { waitUntil: 'networkidle' }),
            10000,
            { action: 'navigation', url }
          )();
          
          // Try to find the element, with graceful degradation to full page screenshot
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            const element = await page.$(selector);
            
            if (element) {
              return await element.screenshot({
                path: path.join(outputDir, 'safe-element-screenshot.png')
              });
            } else {
              throw new Error(`Element not found: ${selector}`);
            }
          } catch (selectorError) {
            console.log(`Selector "${selector}" not found, falling back to full page screenshot`);
            return await page.screenshot({
              path: path.join(outputDir, 'safe-fallback-screenshot.png'),
              fullPage: true
            });
          }
        } finally {
          await browser.close();
        }
      },
      {
        maxRetries: 2,
        retryDelay: 1000,
        context: { action: 'screenshot capture', url, selector }
      }
    );
    
    return await retryableCapture();
  };
  
  try {
    console.log('Attempting to capture screenshot with robust error handling...');
    const screenshotPath = await captureScreenshotSafely(
      'https://playwright.dev',
      '#non-existent-element'
    );
    console.log('Screenshot captured (with fallback):', screenshotPath);
  } catch (error) {
    console.log('All attempts failed:', error.message);
  }
  
  console.log('\nAll error handling examples completed!');
}

// Run the examples
runErrorHandlingExamples().catch(console.error);