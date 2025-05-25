/**
 * Example script demonstrating how to use the reporting utilities
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const { 
  generateHtmlReport, 
  generateMarkdownReport, 
  processPlaywrightResults 
} = require('../src/utils/reporting/reportingUtils');

async function runExample() {
  console.log('Starting reporting example...');
  
  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Run some tests
    const testResults = await runSampleTests(page);
    
    // Generate HTML report
    const htmlReportPath = await generateHtmlReport({
      results: testResults,
      outputDir: path.join(process.cwd(), 'reports', 'html'),
      title: 'Example HTML Report'
    });
    console.log(`HTML report generated at: ${htmlReportPath}`);
    
    // Generate Markdown report
    const mdReportPath = await generateMarkdownReport({
      results: testResults,
      reportPath: path.join(process.cwd(), 'reports', 'markdown', 'example-report.md')
    });
    console.log(`Markdown report generated at: ${mdReportPath}`);
    
    console.log('Reporting example completed successfully!');
  } catch (error) {
    console.error('Error running reporting example:', error);
  } finally {
    await browser.close();
  }
}

/**
 * Run sample tests for demonstration
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Array} Test results
 */
async function runSampleTests(page) {
  // Sample test suite
  const testSuite = {
    name: 'Example Test Suite',
    tests: []
  };
  
  // Test 1: Navigate to Playwright website
  console.log('Running test: Navigate to Playwright website');
  const startTime1 = Date.now();
  try {
    await page.goto('https://playwright.dev');
    await page.waitForSelector('h1');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Take screenshot
    const screenshotPath = path.join(process.cwd(), 'reports', 'screenshots', 'playwright-home.png');
    await page.screenshot({ path: screenshotPath });
    
    // Add passed test
    testSuite.tests.push({
      name: 'Should navigate to Playwright website',
      status: 'passed',
      duration: Date.now() - startTime1,
      screenshots: [{ path: screenshotPath, name: 'Playwright Homepage' }]
    });
  } catch (error) {
    // Add failed test
    testSuite.tests.push({
      name: 'Should navigate to Playwright website',
      status: 'failed',
      duration: Date.now() - startTime1,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
  
  // Test 2: Check for documentation link
  console.log('Running test: Check for documentation link');
  const startTime2 = Date.now();
  try {
    const docsLink = await page.getByRole('link', { name: /docs/i });
    await docsLink.click();
    await page.waitForURL(/.*docs.*/);
    
    // Take screenshot
    const screenshotPath = path.join(process.cwd(), 'reports', 'screenshots', 'playwright-docs.png');
    await page.screenshot({ path: screenshotPath });
    
    // Add passed test
    testSuite.tests.push({
      name: 'Should navigate to documentation',
      status: 'passed',
      duration: Date.now() - startTime2,
      screenshots: [{ path: screenshotPath, name: 'Playwright Docs' }]
    });
  } catch (error) {
    // Add failed test
    testSuite.tests.push({
      name: 'Should navigate to documentation',
      status: 'failed',
      duration: Date.now() - startTime2,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
  
  // Test 3: Simulate a skipped test
  testSuite.tests.push({
    name: 'Skipped test example',
    status: 'skipped',
    duration: 0
  });
  
  return [testSuite];
}

// Run the example if this script is executed directly
if (require.main === module) {
  // Create screenshots directory
  const screenshotsDir = path.join(process.cwd(), 'reports', 'screenshots');
  const fs = require('fs');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  runExample().catch(console.error);
}

module.exports = { runExample };