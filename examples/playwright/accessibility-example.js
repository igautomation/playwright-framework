/**
 * Example demonstrating how to use PlaywrightService for accessibility testing
 */
const path = require('path');
const fs = require('fs');
const { PlaywrightService } = require('../../src/utils/common');

// Create output directory for examples
const outputDir = path.join(__dirname, 'output');

// Create a simple HTML file with accessibility issues for testing
function createTestHtml() {
  const htmlPath = path.join(outputDir, 'accessibility-test.html');
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Accessibility Test Page</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .low-contrast { color: #aaa; background-color: #eee; padding: 10px; }
        button { padding: 10px; }
      </style>
    </head>
    <body>
      <h1>Accessibility Test Page</h1>
      
      <!-- Missing alt text -->
      <img src="https://playwright.dev/img/playwright-logo.svg" width="200">
      
      <!-- Low contrast text -->
      <p class="low-contrast">This text has low contrast and may be difficult to read.</p>
      
      <!-- Empty button -->
      <button></button>
      
      <!-- Good example -->
      <img src="https://playwright.dev/img/playwright-logo.svg" alt="Playwright Logo" width="200">
      <button>Submit</button>
      
      <div role="table">
        <div role="row">
          <div role="cell">Cell 1</div>
          <div role="cell">Cell 2</div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

async function runAccessibilityExamples() {
  console.log('Running Playwright accessibility examples...');
  
  // Initialize PlaywrightService
  const playwrightService = new PlaywrightService({
    outputDir
  });
  
  try {
    // Create test HTML file
    const testHtmlPath = createTestHtml();
    const testHtmlUrl = `file://${testHtmlPath}`;
    
    // Example 1: Run accessibility audit on test page
    console.log('Example 1: Running accessibility audit on test page...');
    const auditResults = await playwrightService.runAccessibilityAudit(
      testHtmlUrl,
      {
        reportPath: path.join(outputDir, 'accessibility-report.json')
      }
    );
    
    console.log(`Accessibility audit completed. Found ${auditResults.issues.length} issues.`);
    console.log('Issues:');
    auditResults.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.type}: ${issue.message}`);
    });
    
    // Example 2: Run accessibility audit on Playwright docs
    console.log('\nExample 2: Running accessibility audit on Playwright docs...');
    const docsAuditResults = await playwrightService.runAccessibilityAudit(
      'https://playwright.dev/docs/accessibility-testing',
      {
        waitForSelector: 'article',
        reportPath: path.join(outputDir, 'playwright-docs-accessibility.json')
      }
    );
    
    console.log(`Docs accessibility audit completed. Found ${docsAuditResults.issues.length} issues.`);
    if (docsAuditResults.issues.length > 0) {
      console.log('Top 3 issues:');
      docsAuditResults.issues.slice(0, 3).forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.type}: ${issue.message}`);
      });
    }
    
    console.log('\nAll accessibility examples completed successfully!');
    console.log(`Reports saved to: ${path.join(outputDir, 'accessibility-report.json')}`);
  } catch (error) {
    console.error('Error running accessibility examples:', error);
  }
}

// Run the examples
runAccessibilityExamples().catch(console.error);