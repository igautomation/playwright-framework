/**
 * Example demonstrating how to use PlaywrightService for trace capture and debugging
 */
const path = require('path');
const { PlaywrightService } = require('../../src/utils/common');

// Create output directory for examples
const outputDir = path.join(__dirname, 'output');

async function runTraceExamples() {
  console.log('Running Playwright trace examples...');
  
  // Initialize PlaywrightService
  const playwrightService = new PlaywrightService({
    outputDir
  });
  
  try {
    // Example 1: Capture trace of a simple interaction
    console.log('Example 1: Capturing trace of a simple interaction...');
    const tracePath = await playwrightService.captureTrace(
      async (page) => {
        // Navigate to Playwright docs
        await page.goto('https://playwright.dev/docs/trace-viewer');
        
        // Wait for content to load
        await page.waitForSelector('article');
        
        // Click on a link
        await page.click('a:has-text("Recording")');
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        
        // Fill a search input
        const searchInput = await page.$('input[type="search"]');
        if (searchInput) {
          await searchInput.fill('screenshot');
          await page.waitForTimeout(1000); // Wait for search results
        }
        
        // Return some data from the page
        return {
          title: await page.title(),
          url: page.url()
        };
      },
      {
        path: path.join(outputDir, 'simple-interaction-trace.zip'),
        screenshots: true,
        snapshots: true
      }
    );
    
    console.log(`Trace saved to: ${tracePath}`);
    console.log('To view the trace, run:');
    console.log(`npx playwright show-trace ${tracePath}`);
    
    // Example 2: Capture trace of an error scenario
    console.log('\nExample 2: Capturing trace of an error scenario...');
    try {
      await playwrightService.captureTrace(
        async (page) => {
          // Navigate to Playwright docs
          await page.goto('https://playwright.dev/docs');
          
          // Try to click a non-existent element (will cause an error)
          await page.click('#non-existent-element', { timeout: 5000 });
        },
        {
          path: path.join(outputDir, 'error-scenario-trace.zip'),
          screenshots: true,
          snapshots: true
        }
      );
    } catch (error) {
      console.log(`Error captured as expected: ${error.message}`);
      console.log('Trace saved to:', path.join(outputDir, 'error-scenario-trace.zip'));
      console.log('This trace contains the error state and can be used for debugging.');
    }
    
    // Example 3: Capture trace with custom error handling
    console.log('\nExample 3: Capturing trace with custom error handling...');
    const customTracePath = await playwrightService.captureTrace(
      async (page) => {
        try {
          // Navigate to Playwright docs
          await page.goto('https://playwright.dev/docs');
          
          // Try to click elements with increasing timeouts
          const elements = ['#first-try', '#second-try', '#third-try'];
          
          for (const selector of elements) {
            try {
              await page.click(selector, { timeout: 1000 });
              console.log(`Successfully clicked: ${selector}`);
            } catch (clickError) {
              console.log(`Failed to click ${selector}: ${clickError.message}`);
              // Continue with next element
            }
          }
          
          // Take a screenshot even if some steps failed
          await page.screenshot({ path: path.join(outputDir, 'partial-success.png') });
          
          return { status: 'completed with some errors' };
        } catch (pageError) {
          // Log the error but don't throw, so trace is still saved
          console.error('Page error:', pageError.message);
          return { status: 'failed', error: pageError.message };
        }
      },
      {
        path: path.join(outputDir, 'custom-error-handling-trace.zip'),
        screenshots: true,
        snapshots: true
      }
    );
    
    console.log(`Custom error handling trace saved to: ${customTracePath}`);
    
    console.log('\nAll trace examples completed!');
    console.log('To view any trace, use the Playwright trace viewer:');
    console.log('npx playwright show-trace <path-to-trace.zip>');
  } catch (error) {
    console.error('Error running trace examples:', error);
  }
}

// Run the examples
runTraceExamples().catch(console.error);