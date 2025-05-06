/**
 * Example demonstrating how to use PlaywrightService for responsive design testing
 */
const path = require('path');
const fs = require('fs');
const { PlaywrightService } = require('../../src/utils/common');

// Create output directory for examples
const outputDir = path.join(__dirname, 'output');

// Create a simple HTML file with responsive design issues for testing
function createResponsiveTestHtml() {
  const htmlPath = path.join(outputDir, 'responsive-test.html');
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Responsive Design Test Page</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        
        /* Fixed width element that may cause horizontal overflow on mobile */
        .fixed-width {
          width: 600px;
          background-color: #f0f0f0;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        /* Small tap target */
        .small-button {
          width: 30px;
          height: 30px;
          background-color: #0066cc;
          color: white;
          border: none;
          cursor: pointer;
        }
        
        /* Responsive element */
        .responsive-element {
          width: 100%;
          max-width: 800px;
          background-color: #e0e0e0;
          padding: 20px;
          box-sizing: border-box;
        }
        
        /* Media query example */
        @media (max-width: 768px) {
          .responsive-element {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <h1>Responsive Design Test Page</h1>
      
      <!-- Fixed width element that may cause issues on mobile -->
      <div class="fixed-width">
        <h2>Fixed Width Element</h2>
        <p>This element has a fixed width of 600px and may cause horizontal scrolling on mobile devices.</p>
      </div>
      
      <!-- Small tap target -->
      <div>
        <h2>Small Tap Target</h2>
        <p>This button is too small for comfortable tapping on mobile:</p>
        <button class="small-button">+</button>
      </div>
      
      <!-- Responsive element -->
      <div class="responsive-element">
        <h2>Responsive Element</h2>
        <p>This element is responsive and should adapt to different screen sizes.</p>
      </div>
      
      <!-- Long text that might overflow -->
      <div>
        <h2>Long Text</h2>
        <p style="word-break: break-all;">
          ThisIsAVeryLongTextWithoutAnySpacesWhichMightCauseLayoutIssuesOnSmallerScreensIfNotProperlyHandledWithCSSProperties
        </p>
      </div>
    </body>
    </html>
  `;
  
  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

async function runResponsiveExamples() {
  console.log('Running Playwright responsive design testing examples...');
  
  // Initialize PlaywrightService
  const playwrightService = new PlaywrightService({
    outputDir
  });
  
  try {
    // Create test HTML file
    const testHtmlPath = createResponsiveTestHtml();
    const testHtmlUrl = `file://${testHtmlPath}`;
    
    // Example 1: Test responsiveness on custom test page
    console.log('Example 1: Testing responsiveness on custom test page...');
    const testResults = await playwrightService.testResponsiveness(
      testHtmlUrl,
      [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 }
      ]
    );
    
    // Save results to file
    fs.writeFileSync(
      path.join(outputDir, 'responsive-test-results.json'),
      JSON.stringify(testResults, null, 2)
    );
    
    // Display results
    console.log('\nResponsive testing results:');
    testResults.forEach(result => {
      console.log(`\nDevice: ${result.device} (${result.viewport.width}x${result.viewport.height})`);
      console.log(`Screenshot: ${path.basename(result.screenshotPath)}`);
      console.log(`Layout issues: ${result.layoutIssues.length}`);
      
      if (result.layoutIssues.length > 0) {
        console.log('Issues:');
        result.layoutIssues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.type}: ${issue.message}`);
        });
      }
    });
    
    // Example 2: Test responsiveness on Playwright docs
    console.log('\nExample 2: Testing responsiveness on Playwright docs...');
    const docsResults = await playwrightService.testResponsiveness(
      'https://playwright.dev/docs/intro',
      [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 }
      ],
      {
        waitForSelector: 'article'
      }
    );
    
    // Save results to file
    fs.writeFileSync(
      path.join(outputDir, 'playwright-docs-responsive-results.json'),
      JSON.stringify(docsResults, null, 2)
    );
    
    // Display results
    console.log('\nPlaywright docs responsive testing results:');
    docsResults.forEach(result => {
      console.log(`\nDevice: ${result.device} (${result.viewport.width}x${result.viewport.height})`);
      console.log(`Screenshot: ${path.basename(result.screenshotPath)}`);
      console.log(`Layout issues: ${result.layoutIssues.length}`);
    });
    
    console.log('\nAll responsive testing examples completed successfully!');
    console.log(`Results saved to: ${outputDir}`);
  } catch (error) {
    console.error('Error running responsive testing examples:', error);
  }
}

// Run the examples
runResponsiveExamples().catch(console.error);