/**
 * Example demonstrating how to use PlaywrightService for PDF generation
 */
const path = require('path');
const { PlaywrightService } = require('../../src/utils/common');

// Create output directory for examples
const outputDir = path.join(__dirname, 'output');

async function runPdfExamples() {
  console.log('Running Playwright PDF examples...');
  
  // Initialize PlaywrightService
  const playwrightService = new PlaywrightService({
    outputDir
  });
  
  try {
    // Example 1: Generate basic PDF
    console.log('Example 1: Generating basic PDF...');
    const basicPdf = await playwrightService.generatePdf(
      'https://playwright.dev/docs/api/class-page',
      {
        path: path.join(outputDir, 'playwright-docs-basic.pdf'),
        waitForSelector: 'article'
      }
    );
    console.log(`Basic PDF saved to: ${basicPdf}`);
    
    // Example 2: Generate PDF with custom formatting
    console.log('Example 2: Generating PDF with custom formatting...');
    const formattedPdf = await playwrightService.generatePdf(
      'https://playwright.dev/docs/api/class-page',
      {
        path: path.join(outputDir, 'playwright-docs-formatted.pdf'),
        format: 'A4',
        margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; font-family: Arial;">
            Playwright Documentation
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 8px; text-align: center; width: 100%; font-family: Arial;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
            <span style="margin-left: 20px;">Generated on ${new Date().toLocaleDateString()}</span>
          </div>
        `,
        waitForSelector: 'article'
      }
    );
    console.log(`Formatted PDF saved to: ${formattedPdf}`);
    
    // Example 3: Generate PDF in landscape mode
    console.log('Example 3: Generating PDF in landscape mode...');
    const landscapePdf = await playwrightService.generatePdf(
      'https://playwright.dev/docs/api/class-page',
      {
        path: path.join(outputDir, 'playwright-docs-landscape.pdf'),
        format: 'A4',
        landscape: true,
        printBackground: true,
        waitForSelector: 'article'
      }
    );
    console.log(`Landscape PDF saved to: ${landscapePdf}`);
    
    console.log('All PDF examples completed successfully!');
  } catch (error) {
    console.error('Error running PDF examples:', error);
  }
}

// Run the examples
runPdfExamples().catch(console.error);