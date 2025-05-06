/**
 * Example demonstrating how to use PlaywrightService for screenshot capture
 */
const path = require('path');
const { PlaywrightService } = require('../../src/utils/common');

// Create output directory for examples
const outputDir = path.join(__dirname, 'output');

async function runScreenshotExamples() {
  console.log('Running Playwright screenshot examples...');
  
  // Initialize PlaywrightService
  const playwrightService = new PlaywrightService({
    outputDir
  });
  
  try {
    // Example 1: Capture full page screenshot
    console.log('Example 1: Capturing full page screenshot...');
    const fullPageScreenshot = await playwrightService.captureScreenshot(
      'https://playwright.dev',
      {
        path: path.join(outputDir, 'playwright-homepage.png'),
        fullPage: true,
        waitForSelector: 'nav'
      }
    );
    console.log(`Full page screenshot saved to: ${fullPageScreenshot}`);
    
    // Example 2: Capture element screenshot
    console.log('Example 2: Capturing element screenshot...');
    const elementScreenshot = await playwrightService.captureElementScreenshot(
      'https://playwright.dev',
      'nav',
      {
        path: path.join(outputDir, 'playwright-nav.png')
      }
    );
    console.log(`Element screenshot saved to: ${elementScreenshot}`);
    
    // Example 3: Capture screenshot with custom viewport
    console.log('Example 3: Capturing screenshot with mobile viewport...');
    const mobileScreenshot = await playwrightService.captureScreenshot(
      'https://playwright.dev',
      {
        path: path.join(outputDir, 'playwright-mobile.png'),
        viewport: { width: 375, height: 667 },
        waitForSelector: 'nav'
      }
    );
    console.log(`Mobile screenshot saved to: ${mobileScreenshot}`);
    
    console.log('All screenshot examples completed successfully!');
  } catch (error) {
    console.error('Error running screenshot examples:', error);
  }
}

// Run the examples
runScreenshotExamples().catch(console.error);